import {readConfig} from './config.js';import {connect} from './db.js';import {createApp} from './app.js';
const config=readConfig();export default createApp(config,{ensureDb:()=>connect(config.MONGODB_URI)});
