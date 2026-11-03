import {createHmac,timingSafeEqual,randomBytes} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
const sessions=globalThis as typeof globalThis & {loginLimits?:Map<string,{count:number;until:number}>};
export function sameOrigin(req:NextRequest){
 const host=req.headers.get('host');
 return !!host && req.headers.get('origin')===req.nextUrl.protocol+'//'+host;
}
export function equal(a:string,b:string){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}
export function key(){const k=process.env.ADMIN_KEY;return k&&k.length>=24?k:null}
export function createSession(){const payload=`${Date.now()+8*3600_000}.${randomBytes(16).toString('hex')}`;return `${payload}.${createHmac('sha256',key()!).update(payload).digest('hex')}`}
export function authorized(req:NextRequest){const k=key();if(!k)return false;const value=req.cookies.get('nation_admin')?.value??'';const parts=value.split('.');if(parts.length!==3||Number(parts[0])<Date.now())return false;return equal(parts[2],createHmac('sha256',k).update(parts.slice(0,2).join('.')).digest('hex'))}
export function rateLimit(){const map=sessions.loginLimits??=new Map();const id='global';let entry=map.get(id);if(!entry||entry.until<Date.now()){entry={count:0,until:Date.now()+60000};map.set(id,entry)}return ++entry.count>10}
export function failure(message:string,status:number){return NextResponse.json({error:message},{status})}
