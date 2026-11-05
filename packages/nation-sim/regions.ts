import {placementError,REGION_ID,type World,type WorldObject,type Asset} from '../nation-core/world.ts';
import type {Geo,Stroke} from '../nation-core/geography.ts';
import {SCENES,getScene,getAdmin,type SceneId,type SceneDefinition} from './atlas.ts';
import {regionalLayout} from './layout.ts';
import type {NationBuilding} from './catalog.ts';
import {ROAD_WIDTH,type RoadSegment} from './spatial.ts';
import type {DemoWorld} from '../world-engine/demo-presentation.ts';
export type RoadClass='arterial'|'collector'|'local'|'village';
export type NationPresentation={scene:SceneId;adminId:string;origin:{x:number;z:number};extent:number;buildings:NationBuilding[];segments:RoadSegment[];roads:Record<string,RoadClass>;stream:{loaded:string[];total:number}};
export type NationWorld=DemoWorld&{nation:NationPresentation};
export const stableId=(s:string,n:number)=>`ca000000-${s.length.toString(16).padStart(4,'0')}-4000-8000-${(Math.abs([...s].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619),2166136261))%100000000).toString().padStart(8,'0')}${n.toString().padStart(4,'0')}`;
export function regionGeo(s:SceneDefinition):Geo{
 const strokes:Stroke[]=[],r=s.extent/2;
 const add=(tool:Stroke['tool'],x:number,z:number,radius:number,strength=1,biome:Stroke['biome']='grass')=>strokes.push({id:stableId(s.id,strokes.length+1),type:'geo',tool,island:'island-001',name:s.name,x,z,radius,strength,biome,level:1,parent:'nation-001'});
 // Independently generated mainland/town geography, not a renamed copy of Demo City.
 add('lower',-15,-12,12,7);
 const far=s.extent*1.5;
 for(let x=-far+24;x<=(s.style==='coastal'?r*.65:far-12);x+=32)for(let z=-far+24;z<=far-12;z+=32)add('expand',Math.round(x),Math.round(z),36);
 const hx=-r*1.7+(s.seed%11-5)*2,hz=-r*1.5+(Math.floor(s.seed/11)%9-4)*2;
 add('raise',Math.round(hx),Math.round(hz),24,s.style==='rural'?7:s.style==='regency'?3:4,'forest');add('paint',Math.round(hx),Math.round(hz),28,1,'forest');
 add('raise',Math.round(r*1.6),Math.round(-r*1.7),26,2+s.seed%3,'forest');
 if(s.style==='national'||s.style==='provincial')for(let z=-r;z<=r;z+=10)add('water',Math.round(-r*.9+Math.sin(z*.05)*5),z,7);
 if(s.style==='coastal'){add('paint',Math.round(r*.55),Math.round(r*.35),28,1,'sand');add('water',Math.round(r*.7),Math.round(r*.55),24)}
 return {strokes};
}
export function regionWorld(id:SceneId):NationWorld{
 const s=getScene(id);if(!s)throw Error('Scene tidak ditemukan.');const geo=regionGeo(s),roads:Record<string,RoadClass>={},objects:WorldObject[]=[];let serial=100;
 const add=(asset:Asset,x:number,z:number,rotation=0,roadClass:RoadClass='local')=>{const o:WorldObject={id:stableId(id,serial++),asset,x,z,rotation,regionId:REGION_ID,ownerId:'administrator',assetVersion:1};if(!placementError(o,objects,geo)){objects.push(o);if(asset==='road')roads[o.id]=roadClass}};
 const layout=regionalLayout(id,geo);
 for(const r of layout.roads){const dx=Math.sign(r.x2-r.x1),dz=Math.sign(r.z2-r.z1),length=Math.hypot(r.x2-r.x1,r.z2-r.z1);for(let u=0;u<=length;u+=2)add('road',r.x1+dx*u,r.z1+dz*u,0,r.class)}
 const region=getAdmin(s.region)!;
 return {id:'nation-001',revision:0,terrainVersion:1,geo,objects,presentation:{kind:'visual-fixture',scenario:'construction',buildings:[],reservedSites:id==='village'?[{x:-50,z:-50,w:20,d:20},{x:50,z:-50,w:20,d:20},{x:50,z:50,w:20,d:20}]:[],districts:[{id:s.region,name:region.name,x:0,z:0,span:s.overview,role:s.style==='national'?'capital':s.style==='rural'?'village':s.style==='provincial'?'province':s.style==='coastal'?'coastal':'city'}],avenues:[]},nation:{scene:id,adminId:s.region,origin:s.origin,extent:s.extent,buildings:layout.buildings,segments:layout.roads,roads,stream:{loaded:[id],total:8}}};
}

export function regionalSnapshot(base:NationWorld,buildings:NationBuilding[],segments:RoadSegment[],revision=0):NationWorld{
 const tiles=new Map<string,WorldObject>(),roads:Record<string,RoadClass>={};for(const r of segments){const length=Math.hypot(r.x2-r.x1,r.z2-r.z1),dx=(r.x2-r.x1)/length,dz=(r.z2-r.z1)/length;for(let u=0;u<=length;u+=2){const x=Math.round(r.x1+dx*u),z=Math.round(r.z1+dz*u),key=x+':'+z,id=`ca000001-${(SCENES.findIndex(s=>s.id===base.nation.scene)+1).toString(16).padStart(4,'0')}-4000-8000-${((x+1048576)*2097152+z+1048576).toString(16).padStart(12,'0')}`;if(!tiles.has(key))tiles.set(key,{id,asset:'road',x,z,rotation:0,regionId:REGION_ID,ownerId:'administrator',assetVersion:1});if(!roads[id]||ROAD_WIDTH[r.class]>ROAD_WIDTH[roads[id]])roads[id]=r.class}}
 return {...base,revision,objects:[...tiles.values()],nation:{...base.nation,buildings,segments,roads}};
}
