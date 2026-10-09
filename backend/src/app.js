import express from 'express';
import {createRideService} from './telemetry/service.js';
import {mountAdminRideApi,mountRiderApi} from './telemetry/api.js';
import {visualHandlers} from './visual-api.js';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {fileURLToPath} from 'node:url';
import {ZodError} from 'zod';
import {Admin,Route,Pricing} from './models.js';
import {credentials,routeInput,pricingInput,objectId,versionInput,pageInput} from './validation.js';
import {hashPassword,verifyPassword} from './password.js';
const issuer='ride-kolkata';const audience='ride-kolkata-admin';
const fail=(status,message)=>Object.assign(new Error(message),{status});
export function createApp(config,{ensureDb=async()=>{}}={}){
 const app=express();app.disable('x-powered-by');app.set('trust proxy',config.TRUST_PROXY_HOPS);
 app.use(helmet());app.use(cors({origin(origin,cb){cb(origin&&origin!==config.ALLOWED_ORIGIN?fail(403,'Origin not allowed'):null,origin===config.ALLOWED_ORIGIN)},methods:['GET','POST','PUT','DELETE'],allowedHeaders:['Content-Type','Authorization','If-Match'],exposedHeaders:['ETag']}));
 app.use(express.json({limit:'64kb'}));
 app.get('/health/live',(_req,res)=>res.json({status:'alive'}));
 app.get('/health/ready',async(_req,res)=>{await ensureDb();res.status(mongoose.connection.readyState===1?200:503).json({ready:mongoose.connection.readyState===1});});
 app.use('/admin',express.static(fileURLToPath(new URL('../public',import.meta.url))));
 app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
 app.use('/api',rateLimit({windowMs:60000,limit:120,standardHeaders:'draft-8',legacyHeaders:false}));
 const rides=createRideService({secret:config.TELEMETRY_JWT_SECRET,ensureDb});
 mountRiderApi(app,rides);
 const visuals=visualHandlers({ensureDb});
 app.get('/api/ui/3d-config',visuals.read);
 const dummyHash=hashPassword('timing-only-not-an-account');
 app.post('/api/admin/auth/login',rateLimit({windowMs:900000,limit:10,standardHeaders:'draft-8',legacyHeaders:false}),async(req,res)=>{
 const input=credentials.parse(req.body);await ensureDb();const admin=await Admin.findOne({email:input.email}).select('+passwordHash');
 const valid=await verifyPassword(input.password,admin?.passwordHash??await dummyHash);
 if(!admin||!valid||!admin.active)throw fail(401,'Invalid credentials');
 const token=jwt.sign({role:admin.role,ver:admin.tokenVersion},config.JWT_SECRET,{algorithm:'HS256',expiresIn:'15m',subject:String(admin._id),issuer,audience});res.json({accessToken:token,tokenType:'Bearer',expiresIn:900});});
 async function auth(req,_res,next){const header=req.get('Authorization');if(!header?.startsWith('Bearer '))throw fail(401,'Authentication required');let payload;
 try{payload=jwt.verify(header.slice(7),config.JWT_SECRET,{algorithms:['HS256'],issuer,audience});}catch{throw fail(401,'Invalid or expired token');}
 if(typeof payload!=='object'||!objectId.safeParse(payload.sub).success)throw fail(401,'Invalid token');await ensureDb();
 const admin=await Admin.findById(payload.sub);if(!admin?.active||admin.tokenVersion!==payload.ver)throw fail(401,'Session revoked');if(admin.role!=='admin'||payload.role!=='admin')throw fail(403,'Admin access required');req.admin=admin;next();}
 app.use('/api/admin',auth);
 mountAdminRideApi(app,rides,{ensureDb});
 app.get('/api/admin/visual-config',visuals.read);
 app.post('/api/admin/visual-config',visuals.create);
 app.put('/api/admin/visual-config',visuals.replace);
 app.delete('/api/admin/visual-config',visuals.remove);
 app.post('/api/admin/auth/logout',async(req,res)=>{await Admin.updateOne({_id:req.admin._id},{$inc:{tokenVersion:1}});res.status(204).end();});
 for(const [name,Model,schema] of [['routes',Route,routeInput],['pricing',Pricing,pricingInput]]){
 const base=`/api/admin/${name}`;
 app.get(base,async(req,res)=>{const {page,limit}=pageInput.parse(req.query);const data=await Model.find().sort({_id:1}).skip((page-1)*limit).limit(limit).lean();res.json({data,page,limit});});
 app.post(base,async(req,res)=>{const doc=await Model.create(schema.parse(req.body));res.status(201).location(`${base}/${doc.id}`).set('ETag',`"${doc.__v}"`).json(doc);});
 app.get(`${base}/:id`,async(req,res)=>{const doc=await Model.findById(objectId.parse(req.params.id));if(!doc)throw fail(404,'Record not found');res.set('ETag',`"${doc.__v}"`).json(doc);});
 function expected(req){const h=req.get('If-Match');if(!h)throw fail(428,'If-Match version required');if(!/^"\d+"$/.test(h))throw fail(400,'If-Match must be a quoted integer');return versionInput.parse(Number(h.slice(1,-1)));}
 app.put(`${base}/:id`,async(req,res)=>{const id=objectId.parse(req.params.id),version=expected(req),input=schema.parse(req.body);const doc=await Model.findById(id);if(!doc)throw fail(404,'Record not found');if(doc.__v!==version)throw fail(409,'Version conflict; reload record');doc.set(input);await doc.save();res.set('ETag',`"${doc.__v}"`).json(doc);});
 app.delete(`${base}/:id`,async(req,res)=>{const id=objectId.parse(req.params.id),version=expected(req);const result=await Model.deleteOne({_id:id,__v:version});if(!result.deletedCount)throw fail(409,'Record changed or no longer exists');res.status(204).end();});
 }
 app.use((_req,_res,next)=>next(fail(404,'Endpoint not found')));
 app.use((err,_req,res,_next)=>{if(err instanceof ZodError)return res.status(400).json({error:'Validation failed',issues:err.issues.map(i=>({path:i.path,message:i.message}))});if(err.code===11000)return res.status(409).json({error:'Duplicate record'});if(err.name==='VersionError')return res.status(409).json({error:'Version conflict; reload record'});if(['ValidationError','StrictModeError','CastError'].includes(err.name))return res.status(400).json({error:'Invalid record'});const status=Number.isInteger(err.status)&&err.status>=400&&err.status<500?err.status:503;res.status(status).json({error:status===503?'Service unavailable':err.message,...(status<500&&typeof err.code==='string'?{code:err.code}:{})});});return app;
}
