import test from 'node:test';import assert from 'node:assert/strict';
import {createServer} from 'node:http';import {once} from 'node:events';
import {io as client} from 'socket.io-client';
import {attachTelemetry} from '../src/telemetry/socket.js';
import {fixture} from '../test-support/ride-fixture.js';
const origin='https://rider.invalid';
async function server(t,service){const http=createServer();const io=attachTelemetry(http,{service,allowedOrigin:origin});http.listen(0,'127.0.0.1');await once(http,'listening');t.after(()=>new Promise(resolve=>io.close(resolve)));return `http://127.0.0.1:${http.address().port}`;}
function connect(t,url,token,requestOrigin=origin){const socket=client(url,{transports:['websocket'],auth:{token},extraHeaders:{Origin:requestOrigin},reconnection:false,timeout:1000,autoConnect:false});t.after(()=>socket.close());return socket;}
const ack=(socket,payload)=>socket.timeout(1500).emitWithAck('telemetry:ping',payload);

test('real websocket accepts scoped telemetry and acknowledges committed sample', {timeout:5000}, async t=>{
 const f=fixture(),r=await f.start(),url=await server(t,f.service),socket=connect(t,url,r.accessToken);
 const ready=once(socket,'connect');socket.connect();await ready;f.advance(1000);
 const response=await ack(socket,f.ping(1));assert.equal(response.ok,true);assert.equal(response.ride.sampleCount,1);assert.equal(f.record().samples.length,1);
});
test('real websocket rejects invalid token and disallowed browser origin',{timeout:5000},async t=>{
 const f=fixture(),r=await f.start(),url=await server(t,f.service);
 const bad=connect(t,url,'invalid'),badResult=once(bad,'connect_error');bad.connect();const [error]=await badResult;assert.equal(error.data.code,'INVALID_RIDE_TOKEN');
 const foreign=connect(t,url,r.accessToken,'https://foreign.invalid'),foreignResult=once(foreign,'connect_error');foreign.connect();await foreignResult;assert.equal(foreign.connected,false);
});
test('socket events recheck revocation after connection',{timeout:5000},async t=>{
 const f=fixture(),r=await f.start(),url=await server(t,f.service),socket=connect(t,url,r.accessToken);
 const ready=once(socket,'connect');socket.connect();await ready;await f.service.rotate(r.ride.id);f.advance(1000);
 const result=await ack(socket,f.ping(1));assert.equal(result.ok,false);assert.equal(result.error.code,'TOKEN_REVOKED');assert.equal(f.record().sampleCount,0);
});
test('malformed websocket payload cannot reach persistence',{timeout:5000},async t=>{
 const f=fixture(),r=await f.start(),url=await server(t,f.service),socket=connect(t,url,r.accessToken);
 const ready=once(socket,'connect');socket.connect();await ready;
 const result=await ack(socket,{sequence:'1'});assert.equal(result.ok,false);assert.equal(result.error.code,'INVALID_PING');assert.equal(f.record().sampleCount,0);
});
test('overlapping websocket events receive backpressure without queueing DB writes',{timeout:5000},async t=>{
 const f=fixture(),r=await f.start();let release,calls=0;
 const service={authorize:f.service.authorize,ingest:async()=>{calls++;await new Promise(resolve=>{release=resolve;});return {duplicate:false};}};
 const url=await server(t,service),socket=connect(t,url,r.accessToken),ready=once(socket,'connect');socket.connect();await ready;
 const first=ack(socket,{});await new Promise(resolve=>setTimeout(resolve,20));
 const second=await ack(socket,{});assert.equal(second.error.code,'BACKPRESSURE');assert.equal(calls,1);release();assert.equal((await first).ok,true);
});
