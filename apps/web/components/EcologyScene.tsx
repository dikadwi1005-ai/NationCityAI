'use client';
import{Suspense,useEffect,useMemo,useRef}from'react';import{useFrame,useThree}from'@react-three/fiber';import{useGLTF}from'@react-three/drei';import*as T from'three';import{clone}from'three/examples/jsm/utils/SkeletonUtils.js';
import{faunaHabitat,FAUNA_HEIGHT,type FaunaAgent}from'../../../packages/nation-sim/fauna-habitat';import{localWorldClock}from'../../../packages/nation-sim/world-clock';import{clearSegment}from'../../../packages/world-engine/living-world';import{sample,emptyGeo}from'../../../packages/nation-core/geography';import type{World}from'../../../packages/nation-core/world';import{useQuality}from'../../../packages/world-engine/quality-context';
function FaunaActor({agent,world}:{agent:FaunaAgent;world:World}){
 const loaded=useGLTF('/models/fauna/'+agent.model+'.glb'),quality=useQuality(),root=useRef<T.Group>(null),position=useRef({x:agent.x,z:agent.z}),study=useRef(false),last=useRef(''),report=useRef(0);
 const rig=useMemo(()=>{
  const object=clone(loaded.scene),mixer=new T.AnimationMixer(object),bones:T.Bone[]=[];
  object.traverse(o=>{if(o instanceof T.Bone)bones.push(o);if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.raycast=()=>{}}});
  const head=object.getObjectByName('Head')??bones.find(b=>b.position.y>2),wings=bones.filter(b=>Math.abs(b.position.x)>1.3&&b.position.y<1.1),clips:T.AnimationClip[]=[];
  for(const original of loaded.animations){const suffix=original.name.split('|').at(-1)!.toLowerCase(),name=suffix==='run'?'walk':suffix==='idle_peck'?'peck':suffix==='eating'?'graze':suffix;if(!['idle','walk','peck','graze','fly'].includes(name)||clips.some(c=>c.name===name))continue;const copy=original.clone();copy.name=name;clips.push(copy)}

  const pose=(name:string,parts:{bone:T.Object3D;axis:T.Vector3;amount:number}[],duration:number)=>{if(clips.some(c=>c.name===name))return;const times=[0,duration*.25,duration*.5,duration*.75,duration],tracks=parts.map(({bone,axis,amount})=>{const values=times.flatMap((_,i)=>bone.quaternion.clone().multiply(new T.Quaternion().setFromAxisAngle(axis,[0,amount,0,-amount*.35,0][i])).toArray());return new T.QuaternionKeyframeTrack(bone.uuid+'.quaternion',times,values)});if(tracks.length)clips.push(new T.AnimationClip(name,duration,tracks))};
  if(head){pose('peck',[{bone:head,axis:new T.Vector3(1,0,0),amount:.55}],1.2);pose('graze',[{bone:head,axis:new T.Vector3(1,0,0),amount:.65}],3.5)}
  pose('fly',wings.map((bone,i)=>({bone,axis:new T.Vector3(0,0,1),amount:i%2?-.65:.65})),.75);
  const actions=Object.fromEntries(clips.map(c=>[c.name,mixer.clipAction(c)]));actions.idle?.play();mixer.update(.001);object.updateMatrixWorld(true);object.traverse(o=>{if(o instanceof T.SkinnedMesh){o.skeleton.update();o.computeBoundingBox()}});const bounds=new T.Box3().setFromObject(object),scale=FAUNA_HEIGHT[agent.model]/(bounds.max.y-bounds.min.y),center=bounds.getCenter(new T.Vector3());return{object,scale,offset:0,origin:[-center.x,-bounds.min.y,-center.z] as [number,number,number],mixer,actions,bones};
 },[loaded,agent.model]);
 useEffect(()=>{study.current=new URLSearchParams(location.search).get('fauna')===agent.model;return()=>{rig.mixer.stopAllAction();rig.mixer.uncacheRoot(rig.object)}},[rig,agent.model]);
 useFrame(({camera,clock},dt)=>{
  const g=root.current;if(!g)return;const t=clock.elapsedTime+agent.phase,night=localWorldClock.sample().night>.5,visible=camera.position.distanceTo(g.position)<(quality==='low'?55:quality==='high'?190:130);g.visible=visible;if(!visible)return;
  const p=position.current,cycle=t%12,walking=!night&&cycle<6,air=agent.flying&&(!night&&t%20<12||Math.hypot(position.current.x-agent.x,position.current.z-agent.z)>.3);let target={x:agent.x,z:agent.z};
  if(air)target=!night&&t%20<12?{x:agent.x+Math.cos(t*.24)*5,z:agent.z+Math.sin(t*.24)*4}:{x:agent.x,z:agent.z};else if(walking)target={x:agent.x+Math.sin(t*.28)*.7,z:agent.z+Math.cos(t*.28)*.65};
  if(study.current)target={x:agent.x,z:agent.z};const distance=Math.hypot(target.x-p.x,target.z-p.z),step=Math.min(distance,Math.min(dt,.05)*(air?1.3:.22)),to={x:p.x+(target.x-p.x)/Math.max(.001,distance)*step,z:p.z+(target.z-p.z)/Math.max(.001,distance)*step},can=air||clearSegment(world,p,to,.13);
  if(can&&distance>.02){const angle=Math.atan2(to.x-p.x,to.z-p.z);g.rotation.y+=Math.atan2(Math.sin(angle-g.rotation.y),Math.cos(angle-g.rotation.y))*(1-Math.exp(-8*Math.min(dt,.1)));p.x=to.x;p.z=to.z}
  const ground=sample(world.geo??emptyGeo,p.x,p.z).h;const altitude=air?(!night&&t%20<12?2.8+Math.sin(t*.7)*.2:Math.min(2.8,Math.hypot(p.x-agent.x,p.z-agent.z)*.65)):0;g.position.set(p.x,T.MathUtils.lerp(g.position.y,Math.max(ground,0)+rig.offset+altitude,1-Math.exp(-4*Math.min(dt,.1))),p.z);
  const clip=air&&rig.actions.fly?'fly':walking&&can&&distance>.02?'walk':night?'idle':agent.model==='Goat'?'graze':agent.model==='Chicken'||agent.model==='Pigeon'||agent.model==='Seagull'?'peck':'idle';
  if(last.current!==clip){rig.actions[last.current]?.fadeOut(.25);rig.actions[clip]?.reset().fadeIn(.25).play();last.current=clip}rig.mixer.update(Math.min(dt,.08));
  if(clock.elapsedTime-report.current>.35){report.current=clock.elapsedTime;const debug=(window as any).__nationFauna??={actors:{},localOnly:true};debug.actors[agent.id]={model:agent.model,clip,x:p.x,z:p.z,y:g.position.y,rigBones:rig.bones.length,mixerTime:rig.mixer.time,bonePose:rig.bones.flatMap(b=>b.quaternion.toArray()),scale:rig.scale,origin:rig.origin,visible:true}}
 });
 return <group ref={root} position={[agent.x,sample(world.geo??emptyGeo,agent.x,agent.z).h,agent.z]} scale={rig.scale} dispose={null}><group position={rig.origin}><primitive object={rig.object}/></group></group>;
}
export default function EcologyScene({world}:{world:World}){
 const quality=useQuality(),mobile=useThree(s=>s.size.width<650),cap=mobile||quality==='low'?3:quality==='high'?10:7,animals=useMemo(()=>faunaHabitat(world,cap),[world,cap]);
 useEffect(()=>{(window as any).__nationFauna={actors:{},cap,population:animals.length,localOnly:true};return()=>{delete(window as any).__nationFauna}},[animals,cap]);
 return <group name="rigged-habitat-fauna"><Suspense fallback={null}>{animals.map(a=><FaunaActor key={a.id} agent={a} world={world}/>)}</Suspense></group>;
}
