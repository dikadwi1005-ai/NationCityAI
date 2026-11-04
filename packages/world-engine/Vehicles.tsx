'use client';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {BoxGeometry,CylinderGeometry,MeshStandardMaterial,type Group} from 'three';
const box=new BoxGeometry(1,1,1),wheel=new CylinderGeometry(.12,.12,.08,10);wheel.rotateZ(Math.PI/2);
const palette=['#c46b43','#4e8b89','#d8ae50','#e7e1c7','#6b7e56'];
const materials=new Map<string,MeshStandardMaterial>();
function material(c:string){if(!materials.has(c))materials.set(c,new MeshStandardMaterial({color:c,roughness:.8,flatShading:true}));return materials.get(c)!}
function Part({p,s,c}:{p:[number,number,number];s:[number,number,number];c:string}){return <mesh geometry={box} material={material(c)} position={p} scale={s} castShadow dispose={null}/>}
export default function VehicleModel({kind,travel}:{kind:number;travel:()=>number}){
 const wheels=useRef<Group>(null),bus=kind===2,bike=kind===1,construction=kind===4,width=bike?.22:.48,length=bus?1.25:bike?.65:.95,color=palette[kind%palette.length];
 useFrame(()=>{if(wheels.current)for(const w of wheels.current.children)w.rotation.x=travel()/.12});
 return <group dispose={null}>
 <Part p={[0,.24,0]} s={[width,.22,length]} c={color}/><Part p={[0,.43,bus?-.05:-.08]} s={[width*.85,bus?.35:.25,length*.55]} c={color}/>
 {!bike&&<><Part p={[0,.46,length*.21]} s={[width*.75,.15,.03]} c="#344c50"/><Part p={[0,.46,-length*.35]} s={[width*.75,.15,.03]} c="#344c50"/>{[-1,1].map(side=><Part key={side} p={[side*width*.44,.46,-.04]} s={[.025,.15,length*.45]} c="#344c50"/>)}</>}
 {[-1,1].map(side=><group key={side}><Part p={[side*width*.28,.25,length*.51]} s={[.09,.06,.025]} c="#fff0bb"/><Part p={[side*width*.28,.25,-length*.51]} s={[.08,.045,.025]} c="#aa453c"/></group>)}
 {kind===3&&<Part p={[0,.61,0]} s={[.29,.07,.12]} c="#e2a550"/>}
 {construction&&<><Part p={[0,.62,-.1]} s={[.11,.4,.11]} c="#d8ae50"/><Part p={[0,.81,.15]} s={[.12,.09,.6]} c="#d8ae50"/><Part p={[0,.55,.43]} s={[.38,.12,.16]} c="#6c6c54"/></>}
 <group ref={wheels}>{(bike?[0]:[-1,1]).flatMap(side=>[-1,1].map(end=><mesh key={side+':'+end} geometry={wheel} material={material('#283633')} position={[side*(width/2+.015),.13,end*length*.33]} dispose={null}/>))}</group>
 </group>
}
