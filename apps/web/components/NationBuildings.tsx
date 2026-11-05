'use client';
import{useMemo,useEffect,useRef}from'react';import{useFrame,type ThreeEvent}from'@react-three/fiber';
import * as T from'three';import{mergeGeometries}from'three/examples/jsm/utils/BufferGeometryUtils.js';
import{localWorldClock}from'../../../packages/nation-sim/world-clock';
import{architecture,type ArchitecturalPart}from'../../../packages/nation-sim/architecture';import{dimensions,type NationBuilding}from'../../../packages/nation-sim/catalog';import{sample,type Geo}from'../../../packages/nation-core/geography';import{useQuality}from'../../../packages/world-engine/quality-context';
const cube=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(.5,.5,1,10),roof=new T.BufferGeometry();
const vertices=[[-.5,0,-.5],[.5,0,-.5],[0,1,-.5],[-.5,0,.5],[.5,0,.5],[0,1,.5]];
roof.setAttribute('position',new T.Float32BufferAttribute([[0,2,1],[3,4,5],[0,3,5],[0,5,2],[1,2,5],[1,5,4],[0,1,4],[0,4,3]].flatMap(f=>f.flatMap(i=>vertices[i])),3));roof.computeVertexNormals();
type Batch={geometry:T.BufferGeometry;material:T.MeshStandardMaterial;ranges:{end:number;id:string}[]};
function compile(buildings:NationBuilding[],geo:Geo,detail:boolean):Batch[]{
 const batches=new Map<string,{parts:T.BufferGeometry[];ranges:{end:number;id:string}[];triangles:number}>(),dummy=new T.Object3D(),color=new T.Color();
 for(const b of buildings){const root=new T.Matrix4().compose(new T.Vector3(b.x,sample(geo,b.x,b.z).h+.03,b.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),b.rotation*Math.PI/2),new T.Vector3(1,1,1));
  for(const p of architecture(b,detail)){
   const key=p.material;let batch=batches.get(key);if(!batch){batch={parts:[],ranges:[],triangles:0};batches.set(key,batch)}
   const source=p.shape==='roof'?roof:p.shape==='cylinder'?cylinder:cube,g=source.index?source.toNonIndexed():source.clone();g.deleteAttribute('uv');
   dummy.position.set(...p.p);dummy.scale.set(...p.s);dummy.rotation.set(0,p.angle??0,0);dummy.updateMatrix();g.applyMatrix4(new T.Matrix4().multiplyMatrices(root,dummy.matrix));
   color.set(p.color);const colors=new Float32Array(g.getAttribute('position').count*3);for(let i=0;i<colors.length;i+=3){colors[i]=color.r;colors[i+1]=color.g;colors[i+2]=color.b}g.setAttribute('color',new T.BufferAttribute(colors,3));
   batch.parts.push(g);batch.triangles+=g.getAttribute('position').count/3;const last=batch.ranges.at(-1);if(last?.id===b.id)last.end=batch.triangles;else batch.ranges.push({id:b.id,end:batch.triangles});
  }
 }
 return [...batches].map(([kind,b])=>{const geometry=mergeGeometries(b.parts);b.parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();const material=new T.MeshStandardMaterial({vertexColors:true,roughness:kind==='glass'?.27:kind==='roof'?.68:.9,metalness:kind==='glass'?.2:0});if(kind==='light'){material.emissive.set('#ffe0a0');material.emissiveIntensity=0;}material.userData.nightWindow=kind==='light';return {geometry,material,ranges:b.ranges}});
}
export default function NationBuildings({buildings,geo,selected,onSelect,draft,invalid=false}:{buildings:NationBuilding[];geo:Geo;selected:string|null;onSelect:(id:string)=>void;draft?:NationBuilding|null;invalid?:boolean}){
 const quality=useQuality(),near=useRef<T.Group>(null),far=useRef<T.Group>(null),detail=quality!=='low';
 const detailed=useMemo(()=>compile(buildings,geo,detail),[buildings,geo,detail]),coarse=useMemo(()=>compile(buildings,geo,false),[buildings,geo]);
 const ghost=useMemo(()=>draft?compile([draft],geo,false):[],[draft,geo]);
 useEffect(()=>{for(const b of ghost){b.material.transparent=true;b.material.opacity=.45;b.material.depthWrite=false;b.material.emissive.set(invalid?'#b25443':'#d3bc79');b.material.emissiveIntensity=.3}return()=>ghost.forEach(b=>{b.geometry.dispose();b.material.dispose()})},[ghost,invalid]);
 useEffect(()=>{(window as any).__nationLots={buildings,selected,draft,invalid};return()=>{delete(window as any).__nationLots}},[buildings,selected,draft,invalid]);
 useEffect(()=>()=>{for(const b of [...detailed,...coarse]){b.geometry.dispose();b.material.dispose()}},[detailed,coarse]);
 useFrame(({camera,controls})=>{const night=localWorldClock.sample().night;for(const b of [...detailed,...coarse])if(b.material.userData.nightWindow){b.material.emissiveIntensity=night*1.8;b.material.transparent=true;b.material.opacity=night;}const close=camera.position.distanceTo((controls as any)?.target??new T.Vector3())<170;if(near.current)near.current.visible=close;if(far.current)far.current.visible=!close});
 const pick=(e:ThreeEvent<MouseEvent>,batch:Batch)=>{e.stopPropagation();const id=batch.ranges.find(r=>(e.faceIndex??0)<r.end)?.id;if(id)onSelect(id)};
 const chosen=buildings.find(b=>b.id===selected),preview=draft??chosen,lot=preview?dimensions(preview):null;
 return <group name="nation-architecture">{ghost.map((b,i)=><mesh key={'draft'+i} geometry={b.geometry} material={b.material}/>)}<group ref={near}>{detailed.map((b,i)=><mesh key={i} geometry={b.geometry} material={b.material} castShadow receiveShadow onClick={e=>pick(e,b)}/>)}</group><group ref={far} visible={false}>{coarse.map((b,i)=><mesh key={i} geometry={b.geometry} material={b.material} castShadow receiveShadow onClick={e=>pick(e,b)}/>)}</group>{preview&&lot&&<mesh position={[preview.x,sample(geo,preview.x,preview.z).h+.15,preview.z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[lot.w,lot.d]}/><meshBasicMaterial color={invalid?'#b25443':'#d3bc79'} transparent opacity={.45} depthWrite={false}/></mesh>}</group>;
}
