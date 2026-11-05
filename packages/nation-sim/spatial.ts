import {sample,type Geo} from '../nation-core/geography.ts';
import {getScene,type SceneId} from './atlas.ts';
import {BUILDINGS,HEIGHT_LIMIT,dimensions,type NationBuilding} from './catalog.ts';
export type RoadSegment={id:string;x1:number;z1:number;x2:number;z2:number;class:'arterial'|'collector'|'local'|'village'};
export const ROAD_WIDTH={arterial:6,collector:4,local:2.8,village:1.8};
export const ROAD_SIDEWALK={arterial:1.5,collector:1.2,local:.8,village:.35};
export type SpatialContext={scene:SceneId;extent?:number;geo:Geo;roads:RoadSegment[];buildings:NationBuilding[]};
export function overlaps(a:{x:number;z:number;w:number;d:number},b:{x:number;z:number;w:number;d:number},gap=0){return Math.abs(a.x-b.x)<(a.w+b.w)/2+gap&&Math.abs(a.z-b.z)<(a.d+b.d)/2+gap}
export function roadEnvelope(r:RoadSegment){const half=ROAD_WIDTH[r.class]/2+ROAD_SIDEWALK[r.class];return{x:(r.x1+r.x2)/2,z:(r.z1+r.z2)/2,w:Math.abs(r.x2-r.x1)+half*2,d:Math.abs(r.z2-r.z1)+half*2}}
export function buildingError(b:NationBuilding,ctx:SpatialContext):string|null{
 const scene=getScene(ctx.scene),a=BUILDINGS[b.asset];
 if(!b||typeof b.id!=='string'||Object.keys(b).sort().join(',')!=='asset,id,region,rotation,variant,version,x,z,zone')return 'Struktur aset tidak valid.';
 if(!scene||!a||b.version!==1||!Number.isInteger(b.rotation)||b.rotation<0||b.rotation>3||!Number.isSafeInteger(b.variant)||b.variant<0||b.variant>15||!/^[-a-zA-Z0-9]{1,80}$/.test(b.id)||b.region!==scene.region)return 'Identitas aset atau wilayah tidak valid.';
 if(![b.x,b.z].every(v=>Number.isFinite(v)&&v%2===0))return 'Tapak harus berada pada grid 2 unit.';
 if(!a.zones.includes(b.zone))return 'Jenis bangunan tidak sesuai zoning.';
 if(a.height>HEIGHT_LIMIT[ctx.scene])return 'Ketinggian melampaui batas wilayah.';
 const lot={...dimensions(b),x:b.x,z:b.z},body={...dimensions(b,'body'),x:b.x,z:b.z};
 if(Math.abs(b.x)+lot.w/2>(ctx.extent??scene.extent)/2||Math.abs(b.z)+lot.d/2>(ctx.extent??scene.extent)/2)return 'Kavling berada di luar region aktif.';
 const heights:number[]=[];
 for(let x=-lot.w/2;x<=lot.w/2;x+=2)for(let z=-lot.d/2;z<=lot.d/2;z+=2)heights.push(sample(ctx.geo,b.x+x,b.z+z).h);
 if(Math.min(...heights)<.5)return 'Seluruh tapak harus di daratan.';
 if(Math.max(...heights)-Math.min(...heights)>.65)return 'Kemiringan tapak terlalu tinggi.';
 if(ctx.buildings.some(o=>o.id!==b.id&&overlaps(lot,{...dimensions(o),x:o.x,z:o.z},.5)))return 'Kavling bertabrakan dengan bangunan lain.';
 if(ctx.roads.some(r=>overlaps(lot,roadEnvelope(r))))return 'Kavling memotong jalan atau trotoar.';
 if(ctx.roads.some(r=>overlaps(body,roadEnvelope(r),a.setback)))return 'Setback bangunan terhadap jalan kurang.';
 const access=ctx.roads.some(r=>{const e=roadEnvelope(r),dx=Math.max(0,Math.abs(b.x-e.x)-(lot.w+e.w)/2),dz=Math.max(0,Math.abs(b.z-e.z)-(lot.d+e.d)/2);return Math.hypot(dx,dz)<=18});
 return access?null:'Kavling belum memiliki akses jalan.';
}
export function buildingSolid(buildings:NationBuilding[],x:number,z:number,radius=.28){return buildings.some(b=>{const d=dimensions(b,'body');return Math.abs(b.x-x)<d.w/2+radius&&Math.abs(b.z-z)<d.d/2+radius})}

export function roadNetworkError(roads:RoadSegment[],scene:SceneId,geo:Geo,extent?:number){
 const definition=getScene(scene);if(!definition||!Array.isArray(roads)||roads.length>100||new Set(roads.map(r=>r.id)).size!==roads.length)return 'Jaringan jalan tidak valid.';
 for(const r of roads){if(!r||typeof r.id!=='string'||r.id.length>80||!Object.hasOwn(ROAD_WIDTH,r.class)||![r.x1,r.x2,r.z1,r.z2].every(n=>Number.isSafeInteger(n)&&n%2===0&&Math.abs(n)<=(extent??definition.extent)/2)||r.x1!==r.x2&&r.z1!==r.z2||r.x1===r.x2&&r.z1===r.z2)return 'Segmen jalan tidak valid.';const length=Math.hypot(r.x2-r.x1,r.z2-r.z1),dx=(r.x2-r.x1)/length,dz=(r.z2-r.z1)/length,half=ROAD_WIDTH[r.class]/2+ROAD_SIDEWALK[r.class];for(let u=0;u<=length;u+=1)for(const side of[-1,0,1]){if(sample(geo,r.x1+dx*u-dz*side*half,r.z1+dz*u+dx*side*half).h<.5)return 'Jalan atau trotoar memotong air.'}}
 return null;
}
export function fitRoadsToTerrain(input:RoadSegment[],geo:Geo):RoadSegment[]{
 const result:RoadSegment[]=[];for(const r of input){const length=Math.hypot(r.x2-r.x1,r.z2-r.z1),dx=(r.x2-r.x1)/length,dz=(r.z2-r.z1)/length,half=ROAD_WIDTH[r.class]/2+ROAD_SIDEWALK[r.class];let start:number|null=null,part=0;const close=(end:number)=>{if(start!==null&&end-start>=2)result.push({...r,id:r.id+'-part-'+part++,x1:Math.round(r.x1+dx*start),z1:Math.round(r.z1+dz*start),x2:Math.round(r.x1+dx*end),z2:Math.round(r.z1+dz*end)});start=null};for(let u=0;u<length;u+=2){const dry=[0,1,2].every(t=>[-1,0,1].every(side=>sample(geo,r.x1+dx*(u+t)-dz*side*half,r.z1+dz*(u+t)+dx*side*half).h>=.5));if(dry){if(start===null)start=u}else close(u)}close(length)}return result;
}
