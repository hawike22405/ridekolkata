import { objectId } from '../validation.js';
import { emptyInput,samplesInput,fault } from './contracts.js';
import { rideRepository } from './repository.js';
import { analyticsHandlers } from './analytics.js';
const bearer=req=>{
  const value=req.get('Authorization');
  if(!value?.startsWith('Bearer '))throw fault(401,'RIDE_TOKEN_REQUIRED','Ride token required');
  return value.slice(7);
};
export function mountRiderApi(app,service) {
  app.get('/api/rides/current',async(req,res)=>res.json({ride:await service.current(bearer(req))}));
  app.post('/api/rides/finish',async(req,res)=>{emptyInput.parse(req.body??{});res.json({ride:await service.finish({token:bearer(req)})});});
}
// Mount only after the application's /api/admin authentication middleware.
export function mountAdminRideApi(app,service,{repository=rideRepository,ensureDb=async()=>{}}={}) {
  app.post('/api/admin/rides',async(req,res)=>{const result=await service.start(req.body,String(req.admin._id));res.status(result.created?201:200).json(result);});
  app.get('/api/admin/rides/:id',async(req,res)=>res.json({ride:await service.adminRead(req.params.id)}));
  app.post('/api/admin/rides/:id/token',async(req,res)=>{emptyInput.parse(req.body??{});res.json(await service.rotate(req.params.id));});
  app.post('/api/admin/rides/:id/finish',async(req,res)=>{emptyInput.parse(req.body??{});res.json({ride:await service.finish({id:req.params.id})});});
  app.get('/api/admin/rides/:id/path',async(req,res)=>{
    const id=objectId.parse(req.params.id);await ensureDb();const record=await repository.path(id);if(!record)throw fault(404,'RIDE_NOT_FOUND','Ride not found');
    res.json({id:String(record._id),path:record.path??null,pathVertexCount:record.pathVertexCount,sampleCount:record.sampleCount,status:record.status});
  });
  app.get('/api/admin/rides/:id/samples',async(req,res)=>{
    const id=objectId.parse(req.params.id),{after,limit}=samplesInput.parse(req.query);await ensureDb();const record=await repository.samples(id,after,limit);if(!record)throw fault(404,'RIDE_NOT_FOUND','Ride not found');
    res.json({id:String(record._id),data:record.samples,after,limit,sampleCount:record.sampleCount,nextAfter:after+record.samples.length<record.sampleCount?after+record.samples.length:null});
  });
  const analytics=analyticsHandlers(repository,ensureDb);
  app.get('/api/admin/analytics/rides',analytics.history);
  app.get('/api/admin/analytics/live',analytics.live);
}
