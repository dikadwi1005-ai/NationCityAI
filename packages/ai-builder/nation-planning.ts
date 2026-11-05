import{getScene,type SceneId}from'../nation-sim/atlas.ts';import{BUILDINGS,HEIGHT_LIMIT,type BuildingKind,type NationBuilding,type Zone}from'../nation-sim/catalog.ts';import{regionWorld,regionalSnapshot,type NationWorld}from'../nation-sim/regions.ts';import{buildingError,fitRoadsToTerrain,roadNetworkError,type RoadSegment}from'../nation-sim/spatial.ts';import{sample}from'../nation-core/geography.ts';
export const NATION_COMMANDS=['Bangun ibu kota negara','Bangun pusat pemerintahan provinsi','Buat kota modern dengan kawasan bisnis','Kembangkan kota menjadi metropolitan','Bangun pusat kabupaten','Buat desa pertanian','Bangun kawasan pesisir','Perluas jalan dan transportasi','Bangun kompleks kantor gubernur','Bangun kawasan gedung bertingkat','Bangun desa pesisir','Kembangkan kabupaten','Bangun kawasan hunian sedang'];
export type NationIntent={scene:SceneId;mode:'region'|'growth'|'transport'|'government'|'highrise'|'housing'};
export function parseNationCommand(command:string,current:SceneId='city'):NationIntent{
 const t=command.trim().toLowerCase().replace(/\s+/g,' ');if(!t||t.length>160)throw Error('Perintah harus 1–160 karakter.');
 if(/kantor gubernur/.test(t))return{scene:'province',mode:'government'};
 if(/provinsi/.test(t))return{scene:'province',mode:'region'};
 if(/ibu kota|ibukota/.test(t))return{scene:'capital',mode:'region'};
 if(/metropolitan/.test(t))return{scene:'metropolis',mode:'growth'};
 if(/modern|bisnis/.test(t))return{scene:'metropolis',mode:'region'};
 if(/kabupaten/.test(t))return{scene:'regency',mode:/kembang/.test(t)?'growth':'region'};
 if(/pesisir|waterfront/.test(t))return{scene:'coast',mode:'region'};
 if(/desa|pertanian/.test(t))return{scene:'village',mode:'region'};
 if(/hunian|perumahan/.test(t))return{scene:current,mode:'housing'};
 if(/jalan|transportasi/.test(t))return{scene:current,mode:'transport'};
 if(/gedung bertingkat|gedung tinggi/.test(t))return{scene:HEIGHT_LIMIT[current]>=33?current:'metropolis',mode:'highrise'};
 if(/pemerintahan/.test(t))return{scene:current,mode:'government'};
 if(/kota/.test(t))return{scene:current,mode:'region'};
 throw Error('Perintah belum dikenali planner aturan lokal. Pilih contoh atau sebut jenis wilayah.');
}
export type NationJob={id:string;kind:'road'|'building';road?:RoadSegment;building?:NationBuilding;dependencies:string[];duration:number};
export type NationPlan={command:string;intent:NationIntent;seed:number;base:NationWorld;roads:RoadSegment[];buildings:NationBuilding[];jobs:NationJob[];zones:{kind:Zone;x:number;z:number;w:number;d:number}[];analysis:{sampled:number;dry:number;steep:number;water:number;center:{x:number;z:number}};rejected:number;ruleBased:true};
const hash=(s:string)=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const governments:Record<SceneId,BuildingKind>={capital:'palace',province:'governor',metropolis:'mayor',city:'mayor',regency:'regent',subdistrict:'camat',village:'village-hall',coast:'community'};
export function planNation(command:string,options:{seed?:number;current?:SceneId;existing?:NationWorld}={}):NationPlan{
 const intent=parseNationCommand(command,options.current),definition=getScene(intent.scene)!,seed=options.seed??6,generated=regionWorld(intent.scene),existing=options.existing?.nation.scene===intent.scene?structuredClone(options.existing):undefined,base=existing??regionalSnapshot(generated,[],[],0),geo=base.geo!,buildings=[...base.nation.buildings],roads=[...base.nation.segments],zones:NationPlan['zones']=[],jobs:NationJob[]=[],analysis={sampled:0,dry:0,steep:0,water:0,center:{x:0,z:0}},r=definition.extent/2-8;let rejected=0,sumX=0,sumZ=0;
 for(let x=-r;x<=r;x+=8)for(let z=-r;z<=r;z+=8){analysis.sampled++;const a=sample(geo,x,z).h;if(a<.5){analysis.water++;continue}if(Math.abs(a-sample(geo,x+2,z).h)>.65||Math.abs(a-sample(geo,x,z+2).h)>.65){analysis.steep++;continue}analysis.dry++;sumX+=x;sumZ+=z}
 if(analysis.dry<8)throw Error('Terrain tidak menyediakan cukup lahan datar dan kering.');analysis.center={x:Math.round(sumX/analysis.dry/4)*4,z:Math.round(sumZ/analysis.dry/4)*4};
 if(!roads.length){const rural=intent.scene==='village',urban=['capital','metropolis'].includes(intent.scene),radius=rural?36:urban?96:72,axes=rural?[-36,0,36]:urban?[-96,-48,0,48,96]:[-72,-24,24,72],segments:RoadSegment[]=[];
  for(const value of axes)for(const vertical of[false,true]){const a=Math.max(-radius,Math.min(radius,value+Math.max(-8,Math.min(8,vertical?analysis.center.x:analysis.center.z)))),x=vertical?a:-radius,z=vertical?-radius:a;segments.push({id:`plan-${seed}-${intent.scene}-road-${segments.length}`,x1:x,z1:z,x2:vertical?a:radius,z2:vertical?radius:a,class:rural?'village':Math.abs(value)<=24?'arterial':Math.abs(value)<=48?'collector':'local'})}
  roads.push(...fitRoadsToTerrain(segments,geo));
 }else if(intent.mode==='transport'){
  for(const anchor of roads.filter(r=>r.z1===r.z2).sort((a,b)=>b.x2-a.x2)){const end=Math.min(Math.floor((base.nation.extent/2-4)/2)*2,anchor.x2+16);if(end-anchor.x2<2)continue;const candidate:RoadSegment={id:`plan-${seed}-transport-${anchor.x2}-${anchor.z2}`,x1:anchor.x2,z1:anchor.z2,x2:end,z2:anchor.z2,class:'collector'},fitted=fitRoadsToTerrain([candidate],geo);if(fitted.length){roads.push(...fitted);break}}

 }
 if(existing&&['growth','highrise'].includes(intent.mode)){
  const max=Math.max(...roads.flatMap(r=>[Math.abs(r.x1),Math.abs(r.x2),Math.abs(r.z1),Math.abs(r.z2)])),outer=max+48,extent=Math.min(definition.extent*2,Math.max(base.nation.extent,outer*2+32));base.nation.extent=extent;
  const additions:RoadSegment[]=[];for(const road of [...roads]){const horizontal=road.z1===road.z2;if(horizontal){additions.push({...road,id:road.id+'-east',x1:road.x2,x2:outer},{...road,id:road.id+'-west',x1:-outer,x2:road.x1})}else additions.push({...road,id:road.id+'-north',z1:-outer,z2:road.z1},{...road,id:road.id+'-south',z1:road.z2,z2:outer})}
  for(const side of[-1,1])additions.push({id:'growth-ring-x-'+side,x1:side*outer,z1:-outer,x2:side*outer,z2:outer,class:'collector'},{id:'growth-ring-z-'+side,x1:-outer,z1:side*outer,x2:outer,z2:side*outer,class:'collector'});
  roads.push(...fitRoadsToTerrain(additions,geo));
 }
 const roadIssue=roadNetworkError(roads,intent.scene,geo,base.nation.extent);if(roadIssue)throw Error(roadIssue);
 const priorRoads=new Set(base.nation.segments.map(r=>r.id));for(const road of roads)if(!priorRoads.has(road.id))jobs.push({id:road.id,kind:'road',road,dependencies:[],duration:5+Math.hypot(road.x2-road.x1,road.z2-road.z1)/30});
 const candidateRadius=base.nation.extent/2-4;const candidates:{x:number;z:number;score:number}[]=[];for(let x=Math.ceil(-candidateRadius/4)*4;x<=candidateRadius;x+=4)for(let z=Math.ceil(-candidateRadius/4)*4;z<=candidateRadius;z+=4){const h=sample(geo,x,z).h;if(h<.5||h>1.4)continue;const distance=Math.hypot(x-analysis.center.x,z-analysis.center.z);candidates.push({x,z,score:distance+(hash(seed+':'+x+':'+z)%1000)/1000*18})}candidates.sort((a,b)=>a.score-b.score||a.x-b.x||a.z-b.z);
 const add=(asset:BuildingKind,zone:Zone,preferred?:{x:number;z:number})=>{const sorted=preferred?[...candidates].sort((a,b)=>Math.hypot(a.x-preferred.x,a.z-preferred.z)-Math.hypot(b.x-preferred.x,b.z-preferred.z)):candidates;for(const p of sorted){const b:NationBuilding={id:`plan-${seed}-${intent.scene}-${asset}-${p.x}-${p.z}`,asset,version:1,x:p.x,z:p.z,rotation:0,zone,region:definition.region,variant:hash(seed+':'+p.x+':'+p.z)%8};if(buildings.some(v=>v.id===b.id))continue;const error=buildingError(b,{scene:intent.scene,extent:base.nation.extent,geo,roads,buildings});if(error){rejected++;continue}buildings.push(b);zones.push({kind:zone,x:b.x,z:b.z,w:BUILDINGS[asset].lot[0],d:BUILDINGS[asset].lot[1]});const near=roads.map(r=>({r,d:Math.hypot((r.x1+r.x2)/2-b.x,(r.z1+r.z2)/2-b.z)})).sort((a,b)=>a.d-b.d)[0]?.r;const dependency=near&&jobs.some(j=>j.id===near.id)?[near.id]:[];jobs.push({id:b.id,kind:'building',building:b,dependencies:dependency,duration:10+BUILDINGS[asset].height*.4});return true}return false};
 if(intent.mode!=='transport'){
  if(!buildings.some(b=>b.asset===governments[intent.scene])&&intent.mode!=='highrise'&&intent.mode!=='housing')add(governments[intent.scene],'civic',{x:intent.scene==='capital'?24:0,z:intent.scene==='capital'?-24:0});
  if(intent.scene==='capital'&&intent.mode==='region'){add('ministry','civic',{x:-24,z:-24});add('ministry','civic',{x:72,z:-24})}
  const pool:BuildingKind[]=intent.mode==='housing'?(intent.scene==='village'?['cottage']:['house-two','townhouse','apartment-low','apartment-mid']):intent.mode==='government'?['community','clinic']:intent.mode==='highrise'?['tower','apartment-high','office']:intent.scene==='village'?['cottage','cottage','market','community']:intent.scene==='regency'?['house-two','apartment-low','market','school','clinic']:intent.scene==='coast'?['hotel','shophouse','house-two','market','clinic']:['tower','apartment-high','office','apartment-mid','mall','townhouse','shophouse','hotel','house-two','clinic'];
  const target=intent.mode==='government'?4:intent.mode==='highrise'?7:intent.scene==='village'?9:intent.scene==='regency'?16:intent.scene==='coast'?18:30;
  for(let i=0;i<target;i++){const asset=pool[(i+(seed%pool.length))%pool.length],a=BUILDINGS[asset];if(a.height>HEIGHT_LIMIT[intent.scene])continue;const zone=intent.mode==='housing'?'residential':a.zones.includes('business')?'business':a.zones.includes('civic')?'civic':intent.scene==='village'&&a.zones.includes('rural')?'rural':'residential';add(asset,zone)}
 }
 if(!jobs.length)throw Error('Tidak ada pembangunan baru yang valid. Ubah seed, perintah, atau wilayah.');
 return{command,intent,seed,base,roads,buildings,jobs,zones,analysis,rejected,ruleBased:true};
}
export const NATION_STAGES=['queued','survey','marking','foundation','frame','finish','complete']as const;
export type NationStage=typeof NATION_STAGES[number];
export class NationConstruction{
 plan:NationPlan;time=0;states=new Map<string,{stage:NationStage;progress:number}>();approved=false;private cachedWorld?:NationWorld;private cachedKey='';
 constructor(plan:NationPlan){this.plan=plan;for(const job of plan.jobs)this.states.set(job.id,{stage:'queued',progress:0})}
 approve(){this.approved=true}
 step(dt:number){if(!this.approved)return;if(!Number.isFinite(dt)||dt<0||dt>.5)throw Error('Langkah simulasi di luar batas.');this.time+=dt;let active=[...this.states.values()].filter(s=>s.stage!=='queued'&&s.stage!=='complete').length;const parallel=this.plan.intent.scene==='village'?2:4;
  for(const job of this.plan.jobs){const s=this.states.get(job.id)!;if(s.stage==='complete')continue;if(s.stage==='queued'){if(active>=parallel||job.dependencies.some(id=>this.states.get(id)?.stage!=='complete'))continue;s.stage='survey';active++}s.progress=Math.min(1,s.progress+dt/job.duration);s.stage=s.progress>=1?'complete':s.progress<.1?'survey':s.progress<.2?'marking':s.progress<.4?'foundation':s.progress<.8?'frame':'finish'}
 }
 get complete(){return [...this.states.values()].every(s=>s.stage==='complete')}
 get world(){const key=this.plan.jobs.filter(j=>this.states.get(j.id)?.stage==='complete').map(j=>j.id).join('/');if(this.cachedWorld&&key===this.cachedKey)return this.cachedWorld;this.cachedKey=key;const done=(id:string)=>this.states.get(id)?.stage==='complete',roads=[...this.plan.base.nation.segments,...this.plan.jobs.filter(j=>j.road&&done(j.id)).map(j=>j.road!)],buildings=[...this.plan.base.nation.buildings,...this.plan.jobs.filter(j=>j.building&&done(j.id)).map(j=>j.building!)];return this.cachedWorld=regionalSnapshot(this.plan.base,buildings,roads,buildings.length+roads.length)}
 get active(){return this.plan.jobs.filter(j=>!['queued','complete'].includes(this.states.get(j.id)!.stage)).map(j=>({...j,...this.states.get(j.id)!}))}
}
