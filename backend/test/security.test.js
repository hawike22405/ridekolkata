import test from 'node:test';import assert from 'node:assert/strict';import request from 'supertest';
import {createApp} from '../src/app.js';import {routeInput,pricingInput,point} from '../src/validation.js';import {hashPassword,verifyPassword} from '../src/password.js';import {Route,Pricing,Admin} from '../src/models.js';
const app=createApp({JWT_SECRET:'x'.repeat(64),ALLOWED_ORIGIN:'https://admin.invalid',TRUST_PROXY_HOPS:0});
test('unauthenticated CRUD requests cannot access data',async()=>{for(const method of ['get','post','put','delete']){const res=await request(app)[method]('/api/admin/routes'+(['put','delete'].includes(method)?'/000000000000000000000000':''));assert.equal(res.status,401);}});
test('malformed bearer token is rejected',async()=>{assert.equal((await request(app).get('/api/admin/pricing').set('Authorization','Bearer invalid')).status,401);});
test('foreign browser origin rejected',async()=>{assert.equal((await request(app).get('/api/admin/routes').set('Origin','https://foreign.invalid')).status,403);});
test('JSON syntax errors and oversized bodies are controlled',async()=>{assert.equal((await request(app).post('/api/admin/auth/login').set('Content-Type','application/json').send('{')).status,400);assert.equal((await request(app).post('/api/admin/auth/login').send({email:'x'.repeat(70000)})).status,413);});
test('missing configuration fails instead of inventing routes or tariffs',()=>{assert.equal(routeInput.safeParse({}).success,false);assert.equal(pricingInput.safeParse({}).success,false);assert.equal(new Route().start,undefined);assert.equal(new Route().waypoints,undefined);assert.equal(new Pricing().baseFareMinor,undefined);});
test('numeric strings, nonfinite rates and out-of-range coordinates fail',()=>{assert.equal(pricingInput.shape.baseFareMinor.safeParse('10').success,false);assert.equal(pricingInput.shape.surgeMultiplier.safeParse(Infinity).success,false);assert.equal(point.safeParse({type:'Point',coordinates:[181,0]}).success,false);assert.equal(point.safeParse({type:'Point',coordinates:[0,-91]}).success,false);});
test('unknown fields and query operators fail',()=>{assert.throws(()=>routeInput.parse({$set:{enabled:true}}));assert.throws(()=>new Pricing({unexpected:true}));});
test('password hash verifies and wrong password fails',async()=>{const h=await hashPassword('test-only-long-password');assert.equal(await verifyPassword('test-only-long-password',h),true);assert.equal(await verifyPassword('wrong-password',h),false);});
test('admin email unique index defined and role restricted',async()=>{assert.ok(Admin.schema.indexes().some(([keys,opts])=>keys.email===1&&opts.unique));const a=new Admin({role:'rider'});await assert.rejects(a.validate());});
test('business schema paths do not define fallback defaults',async()=>{
 // Offline schema check only; does not exercise an actual database query.
 assert.equal(Route.schema.path('name').defaultValue,undefined);assert.equal(Pricing.schema.path('surgeMultiplier').defaultValue,undefined);
});
