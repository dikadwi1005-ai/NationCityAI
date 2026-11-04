import {NextRequest,NextResponse} from 'next/server';
import {authenticate,identify,logout,profile,saveLook,ticket} from '../../../../../packages/citizens/db';
import {sameOrigin} from '../security';
const cookie='nation_citizen';
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
export const dynamic='force-dynamic';
export function GET(r:NextRequest){const id=identify(r.cookies.get(cookie)?.value??'');return json(id?profile(id):null)}
let attempts=0,windowEnd=0;
export async function POST(r:NextRequest){
 if(!sameOrigin(r))return json({error:'Origin ditolak.'},403);
 try{const text=await r.text();if(text.length>2048)return json({error:'Input terlalu besar.'},413);
 const b=JSON.parse(text),token=r.cookies.get(cookie)?.value??'';
 if(b.action==='register'||b.action==='login'){
 if(Date.now()>windowEnd){attempts=0;windowEnd=Date.now()+60000}
 if(++attempts>30)return json({error:'Coba lagi dalam satu menit.'},429);
 const t=await authenticate(b.login,b.password,b.action==='register',b.invite),res=json(profile(identify(t)!));
 res.cookies.set(cookie,t,{httpOnly:true,sameSite:'strict',secure:process.env.NATION_ENV==='staging'||r.nextUrl.protocol==='https:',path:'/',maxAge:28800});return res;
 }
 const id=identify(token);if(!id)return json({error:'Masuk sebagai warga dahulu.'},401);
 if(b.action==='save'){saveLook(id,b.look);return json(profile(id))}
 if(b.action==='ticket'&&profile(id).look)return json({ticket:ticket(token),port:process.env.MULTIPLAYER_PORT??'2567',url:process.env.MULTIPLAYER_PUBLIC_URL});
 if(b.action==='logout'){logout(token);const res=json(null);res.cookies.delete(cookie);return res}
 return json({error:'Aksi tidak tersedia.'},400)
 }catch(e){return json({error:e instanceof Error&& !/SQLITE|constraint/i.test(e.message)?e.message:'Permintaan gagal.'},400)}
}
