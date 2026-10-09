import mongoose from 'mongoose';
import { LIMITS, coordinate } from './contracts.js';
const {Schema}=mongoose;
const options={_id:false,strict:'throw'};
const coordinates={type:[Number],required:true,default:undefined,validate:v=>coordinate.safeParse(v).success};
const sample=new Schema({sequence:{type:Number,required:true,min:1,max:LIMITS.maxSamples},capturedAt:{type:Date,required:true},receivedAt:{type:Date,required:true},coordinates,accuracyMeters:{type:Number,required:true,min:Number.EPSILON,max:50},gapBefore:{type:Boolean,required:true}},options);
const line=new Schema({type:{type:String,enum:['LineString'],required:true},coordinates:{type:[[Number]],required:true,default:undefined,validate:v=>v.length>=2&&v.length<=LIMITS.maxSamples&&v.every(c=>coordinate.safeParse(c).success)}},options);
const point=new Schema({type:{type:String,enum:['Point'],required:true},coordinates},options);
const integer={type:Number,required:true,min:0,validate:Number.isSafeInteger};
const nonnegative={type:Number,required:true,min:0,validate:Number.isFinite};
const schema=new Schema({
  requestId:{type:String,required:true},riderRef:{type:String,required:true,maxLength:128},routeId:{type:Schema.Types.ObjectId,required:true},routeName:{type:String,required:true},createdBy:{type:Schema.Types.ObjectId,required:true},
  status:{type:String,enum:['active','completed','expired'],required:true},startedAt:{type:Date,required:true},expiresAt:{type:Date,required:true},endedAt:Date,
  version:integer,tokenVersion:integer,lastSequence:integer,sampleCount:{...integer,max:LIMITS.maxSamples},pathVertexCount:{...integer,max:LIMITS.maxSamples},
  distanceMeters:nonnegative,observedSeconds:nonnegative,gapSeconds:nonnegative,lastSpeedKmh:{type:Number,min:0,max:LIMITS.maxSpeedMps*3.6,default:null},
  lastFingerprint:String,lastReceivedAt:Date,lastPoint:{type:sample},lastLocation:{type:point},
  path:{type:line},samples:{type:[sample],required:true,default:undefined,validate:v=>v.length<=LIMITS.maxSamples},
},{strict:'throw',strictQuery:'throw',timestamps:true,autoIndex:false,bufferCommands:false});
schema.index({requestId:1},{unique:true});
schema.index({riderRef:1},{unique:true,partialFilterExpression:{status:'active'},name:'one_active_ride_per_rider'});
schema.index({status:1,startedAt:-1});schema.index({routeId:1,status:1,startedAt:-1});
schema.index({status:1,lastReceivedAt:-1});schema.index({status:1,expiresAt:1});
schema.index({path:'2dsphere'});schema.index({lastLocation:'2dsphere'});
export const RideSession=mongoose.model('RideSession',schema);
