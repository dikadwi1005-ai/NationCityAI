import {authorized,sameOrigin} from '../security';
import {identify,database} from '../../../../../packages/citizens/db';
import {store} from '../../../../../packages/persistence/store';
import {change,overview} from '../../../../../packages/government/service.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'cache-control':'no-store'}});
const limits=new Map();let sweep=0;
function identity(r){return identify(r.cookies.get('nation_citizen')?.value??'')}
export const dynamic='force-dynamic';
export function GET(r){try{return json(overview(database(),store().read(),identity(r),authorized(r)))}catch{return json({error:'Data pemerintahan tidak tersedia.'},503)}}
export async function POST(r){if(!sameOrigin(r))return json({error:'Origin ditolak.'},403);const user=identity(r),admin=authorized(r);if(!user&&!admin)return json({error:'Masuk terlebih dahulu.'},401);
 const now=Date.now();if(now-sweep>60000){for(const [k,v] of limits)if(v.until<=now)limits.delete(k);sweep=now}
 const key=user||'admin',v=limits.get(key);if(!v||v.until<=now)limits.set(key,{count:1,until:now+60000});else if(++v.count>60)return json({error:'Tunggu satu menit.'},429);
 try{const raw=await r.text();if(raw.length>2048)return json({error:'Permintaan terlalu panjang.'},413);const id=change(database(),store().read(),user,admin,JSON.parse(raw));return json({id})}catch(e){const msg=e.message;return json({error:/SQLITE|constraint|syntax|JSON|database|ENOENT|EPERM/i.test(msg)?'Perintah bertentangan atau tidak dapat disimpan.':msg},msg==='Akses ditolak.'?403:400)}}

