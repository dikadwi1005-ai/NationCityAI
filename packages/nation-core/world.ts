import {applyStroke,baseHeight,emptyGeo,parseStroke,sample,type Geo,type Stroke,type UndoGeo} from './geography.ts';
/** Shared pure domain contract. All mutations, including future AI commands, use this reducer. */
export const WORLD_ID = 'nation-001';
export const REGION_ID = 'region-001';
export const CHUNK_SIZE = 16;
export const ASSETS = {
 house:{name:'Rumah warga',width:2,depth:2,color:'#f4ddaf',category:'Hunian'},
 hall:{name:'Balai negara',width:4,depth:4,color:'#f7eee0',category:'Publik'},
 clinic:{name:'Klinik',width:4,depth:2,color:'#faf7ed',category:'Publik'},
 road:{name:'Jalan',width:2,depth:2,color:'#7e8f8f',category:'Infrastruktur'},
 tree:{name:'Pohon',width:2,depth:2,color:'#419f77',category:'Alam'},
 park:{name:'Taman',width:4,depth:4,color:'#83b974',category:'Alam'},
} as const;
export type Asset = keyof typeof ASSETS;
export type WorldObject={id:string;asset:Asset;x:number;z:number;rotation:number;regionId:typeof REGION_ID;ownerId:'administrator';assetVersion:1};
export type Command=Stroke|UndoGeo|{type:'place';object:WorldObject}|{type:'remove';id:string}|{type:'transform';id:string;x:number;z:number;rotation:number};
export type MutationRequest={requestId:string;expectedRevision:number;command:Command};
function record(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Objek perintah tidak valid.');return value as Record<string,unknown>}
function exact(value:Record<string,unknown>,keys:string[]){if(Object.keys(value).some(k=>!keys.includes(k))||keys.some(k=>!(k in value)))throw Error('Field perintah tidak valid.')}
function uuid(v:unknown){if(typeof v!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v))throw Error('UUID tidak valid.');return v}
function integer(v:unknown,min:number,max:number){if(typeof v!=='number'||!Number.isInteger(v)||v<min||v>max)throw Error('Angka di luar batas.');return v}
export const objectSchema={parse(input:unknown):WorldObject{const o=record(input);exact(o,['id','asset','x','z','rotation','regionId','ownerId','assetVersion']);uuid(o.id);if(typeof o.asset!=='string'||!Object.hasOwn(ASSETS,o.asset))throw Error('Asset tidak dikenal.');integer(o.x,-1000000,1000000);integer(o.z,-1000000,1000000);integer(o.rotation,0,3);if(o.regionId!==REGION_ID||o.ownerId!=='administrator'||o.assetVersion!==1)throw Error('Identitas objek tidak valid.');return o as WorldObject}};
export const commandSchema={parse(input:unknown):Command{const c=record(input);if(c.type==='geo')return parseStroke(c);if(c.type==='undoGeo'){exact(c,['type','id']);return {type:'undoGeo',id:uuid(c.id)}}if(c.type==='place'){exact(c,['type','object']);return {type:'place',object:objectSchema.parse(c.object)}}if(c.type==='remove'){exact(c,['type','id']);return {type:'remove',id:uuid(c.id)}}if(c.type==='transform'){exact(c,['type','id','x','z','rotation']);return {type:'transform',id:uuid(c.id),x:integer(c.x,-1000000,1000000),z:integer(c.z,-1000000,1000000),rotation:integer(c.rotation,0,3)}}throw Error('Jenis perintah tidak dikenal.')}};
export const requestSchema={parse(input:unknown):MutationRequest{const r=record(input);exact(r,['requestId','expectedRevision','command']);return {requestId:uuid(r.requestId),expectedRevision:integer(r.expectedRevision,0,Number.MAX_SAFE_INTEGER),command:commandSchema.parse(r.command)}}};
export type World={id:string;revision:number;objects:WorldObject[];terrainVersion:number;geo?:Geo};
/** Global-coordinate sampling avoids seams and preserves terrain across chunk expansion. */
export function heightAt(x:number,z:number):number {
 return baseHeight(x,z);
}
export function chunkAt(x:number,z:number){return `${Math.floor(x/CHUNK_SIZE)}:${Math.floor(z/CHUNK_SIZE)}`}
export function chunkSamples(cx:number,cz:number){return Array.from({length:CHUNK_SIZE+1},(_,z)=>Array.from({length:CHUNK_SIZE+1},(_,x)=>heightAt(cx*CHUNK_SIZE+x,cz*CHUNK_SIZE+z)))}
export function footprint(o:Pick<WorldObject,'asset'|'rotation'|'x'|'z'>){const a=ASSETS[o.asset];return {w:o.rotation%2?a.depth:a.width,d:o.rotation%2?a.width:a.depth}}
export function placementError(o:WorldObject,objects:WorldObject[],geo:Geo=emptyGeo):string|null {
 if(o.x%2!==0||o.z%2!==0)return 'Posisi harus berada pada grid 2 meter.';
 const {w,d}=footprint(o);const heights:number[]=[];
 for(let x=o.x-w/2;x<=o.x+w/2;x++)for(let z=o.z-d/2;z<=o.z+d/2;z++)heights.push(sample(geo,x,z).h);
 if(heights.some(h=>h<.5))return 'Pilih daratan, jauh dari pantai dan air.';
 if(Math.max(...heights)-Math.min(...heights)>.6)return 'Lereng terlalu curam untuk objek ini.';
 for(const other of objects){if(other.id===o.id)continue;const f=footprint(other);if(Math.abs(o.x-other.x)<(w+f.w)/2&&Math.abs(o.z-other.z)<(d+f.d)/2)return 'Area bertabrakan dengan objek lain.';}
 return null;
}
export function applyCommand(world:World,input:unknown):World {
 const c=commandSchema.parse(input);let objects=[...world.objects];
 if(c.type==='geo'||c.type==='undoGeo'){
 const prior=world.geo??emptyGeo;
 if(c.type==='undoGeo'&&prior.strokes.at(-1)?.id!==c.id)throw Error('Operasi terrain bukan revisi terakhir.');
 const stroke=c.type==='geo'?c:prior.strokes.at(-1)!;
 const geo=c.type==='geo'?applyStroke(prior,c):{strokes:prior.strokes.slice(0,-1)};
 for(const o of objects){if(Math.hypot(o.x-stroke.x,o.z-stroke.z)>stroke.radius+4)continue;
 const {w,d}=footprint(o);
 for(let x=o.x-w/2;x<=o.x+w/2;x++)for(let z=o.z-d/2;z<=o.z+d/2;z++)if(sample(prior,x,z).h!==sample(geo,x,z).h)throw Error('Terrain menopang objek. Pindahkan objek terlebih dahulu.');
 }
 return {...world,geo,revision:world.revision+1,terrainVersion:world.terrainVersion+1};
 }
 if(c.type==='remove'){if(!objects.some(o=>o.id===c.id))throw Error('Objek tidak ditemukan.');objects=objects.filter(o=>o.id!==c.id);}
 else {let object:WorldObject;
 if(c.type==='place'){if(objects.some(o=>o.id===c.object.id))throw Error('ID objek sudah digunakan.');if(objects.length>=2000)throw Error('Batas 2000 objek Phase 1 tercapai.');object=c.object;}
 else {const prior=objects.find(o=>o.id===c.id);if(!prior)throw Error('Objek tidak ditemukan.');object={...prior,x:c.x,z:c.z,rotation:c.rotation};}
 const error=placementError(object,objects,world.geo);if(error)throw Error(error);
 objects=[...objects.filter(o=>o.id!==object.id),object];}
 return {...world,revision:world.revision+1,objects};
}
export function inverseCommand(world:World,c:Command):Command {
 if(c.type==='geo')return {type:'undoGeo',id:c.id};
 if(c.type==='undoGeo')return world.geo!.strokes.at(-1)!;
 if(c.type==='place')return {type:'remove',id:c.object.id};
 const o=world.objects.find(o=>o.id===c.id);if(!o)throw Error('Objek tidak ditemukan.');
 return c.type==='remove'?{type:'place',object:o}:{type:'transform',id:o.id,x:o.x,z:o.z,rotation:o.rotation};
}
export function starterWorld():World {
 const objects:WorldObject[]=[];
 const add=(asset:Asset,x:number,z:number)=>objects.push({id:`00000000-0000-4000-8000-${String(objects.length+1).padStart(12,'0')}`,asset,x,z,rotation:0,regionId:REGION_ID,ownerId:'administrator',assetVersion:1});
 add('hall',0,-4);add('park',0,4);add('clinic',8,-4);
 for(let x=-12;x<=14;x+=2)add('road',x,0);
 for(const [x,z] of [[-8,4],[-12,4],[-8,8],[-12,8],[8,4],[12,4]])add('house',x,z);
 for(const [x,z] of [[-6,10],[6,10],[14,-8],[18,4],[20,8],[-18,8],[-22,4],[10,12],[-12,12]])add('tree',x,z);
 return {id:WORLD_ID,revision:0,objects,terrainVersion:1};
}
