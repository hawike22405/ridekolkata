import mongoose from 'mongoose';
let connecting;
export async function connect(uri){if(mongoose.connection.readyState===1)return;connecting??=mongoose.connect(uri,{maxPoolSize:10,minPoolSize:0,serverSelectionTimeoutMS:5000,autoIndex:false});try{await connecting;}finally{connecting=undefined;}}
