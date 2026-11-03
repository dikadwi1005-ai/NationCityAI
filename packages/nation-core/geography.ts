export const starterIsland = {id:'island-001', name:'Pulau Harapan', x:0,z:0,radius:40};
export const tools = ['island','expand','remove','raise','lower','smooth','paint','water','region'] as const;
export const levels = ['Country','Province','Regency/City','District','Village/Subdistrict','RW','RT'] as const;
export const biomes = ['grass','forest','sand','rock'] as const;
export type Stroke = {type:'geo';id:string;island:string;name:string;tool:typeof tools[number];x:number;z:number;radius:number;strength:number;biome:typeof biomes[number];level:number;parent:string};
export type Geo = {strokes:Stroke[]};
export type UndoGeo = {type:'undoGeo';id:string};
export const emptyGeo:Geo={strokes:[]};
export function parseStroke(raw:Record<string,unknown>):Stroke {
 const s=raw as unknown as Stroke;
 const fields='type id island name tool x z radius strength biome level parent'.split(' ');
 if(Object.keys(raw).length!==fields.length||fields.some(k=>!Object.hasOwn(raw,k))||s.type!=='geo'||!tools.includes(s.tool)||!biomes.includes(s.biome))throw Error('Operasi geografis tidak valid.');
 if(typeof s.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s.id)||[s.island,s.name,s.parent].some(v=>typeof v!=='string'||v.length>80)||!s.name.trim())throw Error('Identitas geografis tidak valid.');
 if(![s.x,s.z,s.radius,s.strength,s.level].every(Number.isSafeInteger)||Math.max(Math.abs(s.x),Math.abs(s.z))>1000000||s.radius<2||s.radius>40||s.strength<1||s.strength>8||s.level<1||s.level>6)throw Error('Parameter brush di luar batas.');
 return s;
}
export function regions(g:Geo){const map=new Map<string,Stroke>();for(const s of g.strokes)if(s.tool==='region')map.set(s.id,s);return [...map.values()]}
export function islands(g:Geo){return [starterIsland,...g.strokes.filter(s=>s.tool==='island')]}
export function baseHeight(x:number,z:number){
 const r=Math.sqrt((x/35)**2+(z/28)**2), coast=1+.055*Math.sin(x*.23)+.045*Math.cos(z*.31);
 if(r>coast)return -1.5;
 if(r>coast-.1)return .15;
 return .8+Math.max(0,1-Math.hypot(x+15,z+12)/12)*7;
}
type Sample={h:number;biome:string;island:string};
const caches=new WeakMap<Geo,Map<string,Stroke[]>>();
export function chunkKey(x:number,z:number){return Math.floor(x/16)+':'+Math.floor(z/16)}
export function chunks(g:Geo){
 let index=caches.get(g);if(index)return index;
 index=new Map();
 for(let x=-3;x<=2;x++)for(let z=-2;z<=1;z++)index.set(x+':'+z,[]);
 for(const s of g.strokes){if(s.tool==='region')continue;
 for(let x=Math.floor((s.x-s.radius)/16);x<=Math.floor((s.x+s.radius)/16);x++)
 for(let z=Math.floor((s.z-s.radius)/16);z<=Math.floor((s.z+s.radius)/16);z++){
 const k=x+':'+z;if(!index.has(k))index.set(k,[]);index.get(k)!.push(s);
 }}
 caches.set(g,index);return index;
}
const smoothMaps=new WeakMap<Stroke,Map<string,number>>();
export function sample(g:Geo,x:number,z:number):Sample{
 let h=baseHeight(x,z), biome='grass',island=h>-.25?starterIsland.id:'';
 for(const s of chunks(g).get(chunkKey(x,z))??[]){
 const dx=x-s.x,dz=z-s.z,d=Math.hypot(dx,dz)/s.radius;
 if(d>1)continue;
 const weight=1-d;
 if(s.tool==='island'){const a=Math.atan2(dz,dx),coast=.85+.06*Math.sin(3*a+s.x)+.05*Math.cos(5*a+s.z);if(d<coast){island=s.id;h=d>coast-.1?.15:.85+Math.max(0,.5-d)*s.strength*2;biome=s.biome}}
 else if(s.tool==='expand'){if(!island||island===s.island){island=s.island;h=Math.max(h,d>.9?.15:.8)}}
 else if(island===s.island){
 if(s.tool==='remove'||s.tool==='water'){h=-1.5;island=''}
 if(s.tool==='raise'||s.tool==='lower')h+=(s.tool==='raise'?1:-1)*weight*s.strength;
 if(s.tool==='smooth'){
 let heights=smoothMaps.get(s);
 if(!heights){heights=new Map();const before={strokes:g.strokes.slice(0,g.strokes.indexOf(s))};
 for(let xx=s.x-s.radius;xx<=s.x+s.radius;xx++)for(let zz=s.z-s.radius;zz<=s.z+s.radius;zz++){
 const average=(sample(before,xx-1,zz).h+sample(before,xx+1,zz).h+sample(before,xx,zz-1).h+sample(before,xx,zz+1).h)/4;
 heights.set(xx+':'+zz,average);
 }smoothMaps.set(s,heights)}
 h+=((heights.get(Math.round(x)+':'+Math.round(z))??h)-h)*weight*s.strength/8;
 }
 if(s.tool==='paint')biome=s.biome;
 }
 }
 return {h,biome,island};
}
export function applyStroke(g:Geo,s:Stroke){
 const all=islands(g), regs=regions(g),distance=(p:{x:number;z:number})=>Math.hypot(p.x-s.x,p.z-s.z);
 if(s.tool==='region'){
 const old=regs.find(r=>r.id===s.id);
 if(old&&(old.level!==s.level||old.parent!==s.parent))throw Error('Induk dan tingkat wilayah harus tetap.');
 if(s.level===1?s.parent!=='nation-001':!regs.some(p=>p.id===s.parent&&p.level===s.level-1&&distance(p)+s.radius<=p.radius))throw Error('Batas wilayah harus berada di dalam induk yang sesuai.');
 if(regs.some(c=>c.parent===s.id&&distance(c)+c.radius>s.radius))throw Error('Wilayah anak berada di luar batas.');
 if(regs.some(c=>c.id!==s.id&&c.parent===s.parent&&distance(c)<c.radius+s.radius))throw Error('Batas wilayah setingkat bertumpang tindih.');
 }
 if(s.tool!=='region'&&g.strokes.some(p=>p.id===s.id)||s.tool==='region'&&all.some(p=>p.id===s.id))throw Error('ID sudah digunakan.');
 if(s.tool!=='island'&&!all.some(i=>i.id===s.island))throw Error('Pulau tidak ditemukan.');
 if(s.tool==='island'&&all.some(p=>distance(p)<=p.radius+s.radius+2))throw Error('Pulau baru harus berada di laut terbuka.');
 let touches=false;
 for(let x=s.x-s.radius;x<=s.x+s.radius;x++)for(let z=s.z-s.radius;z<=s.z+s.radius;z++){
 if(Math.hypot(x-s.x,z-s.z)>s.radius)continue;
 const p=sample(g,x,z);
 if(s.tool==='island'&&p.island||s.tool==='expand'&&p.island&&p.island!==s.island)throw Error('Bentrok dengan daratan yang sudah ada.');
 if(p.island===s.island)touches=true;
 }
 if(s.tool!=='island'&&!touches)throw Error('Brush harus menyentuh pulau terpilih.');
 return {strokes:[...g.strokes,s]};
}
