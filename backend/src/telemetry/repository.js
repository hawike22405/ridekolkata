import { RideSession } from './model.js';
import { Route } from '../models.js';
const metadata='-samples -path';
export const rideRepository={
  read:id=>RideSession.findById(id).select(metadata).lean(),
  findRequest:requestId=>RideSession.findOne({requestId}).select(metadata).lean(),
  enabledRoute:id=>Route.findOne({_id:id,enabled:true}).select('name').lean(),
  expireRider:(riderRef,now)=>RideSession.updateMany({riderRef,status:'active',expiresAt:{$lte:now}},[{$set:{status:'expired',endedAt:'$expiresAt',lastSpeedKmh:null,version:{$add:['$version',1]},updatedAt:now}}],{updatePipeline:true}),
  create:async value=>(await RideSession.create(value)).toObject(),
  compareAndSet:(ride,update)=>RideSession.findOneAndUpdate({_id:ride._id,version:ride.version,status:'active',tokenVersion:ride.tokenVersion},update,{new:true,runValidators:true,projection:{samples:0,path:0}}).lean(),
  path:id=>RideSession.findById(id).select('path pathVertexCount sampleCount status').lean(),
  samples:(id,after,limit)=>RideSession.findById(id).select({_id:1,sampleCount:1,samples:{$slice:[after,limit]}}).lean(),
  aggregate:pipeline=>RideSession.aggregate(pipeline).option({maxTimeMS:10000}),
};
