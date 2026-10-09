import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { ZodError } from 'zod';
import { createApp } from '../src/app.js';
import { visualConfigInput, quaternion, vector3, modelUrl, hexColor } from '../src/visual-contract.js';
import { VisualConfig } from '../src/visual-model.js';
import { visualHandlers, serializeVisualConfig } from '../src/visual-api.js';

// Ephemeral contract-test inputs only: never seeded, served by the application,
// or written to a database. Values exercise the declared lower bounds.
function validInput() {
  return {
    schemaVersion: 1, modelUrl: `https://assets.invalid/${randomUUID()}.glb`,
    modelScale: 0.001, modelRotationQuaternion: [0, 0, 0, 1],
    lightingIntensity: 0, cameraPivotPoints: [{ position: [0, 0, 1], rotationQuaternion: [0, 0, 0, 1] }],
    cameraFov: 10, drivetrainAnimationSpeed: 0,
    hexColors: { background: '#000000', primary: '#000000', accent: '#000000' },
  };
}
function harness(repository) {
  const app = express(); app.use(express.json());
  const h = visualHandlers({ repository });
  app.get('/config', h.read);app.post('/config', h.create);app.put('/config', h.replace);app.delete('/config', h.remove);
  app.use((error, _req, res, _next) => res.status(error instanceof ZodError ? 400 : error.code === 11000 ? 409 : error.status ?? 503).json({error: error.message}));
  return app;
}

