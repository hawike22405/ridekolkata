import {randomBytes,scrypt as rawScrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(rawScrypt);
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');return `scrypt:${salt}:${(await scrypt(password,salt,64)).toString('hex')}`;}
export async function verifyPassword(password,stored){const [kind,salt,hex]=stored.split(':');if(kind!=='scrypt'||!salt||!hex)return false;const expected=Buffer.from(hex,'hex');const actual=await scrypt(password,salt,64);return expected.length===actual.length&&timingSafeEqual(expected,actual);}
