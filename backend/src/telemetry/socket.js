import { Server } from 'socket.io';
import { ZodError } from 'zod';
import { LIMITS } from './contracts.js';
export function socketError(error) {
  if(error instanceof ZodError)return {code:'INVALID_PING',message:'Invalid ping fields',issues:error.issues.map(x=>({path:x.path,message:x.message}))};
  if(Number.isInteger(error?.status)&&error.status>=400&&error.status<500&&typeof error.code==='string')return {code:error.code,message:error.message};
  return {code:'SERVICE_UNAVAILABLE',message:'Telemetry temporarily unavailable'};
}
export function attachTelemetry(httpServer,{service,allowedOrigin}) {
  const io=new Server(httpServer,{
    path:'/socket.io',transports:['websocket'],maxHttpBufferSize:4096,serveClient:false,
    cors:{origin:allowedOrigin,methods:['GET','POST']},
    allowRequest:(req,callback)=>callback(null,req.headers.origin===allowedOrigin),
  });
  // Per-process admission control; deploy a gateway limit across instances.
  const connections=new Map();
  io.use(async(socket,next)=>{
    try {
      const token=socket.handshake.auth?.token;
      const {ride,claims}=await service.authorize(token);
      const id=String(ride._id);
      if((connections.get(id)??0)>=2){const error=new Error('Too many connections for this ride');error.data={code:'CONNECTION_LIMIT'};return next(error);}
      socket.data.token=token;socket.data.rideId=id;socket.data.exp=claims.exp;
      next();
    }catch(error){const failure=new Error('Telemetry authentication failed');failure.data=socketError(error);next(failure);}
  });
  io.on('connection',socket=>{
    const id=socket.data.rideId;
    // Recheck synchronously to close concurrent handshake races.
    if((connections.get(id)??0)>=2){socket.disconnect(true);return;}
    connections.set(id,(connections.get(id)??0)+1);
    let busy=false,lastAttempt=0;
    const expiry=setTimeout(()=>socket.disconnect(true),Math.max(1,socket.data.exp*1000-Date.now()));expiry.unref();
    socket.on('telemetry:ping',async(payload,ack)=>{
      if(typeof ack!=='function')return;
      const now=Date.now();
      if(busy||now-lastAttempt<LIMITS.minIntervalMs){ack({ok:false,error:{code:'BACKPRESSURE',message:'Wait for the acknowledgement and at least 250 ms before retrying'}});return;}
      busy=true;lastAttempt=now;
      try{const result=await service.ingest(socket.data.token,payload);ack({ok:true,...result});}
      catch(error){ack({ok:false,error:socketError(error)});if(error.status===401||error.code==='RIDE_NOT_ACTIVE')socket.disconnect(true);}
      finally{busy=false;}
    });
    socket.on('disconnect',()=>{clearTimeout(expiry);const remaining=(connections.get(id)??1)-1;if(remaining>0)connections.set(id,remaining);else connections.delete(id);});
  });
  return io;
}
