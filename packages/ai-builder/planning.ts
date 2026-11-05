import {applyCommand,placementError,footprint,REGION_ID,type World,type WorldObject,type Asset} from '../nation-core/world.ts';
import {demoPresentation,type DemoWorld,type FixtureBuilding,type DemoPresentation} from '../world-engine/demo-presentation.ts';
import {sample,emptyGeo} from '../nation-core/geography.ts';

export type RegionKind='capital'|'province'|'city'|'village'|'coastal'|'green';
export const PROFILES={
 capital:{name:'Ibu kota',rank:0,radius:16,spacing:8,homes:64,parallel:4,vegetation:.25},
 province:{name:'Pusat provinsi',rank:1,radius:12,spacing:12,homes:32,parallel:3,vegetation:.45},
 city:{name:'Kabupaten / kota',rank:2,radius:10,spacing:12,homes:20,parallel:2,vegetation:.5},
 village:{name:'Desa / perkampungan',rank:3,radius:14,spacing:0,homes:8,parallel:1,vegetation:.9},
 coastal:{name:'Perkampungan pesisir',rank:3,radius:12,spacing:12,homes:14,parallel:2,vegetation:.7},
 green:{name:'Kawasan hijau',rank:4,radius:8,spacing:0,homes:0,parallel:1,vegetation:1},
} as const;
export type BuildIntent='region'|'civic'|'housing'|'facilities';
export type BuildRequest={kind:RegionKind;x:number;z:number;seed:number;intent?:BuildIntent};
export type Target={type:'domain';object:WorldObject}|{type:'fixture';building:FixtureBuilding};
export type Job={id:string;target:Target;dependencies:string[];duration:number};
export type Zone={kind:'civic'|'housing'|'commercial'|'public'|'green';x:number;z:number;w:number;d:number};
export type RegionPlan={request:BuildRequest;profile:typeof PROFILES[RegionKind];jobs:Job[];zones:Zone[];rejected:{asset:string;x:number;z:number;reason:string}[];base:World;final:World};
export const COMMANDS=['bangun ibu kota','bangun pusat provinsi','kembangkan kabupaten','buat perkampungan pesisir','bangun kawasan pemerintahan','bangun area hunian sedang','tambah fasilitas umum','buat desa','bangun kawasan hijau'];
export function parseBuildCommand(text:string):Pick<BuildRequest,'kind'|'intent'>{
 const t=text.trim().toLowerCase().replace(/\s+/g,' ');if(t.length>120)throw Error('Perintah terlalu panjang.');
 if(/pusat provinsi/.test(t))return {kind:'province',intent:'region'};
 if(/ibu kota/.test(t))return {kind:'capital',intent:'region'};
 if(/kabupaten|kota/.test(t))return {kind:'city',intent:'region'};
 if(/pesisir/.test(t))return {kind:'coastal',intent:'region'};
 if(/pemerintahan/.test(t))return {kind:'capital',intent:'civic'};
 if(/hunian sedang/.test(t))return {kind:'city',intent:'housing'};
 if(/fasilitas umum/.test(t))return {kind:'city',intent:'facilities'};
 if(/desa|perkampungan/.test(t))return {kind:'village',intent:'region'};
 if(/hijau/.test(t))return {kind:'green',intent:'region'};
 throw Error('Perintah belum dikenali. Gunakan contoh perintah yang tersedia.');
}
function hash(s:string){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const uuid=(s:string)=>`b6000000-${hash(s).toString(16).slice(0,4).padStart(4,'0')}-4000-8000-${hash(s+'object').toString(16).padStart(12,'0')}`;
const pos=(t:Target)=>t.type==='domain'?t.object:t.building;
/** Pure, bounded rule planner. Never imports persistence, fetch, credentials or paid model APIs. */
export function planRegion(input:World,request:BuildRequest):RegionPlan{
 if(!Object.hasOwn(PROFILES,request.kind)||![request.x,request.z,request.seed].every(Number.isSafeInteger)||Math.abs(request.x)>999950||Math.abs(request.z)>999950||request.x%2||request.z%2||request.intent&&!['region','civic','housing','facilities'].includes(request.intent))throw Error('Parameter rencana tidak valid.');
 const base=structuredClone(input),profile=PROFILES[request.kind],jobs:Job[]=[],rejected:RegionPlan['rejected']=[],zones:Zone[]=[],r=profile.radius;
 const original=demoPresentation(base),presentation:DemoPresentation=original??{kind:'visual-fixture',buildings:[],districts:[]};
 let final:World={...base,presentation} as DemoWorld;
 const prefix=JSON.stringify(request)+'/'+base.revision,roads=new Map<string,{id:string;object:WorldObject}>();
 for(const object of base.objects)if(object.asset==='road')roads.set(object.x+':'+object.z,{id:'existing:'+object.id,object});
 const reserve=(o:{x:number;z:number},w:number,d:number)=>demoPresentation(final)!.buildings.some(b=>Math.abs(o.x-b.x)<(w+b.w)/2&&Math.abs(o.z-b.z)<(d+b.d)/2);
 const add=(asset:Asset,x:number,z:number,rotation=0)=>{
  const object:WorldObject={id:uuid(prefix+'/'+asset+'/'+x+'/'+z),asset,x,z,rotation,regionId:REGION_ID,ownerId:'administrator',assetVersion:1};
  if(asset==='road'&&roads.has(x+':'+z))return;
  const f=footprint(object),issue=placementError(object,final.objects,final.geo)|| (reserve(object,f.w,f.d)?'Aset publik fixture memakai tapak ini.':null);
  if(issue){rejected.push({asset,x,z,reason:issue});return}
  if(final.objects.length>=2000){rejected.push({asset,x,z,reason:'Batas domain 2000 objek.'});return}
  const nearby=[...roads.values()].sort((a,b)=>Math.hypot(x-a.object.x,z-a.object.z)-Math.hypot(x-b.object.x,z-b.object.z));
  const neighbor=asset==='road'?nearby.find(a=>Math.abs(x-a.object.x)+Math.abs(z-a.object.z)===2):nearby[0];
  if(asset==='road'&&roads.size&&!neighbor){rejected.push({asset,x,z,reason:'Jalan belum dapat tersambung.'});return}
  if(asset!=='road'&&(!neighbor||(['hall','clinic'].includes(asset)&&Math.hypot(x-neighbor.object.x,z-neighbor.object.z)>6))){rejected.push({asset,x,z,reason:'Fasilitas memerlukan akses jalan dekat.'});return}
  const id=object.id,dependencies=neighbor&&!neighbor.id.startsWith('existing:')?[neighbor.id]:[];
  jobs.push({id,target:{type:'domain',object},dependencies,duration:asset==='road'?3:asset==='tree'?4:asset==='park'?7:asset==='hall'?16:10});
  final=applyCommand(final,{type:'place',object});if(asset==='road')roads.set(x+':'+z,{id,object});
 };
 const candidates=new Map<string,{x:number;z:number}>(),road=(x:number,z:number)=>candidates.set(x+':'+z,{x,z});
 for(let u=-r;u<=r;u+=2){road(request.x+u,request.z);if(request.kind!=='green')road(request.x,request.z+u)}
 if(profile.spacing)for(const offset of [-profile.spacing,profile.spacing])for(let u=-r;u<=r;u+=2){road(request.x+u,request.z+offset);road(request.x+offset,request.z+u)}
 let pending=[...candidates.values()].sort((a,b)=>(Math.abs(a.x-request.x)+Math.abs(a.z-request.z))-(Math.abs(b.x-request.x)+Math.abs(b.z-request.z))||a.x-b.x||a.z-b.z);
 for(let round=0;round<=candidates.size&&pending.length;round++){
  const prior=roads.size,next:typeof pending=[];
  for(const p of pending){if(roads.has(p.x+':'+p.z))continue;const connected=!roads.size||[[2,0],[-2,0],[0,2],[0,-2]].some(([dx,dz])=>roads.has((p.x+dx)+':'+(p.z+dz)));if(connected)add('road',p.x,p.z);else next.push(p)}
  if(roads.size===prior){for(const p of next)rejected.push({asset:'road',...p,reason:'Tidak tersambung ke jaringan yang ada.'});break}pending=next;
 }
 if(request.intent!=='housing'){
  if(request.intent!=='facilities'&&!['village','coastal','green'].includes(request.kind))add('hall',request.x+4,request.z-4);
  if(request.kind!=='green')add('clinic',request.x-4,request.z-4);
  for(const [x,z]of [[4,4],[-4,4]])add('park',request.x+x,request.z+z);
  zones.push({kind:'civic',x:request.x+4,z:request.z-4,w:6,d:6},{kind:'public',x:request.x-4,z:request.z+4,w:6,d:6});
 }
 if(request.kind!=='green'&&request.intent!=='housing'){
  const b:FixtureBuilding={id:uuid(prefix+'/public'),kind:request.kind==='village'?'cafe':'shophouse',name:request.kind==='village'?'Warung desa · fixture':'Koridor niaga · fixture',x:request.x+4,z:request.z-r+3,rotation:0,w:3.5,d:2.6};
  const conflict=final.objects.some(o=>{const f=footprint(o);return Math.abs(o.x-b.x)<(f.w+b.w)/2&&Math.abs(o.z-b.z)<(f.d+b.d)/2})||reserve(b,b.w,b.d);
  const heights=[-1,0,1].flatMap(x=>[-1,0,1].map(z=>sample(final.geo??emptyGeo,b.x+x*b.w/2,b.z+z*b.d/2).h)),access=[...roads.values()].sort((a,c)=>Math.hypot(a.object.x-b.x,a.object.z-b.z)-Math.hypot(c.object.x-b.x,c.object.z-b.z))[0];
  if(!conflict&&heights.every(h=>h>=.5)&&Math.max(...heights)-Math.min(...heights)<=.6&&access&&Math.hypot(access.object.x-b.x,access.object.z-b.z)<5){jobs.push({id:b.id,target:{type:'fixture',building:b},dependencies:access.id.startsWith('existing:')?[]:[access.id],duration:12});final={...final,revision:final.revision+1,presentation:{...demoPresentation(final)!,buildings:[...demoPresentation(final)!.buildings,b]}} as DemoWorld;zones.push({kind:'commercial',x:b.x,z:b.z,w:4,d:4})}else rejected.push({asset:'commercial-fixture',x:b.x,z:b.z,reason:'Tapak publik memerlukan daratan datar, akses jalan dan ruang bebas.'});
 }
 const parcels:{x:number;z:number;distance:number;facing:number}[]=[];
 for(let z=-r;z<=r;z+=2)for(let x=-r;x<=r;x+=2){const wx=request.x+x,wz=request.z+z,near=[...roads.values()].sort((a,b)=>Math.hypot(wx-a.object.x,wz-a.object.z)-Math.hypot(wx-b.object.x,wz-b.object.z))[0];if(!near)continue;const distance=Math.hypot(wx-near.object.x,wz-near.object.z);if(distance<2||distance>2.1||request.kind==='village'&&(x%6!==0||Math.abs(z)<2))continue;const dx=near.object.x-wx,dz=near.object.z-wz;parcels.push({x:wx,z:wz,distance:Math.hypot(x,z),facing:Math.abs(dx)>Math.abs(dz)?dx>0?1:3:dz>0?0:2})}
 parcels.sort((a,b)=>a.distance-b.distance||hash(prefix+'/'+a.x+':'+a.z)-hash(prefix+'/'+b.x+':'+b.z));
 const homes=request.intent==='civic'||request.intent==='facilities'?0:profile.homes;let placed=0;
 for(const p of parcels){if(placed>=homes)break;const n=jobs.length;add('house',p.x,p.z,p.facing);if(jobs.length>n)placed++}
 const greenStep=profile.vegetation>=.7?4:8;
 for(let x=-r;x<=r;x+=greenStep)for(const z of [-r-4,r+4])add(request.kind==='green'?'park':'tree',request.x+x,request.z+z);
 zones.push({kind:'housing',x:request.x,z:request.z,w:r*2,d:r*2},{kind:'green',x:request.x-r,z:request.z+r,w:6,d:6});
 const parentRole=request.kind==='province'?'capital':request.kind==='city'?'province':'city',parent=presentation.districts.find(d=>d.role===parentRole);
 const level=request.kind==='capital'?'national':request.kind==='province'?'province':request.kind==='city'?'city':request.kind==='village'?'village':'landscape';
 const districts=[...presentation.districts,{id:'planned-'+hash(prefix),name:profile.name,x:request.x,z:request.z,span:r*2+12,role:request.kind,level,parentId:parent?.id}];
 const reservedSites=jobs.map(j=>j.target.type==='domain'?{x:j.target.object.x,z:j.target.object.z,...footprint(j.target.object)}:{x:j.target.building.x,z:j.target.building.z,w:j.target.building.w,d:j.target.building.d});
 const priorAvenues=presentation.avenues??(original&&original.scenario!=='construction'?[{axis:'x' as const,value:24},{axis:'z' as const,value:6}]:[]);
 final={...final,objects:[...final.objects].sort((a,b)=>a.id.localeCompare(b.id)),presentation:{...demoPresentation(final)!,districts,reservedSites,avenues:[...priorAvenues,...(profile.rank<2?[{axis:'x' as const,value:request.x},{axis:'z' as const,value:request.z}]:[])]}} as DemoWorld;
 return {request:{...request},profile,jobs,zones,rejected,base,final};
}
export type ConstructionStage='queued'|'survey'|'foundation'|'frame'|'complete';
export const stageOf=(progress:number):ConstructionStage=>progress>=1?'complete':progress>=.58?'frame':progress>=.24?'foundation':progress>0?'survey':'queued';
export class ConstructionSimulation{
 readonly plan:RegionPlan;world:World;time=0;states=new Map<string,{progress:number;stage:ConstructionStage}>();error='';
 constructor(plan:RegionPlan){this.plan=structuredClone(plan);this.world={...structuredClone(plan.base),presentation:{...(demoPresentation(plan.base)??{kind:'visual-fixture',buildings:[],districts:[]}),districts:demoPresentation(plan.final)!.districts,avenues:demoPresentation(plan.final)!.avenues,reservedSites:demoPresentation(plan.final)!.reservedSites}} as DemoWorld;for(const j of plan.jobs)this.states.set(j.id,{progress:0,stage:'queued'})}
 step(dt:number){if(!Number.isFinite(dt)||dt<=0||dt>1)throw Error('Langkah waktu tidak valid.');if(this.error)return;this.time+=dt;const done=new Set([...this.states].filter(([,s])=>s.stage==='complete').map(([id])=>id));let active=[...this.states.values()].filter(s=>s.progress>0&&s.progress<1).length;
  for(const j of this.plan.jobs){const s=this.states.get(j.id)!;if(s.progress>=1)continue;if(s.progress===0){if(active>=this.plan.profile.parallel||j.dependencies.some(id=>!done.has(id)))continue;active++}
   s.progress=Math.min(1,s.progress+dt/j.duration);s.stage=stageOf(s.progress);
   if(s.stage==='complete'){try{if(j.target.type==='domain')this.world=applyCommand(this.world,{type:'place',object:j.target.object});else this.world={...this.world,revision:this.world.revision+1,presentation:{...(demoPresentation(this.world)??{kind:'visual-fixture',districts:[],buildings:[]}),buildings:[...(demoPresentation(this.world)?.buildings??[]),j.target.building]}} as DemoWorld;done.add(j.id);active--}catch(e){this.error=String(e);return}}
  }
  if(this.complete)this.world={...this.world,objects:[...this.world.objects].sort((a,b)=>a.id.localeCompare(b.id))};
 }
 get complete(){return [...this.states.values()].every(s=>s.stage==='complete')}
 get sites(){return this.plan.jobs.filter(j=>{const s=this.states.get(j.id)!;return s.progress>0&&s.progress<1}).map(j=>({...j,...this.states.get(j.id)!,position:pos(j.target)}))}
}
