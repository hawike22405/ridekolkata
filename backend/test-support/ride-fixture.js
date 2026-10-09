import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { createRideService } from '../src/telemetry/service.js';
// Isolated in-memory test adapter; never imported by application startup.
export function fixture() {
  let now=new Date(),record=null;
  const clone=x=>x==null?x:structuredClone(x);
  const routeId=new mongoose.Types.ObjectId().toString(),adminId=new mongoose.Types.ObjectId().toString();
  const repository={
    read:async id=>record&&String(record._id)===id?clone(record):null,
    findRequest:async id=>record?.requestId===id?clone(record):null,
    enabledRoute:async id=>id===routeId?{name:'Contract test route'}:null,
    expireRider:async()=>{},
    create:async value=>{if(record)throw Object.assign(new Error('duplicate'),{code:11000});record={...clone(value),_id:new mongoose.Types.ObjectId().toString()};return clone(record);},
    compareAndSet:async(old,update)=>{
      if(!record||record.version!==old.version||record.tokenVersion!==old.tokenVersion||record.status!=='active')return null;
      for(const [k,v] of Object.entries(update.$set??{}))record[k]=clone(v);
      for(const [k,v] of Object.entries(update.$inc??{}))record[k]+=v;
      for(const [k,v] of Object.entries(update.$push??{})){if(k==='path.coordinates')record.path.coordinates.push(clone(v));else record[k].push(clone(v));}
      return clone(record);
    },
  };
  const secret='test-telemetry-secret-'.repeat(5);
  const service=createRideService({repository,secret,clock:()=>new Date(now)});
  return {service,repository,secret,routeId,adminId,clock:()=>new Date(now),advance:ms=>{now=new Date(now.getTime()+ms);},record:()=>record,
    start:()=>service.start({requestId:randomUUID(),riderRef:randomUUID(),routeId},adminId),
    ping:(sequence,coordinates=[0,0])=>({sequence,coordinates,capturedAt:new Date(now-10).toISOString(),accuracyMeters:5}),
  };
}
