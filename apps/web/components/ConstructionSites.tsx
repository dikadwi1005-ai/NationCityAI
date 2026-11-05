'use client';
import {useFrame} from '@react-three/fiber';
import {useEffect,useMemo,useRef} from 'react';
import {BoxGeometry,Color,InstancedMesh,MeshBasicMaterial,Object3D,type Group} from 'three';
import {Part} from '../../../packages/world-engine/assets/primitives';
import VehicleModel from '../../../packages/world-engine/Vehicles';
import {Model} from '../../../packages/world-engine/Models';
import {emptyGeo,sample} from '../../../packages/nation-core/geography';
import {footprint,type World} from '../../../packages/nation-core/world';
import type {ConstructionSimulation,RegionPlan} from '../../../packages/ai-builder/planning';
function Crane(){const boom=useRef<Group>(null);useFrame(({clock})=>{if(boom.current)boom.current.rotation.y=Math.sin(clock.elapsedTime*.12)*.45});return <group position={[-.6,0,-.6]}><Part p={[0,.8,0]} s={[.075,1.6,.075]} c="#b99b4f" kind="metal"/><group ref={boom} position={[0,1.6,0]}><Part p={[.4,0,0]} s={[1.2,.06,.06]} c="#c1a354" kind="metal"/><Part p={[.95,-.35,0]} s={[.015,.7,.015]} c="#535d55" kind="metal"/></group></group>}
function PlanFootprints({plan}:{plan:RegionPlan}){
 const mesh=useMemo(()=>{const geometry=new BoxGeometry(1,1,1),material=new MeshBasicMaterial({transparent:true,opacity:.42,depthWrite:false}),mesh=new InstancedMesh(geometry,material,plan.jobs.length),dummy=new Object3D(),color=new Color();plan.jobs.forEach((job,i)=>{const target=job.target,p=target.type==='domain'?target.object:target.building,f=target.type==='domain'?footprint(target.object):{w:target.building.w,d:target.building.d};dummy.position.set(p.x,sample(plan.base.geo??emptyGeo,p.x,p.z).h+.05,p.z);dummy.scale.set(f.w*.9,.025,f.d*.9);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);const asset=target.type==='domain'?target.object.asset:'commercial';mesh.setColorAt(i,color.set(asset==='road'?'#a9b5b0':asset==='house'?'#c8b784':asset==='tree'||asset==='park'?'#6c9b66':asset==='commercial'?'#b97f5a':'#739fb1'))});mesh.computeBoundingSphere();mesh.raycast=()=>{};return mesh},[plan]);
 useEffect(()=>()=>{mesh.dispose();mesh.geometry.dispose();(mesh.material as MeshBasicMaterial).dispose()},[mesh]);return <primitive object={mesh} dispose={null}/>;
}
export default function ConstructionSites({world,plan,sites,blueprint}:{world:World;plan:RegionPlan;sites:ConstructionSimulation['sites'];blueprint:boolean}){
 return <group name="local-construction-sites" raycast={()=>null}>
 {blueprint&&<PlanFootprints plan={plan}/>}
 {sites.map(site=>{const p=site.position,target=site.target,road=target.type==='domain'&&target.object.asset==='road',landscape=target.type==='domain'&&['tree','park'].includes(target.object.asset),f=target.type==='domain'?footprint(target.object):{w:target.building.w,d:target.building.d},h=sample(world.geo??emptyGeo,p.x,p.z).h;
  return <group key={site.id} position={[p.x,h+.035,p.z]}>
   <Part p={[0,.015,0]} s={[f.w,.03,f.d]} c="#9e9273" kind="soil"/>
   {[-1,1].flatMap(x=>[-1,1].map(z=><Part key={x+':'+z} p={[x*f.w*.45,.12,z*f.d*.45]} s={[.035,.24,.035]} c="#d1b66b" kind="timber"/>))}
   <Part p={[0,.2,f.d*.46]} s={[f.w,.06,.035]} c="#c7ab60" kind="timber"/>
   {site.stage!=='survey'&&<Part p={[0,.05,0]} s={[f.w*.87,.10,f.d*.87]} c={road?'#70786c':'#a5a79a'} kind={road?'stone':'concrete'}/>}
   {site.stage==='frame'&&(road?<Part p={[-.3,.11,0]} s={[.6,.04,f.d]} c="#515d57" kind="asphalt"/>:landscape&&target.type==='domain'?<group scale={site.progress*.8}><Model asset={target.object.asset}/></group>:<>
    {[-1,1].flatMap(x=>[-1,1].map(z=><Part key={x+':'+z} p={[x*f.w*.35,.55,z*f.d*.35]} s={[.08,1,.08]} c="#aaa997" kind="concrete"/>))}
    <Part p={[0,1.05,0]} s={[f.w*.8,.10,f.d*.8]} c="#a5a79a" kind="concrete"/><Part p={[-f.w*.34,.45,0]} s={[.09,.6,f.d*.7]} c="#b79e86" kind="plaster"/>
    <Crane/>
   </>)}
   {!road&&!landscape&&site.stage==='foundation'&&<group scale={.45} position={[f.w*.3,.12,0]}><VehicleModel kind={4} travel={()=>0}/></group>}
  </group>})}
 </group>;
}
