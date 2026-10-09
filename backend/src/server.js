import mongoose from 'mongoose';
import {readConfig} from './config.js';import {connect} from './db.js';import {createApp} from './app.js';
const config=readConfig();await connect(config.MONGODB_URI);
const server=createApp(config,{ensureDb:()=>connect(config.MONGODB_URI)}).listen(config.PORT,()=>console.log(`Ride Kolkata listening on ${config.PORT}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(async()=>{await mongoose.disconnect();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();});
