import mongoose from 'mongoose';
import {createServer} from 'node:http';
import {readConfig} from './config.js';import {connect} from './db.js';import {createApp} from './app.js';
import {createRideService} from './telemetry/service.js';import {attachTelemetry} from './telemetry/socket.js';
const config=readConfig();const ensureDb=()=>connect(config.MONGODB_URI);await ensureDb();
const server=createServer(createApp(config,{ensureDb}));
const io=attachTelemetry(server,{service:createRideService({secret:config.TELEMETRY_JWT_SECRET,ensureDb}),allowedOrigin:config.ALLOWED_ORIGIN});
server.listen(config.PORT,()=>console.log(`Ride Kolkata HTTP and telemetry listening on ${config.PORT}`));
let closing=false;
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{
  if(closing)return;closing=true;
  io.close(async()=>{await mongoose.disconnect();process.exit(0);});
  setTimeout(()=>process.exit(1),10000).unref();
});
