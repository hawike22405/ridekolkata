import test from 'node:test';import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';import jwt from 'jsonwebtoken';import request from 'supertest';
import { fixture } from '../test-support/ride-fixture.js';
import { haversineMeters,durationSeconds,rideSummary } from '../src/telemetry/math.js';
import { LIMITS,pingInput,dateRange } from '../src/telemetry/contracts.js';
import { issueRideToken,verifyRideToken } from '../src/telemetry/tokens.js';
import { RideSession } from '../src/telemetry/model.js';
import { historyPipeline,livePipeline } from '../src/telemetry/analytics.js';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';

test('Haversine handles identical, known arc, date line and antipodal positions',()=>{
 assert.equal(haversineMeters([0,0],[0,0]),0);
 assert.ok(Math.abs(haversineMeters([0,0],[1,0])-111195.0802)<0.001);
 assert.ok(Math.abs(haversineMeters([179.9,0],[-179.9,0])-22239.016)<0.01);
 assert.ok(Number.isFinite(haversineMeters([0,90],[0,-90])));
 assert.throws(()=>haversineMeters([181,0],[0,0]));
});
test('duration includes stationary time and rejects reversed or invalid intervals',()=>{
 assert.equal(durationSeconds('2026-01-01T00:00:00Z','2026-01-01T00:01:00Z'),60);
 assert.throws(()=>durationSeconds('bad',new Date()));assert.throws(()=>durationSeconds(1000,0));
});
test('ping schema rejects strings, invalid coordinates, missing accuracy and extra fields',()=>{
 const f=fixture(),p=f.ping(1);
 for(const bad of [{...p,sequence:'1'},{...p,coordinates:[0,91]},{...p,accuracyMeters:51},{...p,accuracyMeters:0},{...p,extra:true},{...p,coordinates:[Infinity,0]}])assert.equal(pingInput.safeParse(bad).success,false);
});
test('a new ride has no fake location, path, speed or measured distance',async()=>{
 const f=fixture(),r=await f.start();assert.equal(r.ride.lastPosition,null);assert.equal(r.ride.distanceMeters,null);assert.equal(r.ride.currentSpeedKmh,null);assert.equal(r.ride.averageSpeedKmh,null);assert.equal(f.record().path,undefined);assert.equal(f.record().samples.length,0);
});
test('start requires a configured enabled route and idempotent request details',async()=>{
 const f=fixture(),body={requestId:randomUUID(),riderRef:randomUUID(),routeId:f.routeId};
 await assert.rejects(f.service.start({...body,routeId:'0'.repeat(24)},f.adminId),e=>e.code==='ROUTE_UNAVAILABLE');
 const first=await f.service.start(body,f.adminId),second=await f.service.start(body,f.adminId);assert.equal(second.created,false);assert.equal(first.ride.id,second.ride.id);
 await assert.rejects(f.service.start({...body,riderRef:randomUUID()},f.adminId),e=>e.code==='REQUEST_CONFLICT');
});
test('accepted pings compute speed and form a LineString only after movement',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(1000);
 await f.service.ingest(accessToken,f.ping(1));assert.equal(f.record().path,undefined);
 f.advance(1000);await f.service.ingest(accessToken,f.ping(2));assert.equal(f.record().path,undefined);
 f.advance(1000);const result=await f.service.ingest(accessToken,f.ping(3,[0.0001,0]));
 assert.equal(f.record().path.type,'LineString');assert.equal(f.record().path.coordinates.length,2);
 assert.ok(Math.abs(result.ride.currentSpeedKmh-40.0302289)<0.001);
 assert.ok(Math.abs(result.ride.averageSpeedKmh-20.0151144)<0.001);
 assert.equal(result.ride.durationSeconds,3);
});
test('repeated last ping is idempotent; changed or skipped sequence fails',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(1000);const ping=f.ping(1);
 await f.service.ingest(accessToken,ping);assert.equal((await f.service.ingest(accessToken,ping)).duplicate,true);assert.equal(f.record().sampleCount,1);
 await assert.rejects(f.service.ingest(accessToken,{...ping,coordinates:[0.001,0]}),e=>e.code==='SEQUENCE_CONFLICT');
 await assert.rejects(f.service.ingest(accessToken,f.ping(3)),e=>e.code==='SEQUENCE_CONFLICT');
});
test('server receive rate and client capture-time order are both enforced',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(1000);const first=f.ping(1);await f.service.ingest(accessToken,first);
 f.advance(100);await assert.rejects(f.service.ingest(accessToken,f.ping(2)),e=>e.code==='PING_RATE');
 f.advance(900);await assert.rejects(f.service.ingest(accessToken,{...f.ping(2),capturedAt:first.capturedAt}),e=>e.code==='TIME_ORDER');
});
test('timestamps before ride, future timestamps and stale uploads are rejected',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(1000);
 for(const capturedAt of [new Date(f.clock().getTime()+1000).toISOString(),new Date(f.clock()-2000).toISOString()])await assert.rejects(f.service.ingest(accessToken,{...f.ping(1),capturedAt}),e=>e.code==='TIMESTAMP_REJECTED');
 f.advance(40000);await assert.rejects(f.service.ingest(accessToken,{...f.ping(1),capturedAt:new Date(f.clock()-31000).toISOString()}),e=>e.code==='TIMESTAMP_REJECTED');
});
test('implausible jumps are rejected and gaps do not invent speed or distance',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(1000);await f.service.ingest(accessToken,f.ping(1));
 f.advance(1000);await assert.rejects(f.service.ingest(accessToken,f.ping(2,[1,1])),e=>e.code==='IMPLAUSIBLE_SPEED');
 f.advance(31000);const r=await f.service.ingest(accessToken,f.ping(2,[0.001,0.001]));assert.equal(r.ride.distanceMeters,0);assert.equal(r.ride.currentSpeedKmh,null);assert.equal(r.ride.gapSeconds,32);assert.equal(f.record().samples[1].gapBefore,true);
});
test('current speed becomes unknown when GPS is stale',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(1000);await f.service.ingest(accessToken,f.ping(1));f.advance(1000);await f.service.ingest(accessToken,f.ping(2));
 assert.equal((await f.service.current(accessToken)).currentSpeedKmh,0);f.advance(31000);const r=await f.service.current(accessToken);assert.equal(r.currentSpeedKmh,null);assert.equal(r.trackingFresh,false);
});
test('concurrent writes cannot double count a sample',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(1000);const ping=f.ping(1);
 const results=await Promise.allSettled([f.service.ingest(accessToken,ping),f.service.ingest(accessToken,ping)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(f.record().sampleCount,1);assert.equal(f.record().samples.length,1);
 assert.equal((await f.service.ingest(accessToken,ping)).duplicate,true);
});
test('token replacement revokes the old capability',async()=>{
 const f=fixture(),old=await f.start(),next=await f.service.rotate(old.ride.id);f.advance(1000);
 await assert.rejects(f.service.ingest(old.accessToken,f.ping(1)),e=>e.code==='TOKEN_REVOKED');assert.equal((await f.service.ingest(next.accessToken,f.ping(1))).ride.sampleCount,1);
});
test('closed rides reject new pings and finish is idempotent',async()=>{
 const f=fixture(),{accessToken}=await f.start();f.advance(5000);const first=await f.service.finish({token:accessToken});assert.equal(first.durationSeconds,5);assert.equal(first.status,'completed');
 assert.deepEqual(await f.service.finish({token:accessToken}),first);await assert.rejects(f.service.ingest(accessToken,f.ping(1)),e=>e.code==='RIDE_NOT_ACTIVE');
});
test('admin closes expired rides at the hard duration cap',async()=>{
 const f=fixture(),r=await f.start();f.advance(LIMITS.maxDurationMs+1000);const ended=await f.service.finish({id:r.ride.id});assert.equal(ended.status,'expired');assert.equal(ended.durationSeconds,86400);
});
test('sample cap is explicit and never truncates existing history',async()=>{
 const f=fixture(),r=await f.start();f.record().sampleCount=LIMITS.maxSamples;f.record().lastSequence=LIMITS.maxSamples;f.advance(1000);
 await assert.rejects(f.service.ingest(r.accessToken,f.ping(LIMITS.maxSamples+1)),e=>e.code==='SAMPLE_LIMIT');assert.equal(f.record().sampleCount,LIMITS.maxSamples);
});
test('JWT scope, signature, expiry and secret separation are enforced',async()=>{
 const f=fixture(),r=await f.start();assert.equal(verifyRideToken(r.accessToken,f.secret,f.clock()).sub,r.ride.id);
 assert.throws(()=>verifyRideToken(r.accessToken,'other'.repeat(20),f.clock()));
 assert.throws(()=>verifyRideToken(jwt.sign({sub:r.ride.id,scope:'admin',ver:0},f.secret),f.secret,f.clock()));
 f.advance(3601000);assert.throws(()=>verifyRideToken(r.accessToken,f.secret,f.clock()));
 assert.throws(()=>readConfig({MONGODB_URI:'mongodb://localhost/test',JWT_SECRET:'x'.repeat(64),TELEMETRY_JWT_SECRET:'x'.repeat(64),ALLOWED_ORIGIN:'https://admin.invalid'}));
});
test('ride schema defines geospatial, request-id and single-active-rider indexes',()=>{
 const indexes=RideSession.schema.indexes();assert.ok(indexes.some(([x])=>x.path==='2dsphere'));assert.ok(indexes.some(([x])=>x.lastLocation==='2dsphere'));
 assert.ok(indexes.some(([x,o])=>x.requestId===1&&o.unique));assert.ok(indexes.some(([x,o])=>x.riderRef===1&&o.unique&&o.partialFilterExpression.status==='active'));
});
test('stored geometry cannot be a one-point LineString',async()=>{
 const f=fixture();await f.start();const doc=new RideSession({...f.record(),path:{type:'LineString',coordinates:[[0,0]]}});await assert.rejects(doc.validate());
});
test('history is explicitly bounded, excludes unfinished rides, and groups popular routes',()=>{
 const q={from:'2026-01-01T00:00:00Z',to:'2026-01-02T00:00:00Z'};const p=historyPipeline(q,new Date(q.to));assert.equal(p[0].$match.startedAt.$gte.toISOString(),q.from.replace('Z','.000Z'));
 assert.ok(p[0].$match.$or);assert.ok(p.at(-1).$facet.popularRoutes.some(x=>x.$group));assert.equal(dateRange.safeParse({from:q.from,to:'2026-03-01T00:00:00Z'}).success,false);
});
test('live analytics require both fresh receipt and fresh GPS capture',()=>{
 const p=livePipeline({},new Date('2026-01-01T00:01:00Z'));assert.equal(p[0].$match.lastReceivedAt.$gte.toISOString(),'2026-01-01T00:00:30.000Z');assert.ok(p[0].$match['lastPoint.capturedAt']);assert.ok(p.at(-1).$facet.users);
});
test('real HTTP routes protect ride controls and analytics',async()=>{
 const app=createApp({JWT_SECRET:'x'.repeat(64),TELEMETRY_JWT_SECRET:'y'.repeat(64),ALLOWED_ORIGIN:'https://admin.invalid',TRUST_PROXY_HOPS:0});
 for(const path of ['/api/admin/rides','/api/admin/analytics/rides','/api/admin/analytics/live'])assert.equal((await request(app).get(path)).status,401);
 assert.equal((await request(app).post('/api/admin/rides').send({})).status,401);
 assert.equal((await request(app).get('/api/rides/current')).status,401);
 assert.equal((await request(app).post('/api/rides/finish')).status,401);
});
test('authorization rechecks expiry after asynchronous storage access',async()=>{
 const f=fixture(),r=await f.start(),read=f.repository.read;
 f.repository.read=async id=>{const value=await read(id);f.advance(3601000);return value;};
 await assert.rejects(f.service.authorize(r.accessToken),e=>e.code==='INVALID_RIDE_TOKEN');
});
