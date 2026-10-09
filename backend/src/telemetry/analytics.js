import mongoose from 'mongoose';
import { LIMITS, dateRange, pageInput, fault } from './contracts.js';
export function historyPipeline(query, now=new Date()) {
  const q=dateRange.parse(query);
  const match={startedAt:{$gte:new Date(q.from),$lt:new Date(q.to)},$or:[{status:{$in:['completed','expired']}},{status:'active',expiresAt:{$lte:now}}]};
  if(q.routeId)match.routeId=new mongoose.Types.ObjectId(q.routeId);
  const duration={$divide:[{$subtract:[{$ifNull:['$endedAt','$expiresAt']},'$startedAt']},1000]};
  return [{$match:match},{$set:{durationSeconds:duration}},{$sort:{startedAt:-1}},{$facet:{
    summary:[{$group:{_id:null,totalRides:{$sum:1},trackedRides:{$sum:{$cond:[{$gt:['$sampleCount',0]},1,0]}},distanceMeters:{$sum:'$distanceMeters'},durationSeconds:{$sum:'$durationSeconds'},observedSeconds:{$sum:'$observedSeconds'},gapSeconds:{$sum:'$gapSeconds'}}},{$project:{_id:0,totalRides:1,trackedRides:1,distanceMeters:1,durationSeconds:1,observedSeconds:1,gapSeconds:1,averageSpeedKmh:{$cond:[{$gt:['$observedSeconds',0]},{$multiply:[{$divide:['$distanceMeters','$observedSeconds']},3.6]},null]}}}],
    popularRoutes:[{$group:{_id:'$routeId',routeName:{$first:'$routeName'},rides:{$sum:1},distanceMeters:{$sum:'$distanceMeters'},durationSeconds:{$sum:'$durationSeconds'}}},{$sort:{rides:-1,_id:1}},{$limit:20},{$project:{_id:0,routeId:'$_id',routeName:1,rides:1,distanceMeters:1,durationSeconds:1}}],
    byDay:[{$group:{_id:{$dateToString:{format:'%Y-%m-%d',date:'$startedAt',timezone:'UTC'}},rides:{$sum:1},distanceMeters:{$sum:'$distanceMeters'}}},{$sort:{_id:1}},{$project:{_id:0,date:'$_id',rides:1,distanceMeters:1}}],
  }}];
}
export function livePipeline(query,now=new Date()) {
  const {page,limit}=pageInput.parse(query),cutoff=new Date(now-LIMITS.liveWindowMs);
  return [{$match:{status:'active',expiresAt:{$gt:now},lastReceivedAt:{$gte:cutoff},'lastPoint.capturedAt':{$gte:cutoff}}},{$sort:{lastReceivedAt:-1,_id:1}},{$facet:{
    users:[{$group:{_id:'$riderRef'}},{$count:'count'}],
    sessions:[{$skip:(page-1)*limit},{$limit:limit},{$project:{_id:0,id:'$_id',riderRef:1,routeId:1,routeName:1,startedAt:1,lastReceivedAt:1,currentSpeedKmh:'$lastSpeedKmh',lastLocation:1,sampleCount:1}}],
  }}];
}
export function analyticsHandlers(repository,ensureDb,clock=()=>new Date()) {
  return {
    async history(req,res) {const now=clock(),pipeline=historyPipeline(req.query,now);await ensureDb();const rows=await repository.aggregate(pipeline);if(!rows[0])throw fault(503,'ANALYTICS_UNAVAILABLE','Unable to read analytics');res.json({asOf:now.toISOString(),...rows[0]});},
    async live(req,res) {const now=clock(),page=pageInput.parse(req.query),pipeline=livePipeline(req.query,now);await ensureDb();const rows=await repository.aggregate(pipeline);if(!rows[0])throw fault(503,'ANALYTICS_UNAVAILABLE','Unable to read live statistics');res.json({asOf:now.toISOString(),freshnessSeconds:LIMITS.liveWindowMs/1000,...page,...rows[0]});},
  };
}
