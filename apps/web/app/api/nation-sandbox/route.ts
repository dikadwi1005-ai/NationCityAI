import {NextRequest,NextResponse} from 'next/server';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {authorized,sameOrigin,failure} from '../security';
import {NationSandboxStore,SandboxConflict,type SandboxRequest} from '../../../../../packages/nation-sim/sandbox-store';
import {getScene} from '../../../../../packages/nation-sim/atlas';
import {regionGeo} from '../../../../../packages/nation-sim/regions';
import {regionalLayout} from '../../../../../packages/nation-sim/layout';
export const runtime='nodejs';export const dynamic='force-dynamic';
function store(){
 if(process.env.NATION_ENV==='staging'||process.env.RAILWAY_PROJECT_ID)throw Error('Local nation sandbox is disabled on hosted environments.');
 const root=process.env.NATION_PROJECT_ROOT??(existsSync(resolve(process.cwd(),'packages/nation-core'))?process.cwd():resolve(process.cwd(),'../..'));
 return new NationSandboxStore(resolve(root,'data/nation-sandbox.sqlite'),id=>{const geo=regionGeo(getScene(id)!);return{scene:id,geo,...regionalLayout(id,geo)}});
}
export async function GET(req:NextRequest){const scene=getScene(req.nextUrl.searchParams.get('scene')??'');if(!scene)return failure('Wilayah tidak valid.',400);let db;try{db=store();return NextResponse.json(db.read(scene.id),{headers:{'Cache-Control':'no-store'}})}catch{return failure('Sandbox lokal tidak tersedia.',503)}finally{db?.close()}}
export async function POST(req:NextRequest){
 if(!sameOrigin(req)||!authorized(req))return failure('Persetujuan administrator platform diperlukan.',403);
 let db;try{const raw=await req.text();if(raw.length>262144)return failure('Rencana terlalu besar.',413);db=store();return NextResponse.json(db.execute(JSON.parse(raw) as SandboxRequest,true))}catch(e){return failure(e instanceof Error?e.message:'Operasi sandbox gagal.',e instanceof SandboxConflict?409:400)}finally{db?.close()}
}
