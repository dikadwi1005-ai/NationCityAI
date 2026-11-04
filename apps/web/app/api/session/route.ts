import {NextRequest,NextResponse} from 'next/server';
import {authorized,createSession,equal,failure,key,rateLimit,sameOrigin} from '../security';
export const runtime='nodejs';
export async function GET(req:NextRequest){return NextResponse.json({admin:authorized(req),configured:!!key()},{headers:{'Cache-Control':'no-store'}})}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return failure('Origin tidak diizinkan.',403);
 if(rateLimit())return failure('Terlalu banyak percobaan. Tunggu satu menit.',429);
 if(!key())return failure('Server belum memiliki ADMIN_KEY minimal 24 karakter.',503);
 try{const text=await req.text();if(text.length>1024)return failure('Permintaan terlalu besar.',413);const body=JSON.parse(text);if(typeof body.key!=='string'||!equal(body.key,key()!))return failure('Kunci administrator tidak valid.',401);
 const res=NextResponse.json({admin:true});res.cookies.set('nation_admin',createSession(),{httpOnly:true,sameSite:'strict',secure:process.env.NATION_ENV==='staging'||req.nextUrl.protocol==='https:',maxAge:8*3600,path:'/'});return res;
 }catch{return failure('Format permintaan tidak valid.',400)}
}
export async function DELETE(req:NextRequest){if(!sameOrigin(req))return failure('Origin tidak diizinkan.',403);const res=NextResponse.json({admin:false});res.cookies.set('nation_admin','',{maxAge:0,path:'/'});return res}
