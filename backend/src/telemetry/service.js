import { createHash } from 'node:crypto';
import { objectId } from '../validation.js';
import { LIMITS,pingInput,startInput,fault } from './contracts.js';
import { rideRepository } from './repository.js';
import { segment,rideSummary,haversineMeters } from './math.js';
import { issueRideToken,verifyRideToken } from './tokens.js';
export function createRideService({repository=rideRepository,secret,ensureDb=async()=>{},clock=()=>new Date()}={}) {
  const summarize=ride=>rideSummary(ride,clock());
  function check(ride,claims,now,{allowClosed=false}={}) {
    if(claims.exp<=Math.floor(now.getTime()/1000))throw fault(401,'INVALID_RIDE_TOKEN','Invalid or expired ride token');
    if(!ride)throw fault(404,'RIDE_NOT_FOUND','Ride not found');
    if(ride.tokenVersion!==claims.ver)throw fault(401,'TOKEN_REVOKED','Ride token has been revoked');
    if(!allowClosed&&(ride.status!=='active'||new Date(ride.expiresAt)<=now))throw fault(409,'RIDE_NOT_ACTIVE','Ride is closed or expired');
  }
  async function authorize(token,{allowClosed=false}={}) {
    const claims=verifyRideToken(token,secret,clock());await ensureDb();
    const ride=await repository.read(claims.sub);check(ride,claims,clock(),{allowClosed});return {ride,claims};
  }
  return {
    authorize,
    async start(body,adminId) {
      const input=startInput.parse(body);objectId.parse(String(adminId));
      if(!secret||secret.length<64)throw fault(503,'TELEMETRY_UNAVAILABLE','Telemetry signing key is not configured');
      await ensureDb();
      const existing=await repository.findRequest(input.requestId);
      if(existing) {
        if(String(existing.createdBy)!==String(adminId)||existing.riderRef!==input.riderRef||String(existing.routeId)!==input.routeId)throw fault(409,'REQUEST_CONFLICT','Request ID was already used with different details');
        if(existing.status!=='active'||new Date(existing.expiresAt)<=clock())throw fault(409,'RIDE_NOT_ACTIVE','Previously requested ride has ended');
        return {ride:summarize(existing),...issueRideToken(existing,secret,clock()),created:false};
      }
      const route=await repository.enabledRoute(input.routeId);if(!route)throw fault(422,'ROUTE_UNAVAILABLE','Choose an existing enabled route');
      const now=clock();await repository.expireRider(input.riderRef,now);
      const ride=await repository.create({...input,routeName:route.name,createdBy:adminId,status:'active',startedAt:now,expiresAt:new Date(now.getTime()+LIMITS.maxDurationMs),version:0,tokenVersion:0,lastSequence:0,sampleCount:0,pathVertexCount:0,distanceMeters:0,observedSeconds:0,gapSeconds:0,lastSpeedKmh:null,samples:[]});
      return {ride:summarize(ride),...issueRideToken(ride,secret,clock()),created:true};
    },
    async ingest(token,body) {
      const input=pingInput.parse(body),fingerprint=createHash('sha256').update(JSON.stringify(input)).digest('hex');
      const {ride,claims}=await authorize(token);const now=clock();check(ride,claims,now);
      if(input.sequence===ride.lastSequence&&fingerprint===ride.lastFingerprint)return {duplicate:true,ride:summarize(ride)};
      if(input.sequence!==ride.lastSequence+1)throw fault(409,'SEQUENCE_CONFLICT',`Expected sequence ${ride.lastSequence+1}; read current ride before retrying`);
      if(ride.sampleCount>=LIMITS.maxSamples)throw fault(409,'SAMPLE_LIMIT','Ride reached its sample limit; finish this ride');
      const capturedAt=new Date(input.capturedAt);
      if(capturedAt<new Date(ride.startedAt)||capturedAt>now||now-capturedAt>LIMITS.maxAgeMs)throw fault(422,'TIMESTAMP_REJECTED','Ping time must be within this ride and the last 30 seconds, never in the future');
      if(ride.lastReceivedAt&&now-new Date(ride.lastReceivedAt)<LIMITS.minIntervalMs)throw fault(429,'PING_RATE','Wait at least 250 ms between accepted pings');
      const delta=segment(ride.lastPoint,input);
      const sample={...input,capturedAt,receivedAt:now,gapBefore:delta.gapBefore};
      const changed=!ride.lastPoint||haversineMeters(ride.lastPoint.coordinates,input.coordinates)>0.000001;
      const update={$set:{lastPoint:sample,lastLocation:{type:'Point',coordinates:input.coordinates},lastReceivedAt:now,lastFingerprint:fingerprint,lastSequence:input.sequence,lastSpeedKmh:delta.speedKmh},$inc:{version:1,sampleCount:1,distanceMeters:delta.distanceMeters,observedSeconds:delta.observedSeconds,gapSeconds:delta.gapSeconds},$push:{samples:sample}};
      if(ride.lastPoint&&changed) {
        if(ride.pathVertexCount===0) {update.$set.path={type:'LineString',coordinates:[ride.lastPoint.coordinates,input.coordinates]};update.$inc.pathVertexCount=2;}
        else {update.$push['path.coordinates']=input.coordinates;update.$inc.pathVertexCount=1;}
      }
      const saved=await repository.compareAndSet(ride,update);
      if(!saved)throw fault(409,'WRITE_CONFLICT','Ride changed during ingestion; retry the same ping');
      return {duplicate:false,ride:summarize(saved)};
    },
    async current(token) { const {ride}=await authorize(token,{allowClosed:true});return summarize(ride); },
    async adminRead(id) {objectId.parse(id);await ensureDb();const ride=await repository.read(id);if(!ride)throw fault(404,'RIDE_NOT_FOUND','Ride not found');return summarize(ride);},
    async rotate(id) {
      objectId.parse(id);await ensureDb();const ride=await repository.read(id);
      if(!ride||ride.status!=='active'||new Date(ride.expiresAt)<=clock())throw fault(409,'RIDE_NOT_ACTIVE','Ride is closed or expired');
      const saved=await repository.compareAndSet(ride,{$inc:{version:1,tokenVersion:1}});
      if(!saved)throw fault(409,'WRITE_CONFLICT','Ride changed; retry token rotation');
      return {ride:summarize(saved),...issueRideToken(saved,secret,clock())};
    },
    async finish({id,token}) {
      const claims=token?verifyRideToken(token,secret,clock()):null;
      const rideId=claims?claims.sub:objectId.parse(id);await ensureDb();
      for(let attempt=0;attempt<3;attempt++) {
        const ride=await repository.read(rideId);if(!ride)throw fault(404,'RIDE_NOT_FOUND','Ride not found');
        if(claims)check(ride,claims,clock(),{allowClosed:true});
        if(ride.status!=='active')return summarize(ride);
        const now=clock(),expired=new Date(ride.expiresAt)<=now,endedAt=expired?new Date(ride.expiresAt):now;
        const saved=await repository.compareAndSet(ride,{$set:{status:expired?'expired':'completed',endedAt,lastSpeedKmh:null},$inc:{version:1}});
        if(saved)return summarize(saved);
      }
      throw fault(409,'WRITE_CONFLICT','Ride is receiving updates; retry finishing');
    },
  };
}
