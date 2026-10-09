import mongoose from 'mongoose';import {readConfig} from '../src/config.js';import {connect} from '../src/db.js';import {Admin} from '../src/models.js';import {credentials} from '../src/validation.js';import {hashPassword} from '../src/password.js';
// Input via stdin from a secure prompt or secret manager; never command-line password arguments.
let raw='';for await(const chunk of process.stdin){raw+=chunk;if(raw.length>4096)throw new Error('Input too large');}
const input=credentials.parse(JSON.parse(raw));const config=readConfig();
try{await connect(config.MONGODB_URI);await Admin.createIndexes();await Admin.create({...{email:input.email},passwordHash:await hashPassword(input.password),role:'admin',active:true,tokenVersion:0});console.log('Admin created');}finally{await mongoose.disconnect();}
