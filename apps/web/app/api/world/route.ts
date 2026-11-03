import {NextRequest,NextResponse} from 'next/server';
import {store,Conflict} from '../../../../../packages/persistence/store';
import {authorized,failure,sameOrigin} from '../security';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json(store().read(),{headers:{'Cache-Control':'no-store'}})}catch(e){console.error('World read failed',e);return failure('Penyimpanan dunia tidak tersedia.',503)}}
export async function POST(req:NextRequest){
 if(!sameOrigin(req)||!authorized(req))return failure('Akses administrator diperlukan.',403);
 try{const raw=await req.text();if(raw.length>8192)return failure('Perintah terlalu besar.',413);return NextResponse.json(store().mutate(JSON.parse(raw)));}
 catch(e){if(e instanceof Conflict)return failure(e.message,409);if(e instanceof SyntaxError)return failure('JSON tidak valid.',400);if(e instanceof Error&&e.message.includes('SQLITE')){console.error(e);return failure('Penyimpanan gagal. Coba kembali.',503)}return failure(e instanceof Error?e.message:'Perintah gagal.',400)}
}