test('valid complete configuration preserves every supplied value', () => {
  const input = validInput(); assert.deepEqual(visualConfigInput.parse(input), input);
});
test('all scene fields are explicit, unknown fields are rejected', () => {
  const input = validInput();
  for (const key of Object.keys(input)) { const copy = {...input};delete copy[key];assert.equal(visualConfigInput.safeParse(copy).success, false, key); }
  assert.equal(visualConfigInput.safeParse({...input, unsupported:true}).success,false);
  assert.equal(visualConfigInput.safeParse({...input,hexColors:{...input.hexColors,extra:'#ffffff'}}).success,false);
});
test('numeric strings and nonfinite scene values fail validation', () => {
  for (const key of ['modelScale','lightingIntensity','cameraFov','drivetrainAnimationSpeed']) {
    for (const value of ['1', NaN, Infinity, -Infinity, null]) assert.equal(visualConfigInput.safeParse({...validInput(),[key]:value}).success,false);
  }
});
test('scale, lighting, camera and animation bounds are enforced', () => {
  for (const [key, values] of Object.entries({modelScale:[0,101],lightingIntensity:[-1,21],cameraFov:[0,121],drivetrainAnimationSpeed:[-1,21]})) {
    for (const value of values) assert.equal(visualConfigInput.safeParse({...validInput(),[key]:value}).success,false);
  }
});
test('quaternions have four finite numeric components and unit norm', () => {
  for (const value of [[0,0,0,0],[1,1,1,1],[0,0,1],['0',0,0,1],[0,0,Infinity,1],[0,0,0,0.99]]) assert.equal(quaternion.safeParse(value).success,false);
  assert.equal(quaternion.safeParse([0,0,0,-1]).success,true);
});
test('pivot positions and camera path are bounded and nonempty', () => {
  assert.equal(vector3.safeParse([10001,0,0]).success,false);
  assert.equal(vector3.safeParse([0,0]).success,false);
  assert.equal(visualConfigInput.safeParse({...validInput(),cameraPivotPoints:[]}).success,false);
  assert.equal(visualConfigInput.safeParse({...validInput(),cameraPivotPoints:Array(33).fill(validInput().cameraPivotPoints[0])}).success,false);
});
test('model URLs reject unsafe schemes, traversal and non-model paths', () => {
  for (const value of ['javascript:alert(1)','data:model/gltf-binary;base64,AA','http://assets.invalid/a.glb','//assets.invalid/a.glb','https://name:pass@assets.invalid/a.glb','/a.glb#x','/a/../b.glb','/%2e%2e/b.glb','/a%5cb.glb','https://assets.invalid/a.png']) assert.equal(modelUrl.safeParse(value).success,false,value);
  for(const value of ['/Main%20Cycle.glb','/models/bike.gltf','https://assets.invalid/bike.glb?version=2']) assert.equal(modelUrl.safeParse(value).success,true,value);
});
test('hex colors require exactly six digits', () => {
  for (const value of ['red','#fff','#FFFFFFFF','ffffff','#gggggg']) assert.equal(hexColor.safeParse(value).success,false);
});
test('Mongoose schema rejects missing config and invalid nested values without DB access', async () => {
  assert.equal(new VisualConfig().config,undefined);
  await assert.rejects(new VisualConfig({_id:'current',revision:randomUUID(),config:{...validInput(),modelRotationQuaternion:[0,0,0,0]}}).validate());
  assert.throws(()=>new VisualConfig({_id:'current',unexpected:true}));
});
test('public config returns 404 when unconfigured and never inserts defaults', async () => {
  let writes=0;
  const app=harness({read:async()=>null,create:async()=>{writes++;}});
  assert.equal((await request(app).get('/config')).status,404);assert.equal(writes,0);
});
test('stored malformed config never reaches the client', async () => {
  const app=harness({read:async()=>({config:{modelUrl:'bad'},revision:randomUUID(),updatedAt:new Date()})});
  const result=await request(app).get('/config');assert.equal(result.status,503);assert.equal(result.body.data,undefined);
});
test('DB errors return failure without substituted content', async () => {
  const result=await request(harness({read:async()=>{throw new Error('offline');}})).get('/config');assert.equal(result.status,503);assert.equal(result.body.data,undefined);
});
test('valid public output has exact data, ETag and no database internals', async () => {
  const input=validInput(),revision=randomUUID();const record={config:input,revision,updatedAt:new Date(),_id:'current',__v:0};
  const res=await request(harness({read:async()=>record})).get('/config');assert.equal(res.status,200);assert.deepEqual(res.body.data,input);assert.equal(res.headers.etag,`"${revision}"`);assert.equal(res.headers['cache-control'],'no-store');assert.equal(res.body._id,undefined);assert.equal(res.body.__v,undefined);
});
test('invalid create cannot call persistence', async () => {
  let called=false;const res=await request(harness({create:async()=>{called=true;}})).post('/config').send({});assert.equal(res.status,400);assert.equal(called,false);
});
test('PUT and DELETE require quoted revision and reject stale revisions', async () => {
  const app=harness({replace:async()=>null,remove:async()=>({deletedCount:0})});
  for(const method of ['put','delete']) {
    assert.equal((await request(app)[method]('/config').send(validInput())).status,428);
    assert.equal((await request(app)[method]('/config').set('If-Match','*').send(validInput())).status,400);
    assert.equal((await request(app)[method]('/config').set('If-Match',`"${randomUUID()}"`).send(validInput())).status,409);
  }
});
test('duplicate singleton creation is a conflict', async () => {
  const app=harness({create:async()=>{throw Object.assign(new Error('duplicate'),{code:11000});}});
  assert.equal((await request(app).post('/config').send(validInput())).status,409);
});
test('HTTP writes pass revision and exact input to persistence and expose new revision', async () => {
  const input=validInput(),previous=randomUUID(),next=randomUUID();let seen;
  const app=harness({replace:async(revision,config)=>{seen={revision,config};return {config,revision:next,updatedAt:new Date()};},remove:async revision=>{assert.equal(revision,next);return {deletedCount:1};}});
  const updated=await request(app).put('/config').set('If-Match',`"${previous}"`).send(input);
  assert.equal(updated.status,200);assert.deepEqual(seen,{revision:previous,config:input});assert.equal(updated.headers.etag,`"${next}"`);
  assert.equal((await request(app).delete('/config').set('If-Match',`"${next}"`)).status,204);
});
test('real application protects every admin visual endpoint before DB access', async () => {
  let dbCalls=0;const app=createApp({JWT_SECRET:'x'.repeat(64),ALLOWED_ORIGIN:'https://admin.invalid',TRUST_PROXY_HOPS:0},{ensureDb:async()=>{dbCalls++;}});
  for(const method of ['get','post','put','delete']) assert.equal((await request(app)[method]('/api/admin/visual-config')).status,401);
  assert.equal(dbCalls,0);
});
test('real public endpoint is mounted and fails closed when DB is unavailable', async () => {
  const app=createApp({JWT_SECRET:'x'.repeat(64),ALLOWED_ORIGIN:'https://admin.invalid',TRUST_PROXY_HOPS:0},{ensureDb:async()=>{throw new Error('offline');}});
  const res=await request(app).get('/api/ui/3d-config');assert.equal(res.status,503);assert.equal(res.body.data,undefined);
});
test('unknown response schema versions fail closed', () => {
  assert.throws(()=>serializeVisualConfig({config:{...validInput(),schemaVersion:2},revision:randomUUID(),updatedAt:new Date()}),error=>error.status===503);
});
