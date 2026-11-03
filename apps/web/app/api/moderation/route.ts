import {NextRequest,NextResponse} from 'next/server';
import {authorized,sameOrigin} from '../security';
import {database} from '../../../../../packages/citizens/db';
import {moderate,purge} from '../../../../../packages/chat/storage';
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function GET(req:NextRequest){
 if(!authorized(req))return json({error:'Akses administrator diperlukan.'},403);
 const db=database();purge(db);return json({reports:db.prepare('SELECT id,reason,evidence,created FROM chat_reports WHERE resolved=0 ORDER BY created LIMIT 100').all(),audit:db.prepare('SELECT action,actor,report,created FROM moderation_audit ORDER BY created DESC LIMIT 100').all()})}
export async function POST(req:NextRequest){
 if(!sameOrigin(req)||!authorized(req))return json({error:'Akses administrator diperlukan.'},403);
 try{const raw=await req.text();if(raw.length>512)return json({error:'Input terlalu panjang.'},413);
 const b=JSON.parse(raw);moderate(database(),b.id,b.action);return json({ok:true})}catch{return json({error:'Laporan atau tindakan tidak valid.'},400)}}

