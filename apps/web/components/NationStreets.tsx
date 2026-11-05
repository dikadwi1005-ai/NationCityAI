'use client';
import{useMemo,useEffect}from'react';import*as T from'three';import{mergeGeometries}from'three/examples/jsm/utils/BufferGeometryUtils.js';import{sample,type Geo}from'../../../packages/nation-core/geography';import{ROAD_WIDTH,ROAD_SIDEWALK,type RoadSegment}from'../../../packages/nation-sim/spatial';import{dimensions,type NationBuilding}from'../../../packages/nation-sim/catalog';
const cube=new T.BoxGeometry(1,1,1);
export default function NationStreets({roads,buildings,geo}:{roads:RoadSegment[];buildings:NationBuilding[];geo:Geo}){
 const batches=useMemo(()=>{
  const parts=new Map<string,T.BufferGeometry[]>(),dummy=new T.Object3D();
  const box=(x:number,y:number,z:number,w:number,h:number,d:number,color:string)=>{dummy.position.set(x,sample(geo,x,z).h+y,z);dummy.scale.set(w,h,d);dummy.updateMatrix();const g=cube.clone().applyMatrix4(dummy.matrix);if(!parts.has(color))parts.set(color,[]);parts.get(color)!.push(g)};
  for(const r of roads){const horizontal=r.z1===r.z2,w=ROAD_WIDTH[r.class],sw=ROAD_SIDEWALK[r.class],length=Math.hypot(r.x2-r.x1,r.z2-r.z1),dx=Math.sign(r.x2-r.x1),dz=Math.sign(r.z2-r.z1);
   for(let u=0;u<length;u+=2){const x=r.x1+dx*(u+1),z=r.z1+dz*(u+1),junction=roads.some(o=>(o.z1===o.z2)!==horizontal&&Math.abs((horizontal?o.x1:o.z1)-(horizontal?x:z))<ROAD_WIDTH[o.class]/2+ROAD_SIDEWALK[o.class]+1);
    box(x,.06,z,horizontal?2:w,.12,horizontal?w:2,r.class==='village'?'#888d7c':'#626e6a');
    if(!junction){for(const side of [-1,1]){const ox=horizontal?0:side*(w/2+sw/2),oz=horizontal?side*(w/2+sw/2):0;box(x+ox,.13,z+oz,horizontal?2:sw,.15,horizontal?sw:2,'#b3b5a6');box(x+(horizontal?0:side*w/2),.15,z+(horizontal?side*w/2:0),horizontal?2:.12,.2,horizontal?.12:2,'#d0cdbb')}
     if(r.class!=='village'&&u%4===0)box(x,.125,z,horizontal?1.15:.06,.018,horizontal?.06:1.15,'#dbd4b0');
     if(r.class==='arterial')for(const side of [-1,1])box(x+(horizontal?0:side*w*.42),.125,z+(horizontal?side*w*.42:0),horizontal?2:.045,.018,horizontal?.045:2,'#ddd9c7');
    }
   }
  }
  for(const a of roads.filter(r=>r.z1===r.z2))for(const b of roads.filter(r=>r.x1===r.x2)){
   if(b.x1<a.x1||b.x1>a.x2||a.z1<b.z1||a.z1>b.z2)continue;
   for(const side of [-1,1])for(let i=-2;i<=2;i++)box(b.x1+i*.4,.13,a.z1+side*(ROAD_WIDTH[a.class]/2+1),.24,.02,1.4,'#dedccc');
  }
  for(const b of buildings){const lot=dimensions(b);let best:{x:number;z:number;distance:number}|undefined;
   for(const r of roads){const x=Math.max(Math.min(r.x1,r.x2),Math.min(Math.max(r.x1,r.x2),b.x)),z=Math.max(Math.min(r.z1,r.z2),Math.min(Math.max(r.z1,r.z2),b.z)),distance=Math.hypot(x-b.x,z-b.z);if(!best||distance<best.distance)best={x,z,distance}}
   if(best){if(best.x===b.x){const edge=b.z+Math.sign(best.z-b.z)*lot.d/2;box(b.x,.035,(edge+best.z)/2,1.2,.06,Math.abs(best.z-edge),'#bcbba8')}else{const edge=b.x+Math.sign(best.x-b.x)*lot.w/2;box((edge+best.x)/2,.035,b.z,Math.abs(best.x-edge),.06,1.2,'#bcbba8')}}
  }
  return [...parts].map(([color,list])=>{const geometry=mergeGeometries(list);list.forEach(g=>g.dispose());return{geometry,material:new T.MeshStandardMaterial({color,roughness:.94})}});
 },[roads,buildings,geo]);useEffect(()=>()=>batches.forEach(b=>{b.geometry.dispose();b.material.dispose()}),[batches]);return <group name="hierarchical-streets" raycast={()=>null}>{batches.map(b=><mesh key={b.material.uuid} geometry={b.geometry} material={b.material} receiveShadow/>)}</group>;
}
