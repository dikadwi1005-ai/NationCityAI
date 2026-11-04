'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {BufferGeometry,Float32BufferAttribute,Vector3,type Group} from 'three';
import {Chibi} from '../../../packages/world-engine/Chibi';
import VehicleModel from '../../../packages/world-engine/Vehicles';
import {buildNetwork,LivingSimulation,populations,trafficCounts,type Walker,type Vehicle} from '../../../packages/world-engine/living-world';
import {defaults} from '../../../packages/citizens/model';
import {emptyGeo,sample} from '../../../packages/nation-core/geography';
import type {World} from '../../../packages/nation-core/world';
import {useActivity} from './world-activity';
const colors=['#62877a','#be704f','#c3a152','#517c93','#985a64','#d3c6a5'];
function Pedestrian({agent,world}:{agent:Walker;world:World}){
 const ref=useRef<Group>(null),motion=useRef('idle'),target=useRef(new Vector3());const paused=useActivity(s=>s.paused);
 const look=useMemo(()=>({...defaults,name:'NPC',showName:false,hair:['poni','ikal','kuncir'][agent.id%3],face:agent.id%2?'oval':'bulat',eyes:agent.id%2?'cerah':'senyum',hairColor:['#493128','#292e2b','#9c7447'][agent.id%3],color:colors[agent.id%6],outfit:agent.id%2?'tunik':'jaket',accessory:['tanpa','syal','baret'][agent.id%3]}),[agent.id]);
 // Chibi reads this stable motion source each frame; no React render per footstep.
 useFrame(({camera},dt)=>{const g=ref.current;if(!g)return;target.current.set(agent.x,sample(world.geo??emptyGeo,agent.x,agent.z).h+.025,agent.z);g.position.lerp(target.current,1-Math.exp(-24*Math.min(dt,.1)));g.rotation.y+=Math.atan2(Math.sin(agent.angle-g.rotation.y),Math.cos(agent.angle-g.rotation.y))*(1-Math.exp(-12*Math.min(dt,.1)));g.visible=Math.hypot(camera.position.x-agent.x,camera.position.z-agent.z)<125;motion.current=agent.state==='WALKING'?'walk':agent.gesture});
 return <group ref={ref} position={[agent.x,sample(world.geo??emptyGeo,agent.x,agent.z).h+.025,agent.z]} scale={.48} raycast={()=>null}><Chibi look={look} motionSource={motion} phase={agent.id*.73} paused={paused}/></group>
}
function Traffic({agent,world}:{agent:Vehicle;world:World}){const ref=useRef<Group>(null),target=useRef(new Vector3());useFrame((_,dt)=>{const g=ref.current;if(!g)return;const blend=1-Math.exp(-18*Math.min(dt,.1));target.current.set(agent.x,sample(world.geo??emptyGeo,agent.x,agent.z).h+.07,agent.z);g.position.lerp(target.current,blend);g.rotation.y+=Math.atan2(Math.sin(agent.angle-g.rotation.y),Math.cos(agent.angle-g.rotation.y))*blend});return <group ref={ref} position={[agent.x,sample(world.geo??emptyGeo,agent.x,agent.z).h+.07,agent.z]} raycast={()=>null}><VehicleModel kind={agent.id%5} travel={()=>agent.distance}/></group>}
function Paths({simulation}:{simulation:LivingSimulation}){const last=useRef(-1);const g=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(new Float32Array(18000),3));g.setDrawRange(0,0);return g},[]);useFrame(()=>{if(simulation.time-last.current<.5)return;last.current=simulation.time;const attr=g.getAttribute('position');let i=0;for(const a of simulation.walkers){let previous={x:a.x,z:a.z};for(const id of a.path){const to=simulation.network.walk.get(id)!;if(i+2>attr.count)break;attr.setXYZ(i++,previous.x,sample(simulation.network.world.geo??emptyGeo,previous.x,previous.z).h+.08,previous.z);attr.setXYZ(i++,to.x,to.y+.08,to.z);previous=to}}attr.needsUpdate=true;g.setDrawRange(0,i);g.computeBoundingSphere()});useEffect(()=>()=>g.dispose(),[g]);return <lineSegments geometry={g} raycast={()=>null}><lineBasicMaterial color="#ffe19b"/></lineSegments>}
export default function LivingWorld({world,island='island-001'}:{world:World;island?:string}){
 const settings=useActivity(),size=useThree(s=>s.size),mobile=size.width<650,npc=Math.min(populations[settings.npc],mobile?5:18),traffic=Math.min(trafficCounts[settings.traffic],mobile?2:7);
 const topology=[world.revision,world.terrainVersion,...world.objects.map(o=>o.id+':'+o.x+':'+o.z+':'+o.rotation)].join('/');
 const network=useMemo(()=>buildNetwork(world,island),[topology,island]);
 const simulation=useMemo(()=>new LivingSimulation(network,npc,traffic),[network,npc,traffic]);
 const accumulator=useRef(0),reportTick=useRef(0),root=useRef<Group>(null);
 useEffect(()=>{accumulator.current=0;root.current?.traverse(o=>{o.raycast=()=>{}});return()=>{delete (window as any).__nationSimulation}},[simulation]);
 useFrame(({clock})=>{const now=clock.elapsedTime,dt=Math.min(.1,now-reportTick.current);reportTick.current=now;if(!settings.paused&&!document.hidden){accumulator.current+=dt*settings.speed;while(accumulator.current>=1/30){simulation.step(1/30);accumulator.current-=1/30}}
  if(root.current)root.current.visible=true;
  (window as any).__nationSimulation={island,time:simulation.time,paused:settings.paused,speed:settings.speed,npc:simulation.walkers.map(a=>({id:a.id,x:a.x,z:a.z,state:a.state,visits:a.visits,angle:a.angle})),vehicles:simulation.vehicles.map(a=>({id:a.id,x:a.x,z:a.z,angle:a.angle,distance:a.distance,stopped:a.stopped,parked:a.parked})),turns:simulation.turns,stops:simulation.stops,nodes:network.walk.size,roads:network.roads.size,localOnly:true};
 });
 return <group ref={root} raycast={()=>null}>{simulation.walkers.map(a=><Pedestrian key={a.id} agent={a} world={world}/>)}{simulation.vehicles.map(a=><Traffic key={a.id} agent={a} world={world}/>)}{settings.paths&&<Paths simulation={simulation}/>}</group>
}
