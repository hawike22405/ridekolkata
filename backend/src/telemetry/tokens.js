import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { objectId } from '../validation.js';
import { LIMITS, fault } from './contracts.js';
const issuer='ride-kolkata-telemetry',audience='ride-kolkata-ride';
const claims=z.object({sub:objectId,ver:z.number().int().nonnegative(),scope:z.literal('ride:telemetry'),exp:z.number().int().positive()});
export function issueRideToken(ride,secret,now=new Date()) {
  if(typeof secret!=='string'||secret.length<64)throw fault(503,'TELEMETRY_UNAVAILABLE','Telemetry signing key is not configured');
  const exp=Math.min(Math.floor(now.getTime()/1000)+LIMITS.tokenSeconds,Math.floor(new Date(ride.expiresAt).getTime()/1000));
  if(exp<=Math.floor(now.getTime()/1000))throw fault(409,'RIDE_EXPIRED','Ride has expired');
  const accessToken=jwt.sign({scope:'ride:telemetry',ver:ride.tokenVersion,iat:Math.floor(now.getTime()/1000),exp},secret,{algorithm:'HS256',subject:String(ride._id),issuer,audience});
  return {accessToken,tokenType:'Bearer',expiresAt:new Date(exp*1000).toISOString()};
}
export function verifyRideToken(token,secret,now=new Date()) {
  try {
    if(typeof secret!=='string'||secret.length<64||typeof token!=='string'||token.length>2048)throw new Error();
    return claims.parse(jwt.verify(token,secret,{algorithms:['HS256'],issuer,audience,clockTimestamp:Math.floor(now.getTime()/1000)}));
  }catch{throw fault(401,'INVALID_RIDE_TOKEN','Invalid or expired ride token');}
}
