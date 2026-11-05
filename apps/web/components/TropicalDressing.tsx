'use client';
import{useMemo,useEffect}from'react';
import{BoxGeometry,BufferGeometry,Float32BufferAttribute,CylinderGeometry,SphereGeometry,InstancedMesh,MeshStandardMaterial,Object3D}from'three';
import{chunks,sample,emptyGeo}from'../../../packages/nation-core/geography';
import{footprint,type World}from'../../../packages/nation-core/world';
import{demoPresentation}from'../../../packages/world-engine/demo-presentation';
import{leafGeometry,leafMaterial}from'../../../packages/world-engine/assets/Vegetation';
import{surface}from'../../../packages/world-engine/materials';
import{useQuality}from'../../../packages/world-engine/quality-context';
import{QUALITY}from'../../../packages/world-engine/visual-config';
import{visualHeight}from'../../../packages/world-engine/visual-terrain';
const trunk=new CylinderGeometry(.075,.115,1,8),rock=new SphereGeometry(.5,10,7),grass=new BufferGeometry();
const blades:number[]=[];for(let i=0;i<4;i++){const a=i*1.9,x=Math.cos(a)*.03,z=Math.sin(a)*.03;blades.push(x-.012,0,z,x+.012,0,z,x+.025,.08+(i%2)*.035,z+.015)}grass.setAttribute('position',new Float32BufferAttribute(blades,3));grass.computeVertexNormals();
const grassMaterial=new MeshStandardMaterial({color:'#657d47',roughness:1,envMapIntensity:.08});
export default function TropicalDressing({world}:{world:World}){
 const quality=useQuality(),limit=QUALITY[quality].vegetation;
 const batches=useMemo(()=>{
  const geo=world.geo??emptyGeo,treePoints:{x:number;y:number;z:number;palm:boolean;scale:number}[]=[],stones:{x:number;y:number;z:number}[]=[],tufts:{x:number;y:number;z:number}[]=[];
  const free=(x:number,z:number,padding:number)=>!world.objects.some(o=>{const f=footprint(o);return Math.abs(x-o.x)<f.w/2+padding&&Math.abs(z-o.z)<f.d/2+padding})&&!demoPresentation(world)?.buildings.some(b=>Math.abs(x-b.x)<b.w/2+padding&&Math.abs(z-b.z)<b.d/2+padding)&&!demoPresentation(world)?.reservedSites?.some(b=>Math.abs(x-b.x)<b.w/2+padding&&Math.abs(z-b.z)<b.d/2+padding);
  for(const key of chunks(geo).keys()){
   const[cx,cz]=key.split(':').map(Number);
   for(let a=1;a<16;a+=3.5)for(let b=1;b<16;b+=3.5){
    const x=cx*16+a+Math.sin(cx*7+b)*1.3,z=cz*16+b+Math.cos(cz*8+a)*1.3,g=sample(geo,x,z),noise=.5+.5*Math.sin(x*14.37+z*5.7);
    if(g.h>.5&&free(x,z,1.4)&&noise>.4&&treePoints.length<limit&&(g.h>1.2||g.biome==='forest'||Math.hypot(x,z)>21)){
     const coast=[[2,0],[-2,0],[0,2],[0,-2]].some(([dx,dz])=>sample(geo,x+dx,z+dz).h<.5);
     treePoints.push({x,y:g.h,z,palm:coast,scale:.85+noise*.22});
    }
    if(g.h>.05&&g.h<.4&&noise>.45&&free(x,z,.4)&&stones.length<limit)stones.push({x,y:visualHeight(geo,x,z),z});
    if(quality!=='low'&&g.h>.5&&free(x,z,1)&&tufts.length<(quality==='high'?600:260))for(let j=0;j<3;j++)tufts.push({x:x+j*.18,y:g.h,z:z+.1*j});
   }
  }
  const dummy=new Object3D(),meshes:InstancedMesh[]=[];
  function make(geometry:BufferGeometry,material:MeshStandardMaterial,entries:{x:number;y:number;z:number;scale?:number}[],offset:number,shape:(p:{scale?:number},i:number)=>[number,number,number]){
   const mesh=new InstancedMesh(geometry,material,entries.length);entries.forEach((p,i)=>{dummy.position.set(p.x,p.y+offset*(p.scale??1),p.z);dummy.rotation.set(0,i*1.93,0);dummy.scale.set(...shape(p,i));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=quality!=='low';mesh.receiveShadow=true;mesh.raycast=()=>{};meshes.push(mesh);
  }
  for(const palm of [false,true]){
   const entries=treePoints.filter(p=>p.palm===palm),height=palm?2.05:1.7;
   make(trunk,surface('#716550','timber',quality),entries,height/2,p=>[p.scale!,height*p.scale!,p.scale!]);
   make(leafGeometry(quality,palm),leafMaterial(quality,palm),entries,height,p=>palm?[.92*p.scale!,.9*p.scale!,.92*p.scale!]:[.85*p.scale!,.8*p.scale!,.85*p.scale!]);
  }
  make(rock,surface('#8c8e7d','stone',quality),stones,.08,(_,i)=>[.23+i%3*.08,.16+i%2*.05,.21]);
  make(grass,grassMaterial,tufts,.01,(_,i)=>[.8+i%3*.1,.7+i%4*.12,.8]);return meshes;
 },[world,quality,limit]);
 useEffect(()=>()=>batches.forEach(b=>b.dispose()),[batches]);return <group dispose={null} name="tropical-render-only-vegetation">{batches.map(b=><primitive key={b.uuid} object={b}/>)}</group>;
}
