'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {BoxGeometry,ConeGeometry,Color,InstancedMesh,MeshStandardMaterial,Object3D,SphereGeometry} from 'three';
import {habitatAnimals,animalPosition} from '../../../packages/world-engine/ecology';
import {useQuality} from '../../../packages/world-engine/quality-context';
import {sample,emptyGeo} from '../../../packages/nation-core/geography';
import type {World} from '../../../packages/nation-core/world';
const sphere=new SphereGeometry(1,8,6),box=new BoxGeometry(1,1,1),cone=new ConeGeometry(1,1,5),dummy=new Object3D(),color=new Color();
export default function EcologyScene({world}:{world:World}){
 const quality=useQuality(),mobile=useThree(s=>s.size.width<650),limit=mobile||quality==='low'?5:quality==='high'?16:12,birds=quality==='high'?4:3;
 const animals=useMemo(()=>habitatAnimals(world,limit-birds),[world,limit,birds]),body=useRef<InstancedMesh>(null),head=useRef<InstancedMesh>(null),legs=useRef<InstancedMesh>(null),ears=useRef<InstancedMesh>(null),tails=useRef<InstancedMesh>(null),wings=useRef<InstancedMesh>(null),flock=useRef<InstancedMesh>(null);
 const material=useMemo(()=>new MeshStandardMaterial({roughness:.94}),[]);useEffect(()=>()=>material.dispose(),[material]);
 const positions=useMemo(()=>animals.map(a=>animalPosition(world,a,0)),[world,animals]),lastHabitat=useRef(-1);
 useEffect(()=>{const meshes=[body,head,legs,ears,tails,wings,flock].map(r=>r.current);return()=>{for(const mesh of meshes)mesh?.dispose()}},[animals.length,birds]);
 useFrame(({clock})=>{const t=clock.elapsedTime;
  if(t-lastHabitat.current>.12){animals.forEach((a,i)=>positions[i]=animalPosition(world,a,t));lastHabitat.current=t;(window as any).__nationEcology={birds,ground:animals.map((a,i)=>({species:a.species,...positions[i]})),cap:limit,localOnly:true}}
  const put=(mesh:InstancedMesh|null,i:number,x:number,y:number,z:number,sx:number,sy:number,sz:number,c:string,angle=0,roll=0)=>{if(!mesh)return;dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,angle,roll);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.set(c));};
  animals.forEach((a,i)=>{const p=positions[i],s=a.size,y=p.y+s*.7,angle=Math.sin(t*.31+a.id)*.5;
   put(body.current,i,p.x,y,p.z,s*.7,s*.55,s*1.2,a.color,angle);
   put(head.current,i,p.x+Math.sin(angle)*s,p.y+s*1.2,p.z+Math.cos(angle)*s,s*.45,s*.5,s*.55,a.color,angle);
   for(let n=0;n<4;n++)put(legs.current,i*4+n,p.x+(n%2?1:-1)*s*.45,p.y+s*.25,p.z+(n<2?1:-1)*s*.7,a.species==='chicken'&&n>=2?0:.022,s*.5,.022,a.species==='chicken'?'#a68d52':'#655e50',angle);
   for(let n=0;n<2;n++)put(ears.current,i*2+n,p.x+(n?1:-1)*s*.3,p.y+s*1.72,p.z+Math.cos(angle)*s,s*.18,s*(a.species==='goat'?.65:.3),s*.18,a.species==='chicken'?'#a84f35':a.species==='goat'?'#746d58':a.color,angle);
   put(tails.current,i,p.x,p.y+s*.95,p.z-s*1.1,.02,s*.65,.02,a.color,angle,.5+Math.sin(t+a.id)*.2);
  });
  for(let i=0;i<birds;i++){const x=Math.cos(t*.13+i*2.1)*17+4,z=Math.sin(t*.13+i*2.1)*13+4,y=Math.max(4,sample(world.geo??emptyGeo,x,z).h+4)+Math.sin(t*.6+i)*.3;
   put(flock.current,i,x,y,z,.045,.04,.10,'#dfdfce',-t*.13-i*2.1);
   for(let side=0;side<2;side++)put(wings.current,i*2+side,x+(side?1:-1)*.12,y+.02,z,.22,.012,.065,'#e1e0d0',0,(side?1:-1)*Math.sin(t*5+i)*.5);
  }
  for(const ref of [body,head,legs,ears,tails,wings,flock]){const mesh=ref.current;if(mesh){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere()}}
 });
 useEffect(()=>()=>{delete (window as any).__nationEcology},[]);
 return <group name="local-fauna" raycast={()=>null}>
 <instancedMesh ref={body} args={[sphere,material,animals.length]} dispose={null}/><instancedMesh ref={head} args={[sphere,material,animals.length]} dispose={null}/><instancedMesh ref={legs} args={[box,material,animals.length*4]} dispose={null}/><instancedMesh ref={ears} args={[cone,material,animals.length*2]} dispose={null}/><instancedMesh ref={tails} args={[box,material,animals.length]} dispose={null}/><instancedMesh ref={flock} args={[sphere,material,birds]} dispose={null}/><instancedMesh ref={wings} args={[box,material,birds*2]} dispose={null}/>
 </group>;
}
