import mongoose from 'mongoose';
import {routeInput,pricingInput,credentials} from './validation.js';
const {Schema}=mongoose;
const options={strict:'throw',strictQuery:'throw',timestamps:true,optimisticConcurrency:true,autoIndex:false,bufferCommands:false};
const geo=new Schema({type:{type:String,enum:['Point'],required:true},coordinates:{type:[Number],required:true,default:undefined,validate:v=>v.length===2&&v.every(Number.isFinite)&&Math.abs(v[0])<=180&&Math.abs(v[1])<=90}},{_id:false,strict:'throw'});
function guard(schema,validator,fields){schema.pre('validate',function(){validator.parse(Object.fromEntries(fields.map(k=>[k,this.toObject()[k]])));});}
const route=new Schema({name:{type:String,required:true},description:{type:String},start:{type:geo,required:true},end:{type:geo,required:true},waypoints:{type:[geo],required:true,default:undefined},enabled:{type:Boolean,required:true}},options);
// The Zod validation hook requires description while allowing an empty string.
guard(route,routeInput,Object.keys(routeInput.shape));
route.index({start:'2dsphere'});route.index({end:'2dsphere'});
const pricing=new Schema({name:{type:String,required:true},currency:{type:String,enum:['INR'],required:true},baseFareMinor:{type:Number,required:true},perMinuteMinor:{type:Number,required:true},surgeMultiplier:{type:Number,required:true},enabled:{type:Boolean,required:true}},options);
guard(pricing,pricingInput,Object.keys(pricingInput.shape));
const admin=new Schema({email:{type:String,required:true,lowercase:true,trim:true,validate:v=>credentials.shape.email.safeParse(v).success},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['admin'],required:true},active:{type:Boolean,required:true},tokenVersion:{type:Number,required:true,min:0,validate:Number.isInteger}},options);
admin.index({email:1},{unique:true});
export const Admin=mongoose.model('Admin',admin);
export const Route=mongoose.model('Route',route);
export const Pricing=mongoose.model('Pricing',pricing);
