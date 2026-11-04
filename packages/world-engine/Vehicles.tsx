'use client';
import{useMemo,useRef,useEffect}from'react';import{useFrame}from'@react-three/fiber';
import{BoxGeometry,CylinderGeometry,MeshStandardMaterial,type Group}from'three';
import{RoundedBoxGeometry}from'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import{Part}from'./assets/primitives';import{surface}from'./materials';import{useQuality}from'./quality-context';import{VEHICLE_DIMENSIONS}from'./vehicle-dimensions';
const bodies=new Map<number,RoundedBoxGeometry>(),cabins=new Map<number,RoundedBoxGeometry>();
const brakeGeometry=new BoxGeometry(.1,.045,.025);
const tire=new CylinderGeometry(.112,.112,.075,16);tire.rotateZ(Math.PI/2);const hub=new CylinderGeometry(.061,.061,.079,12);hub.rotateZ(Math.PI/2);
const colors=['#857c69','#566f72','#b4ad8d','#c0c4b6','#9b8a5b'];
export default function VehicleModel({kind,travel,braking=()=>false}:{kind:number;travel:()=>number;braking?:()=>boolean}){
 const q=useQuality(),i=kind%5,d=VEHICLE_DIMENSIONS[i],bike=i===1,bus=i===2,wheels=useRef<Group>(null);
 if(!bodies.has(i))bodies.set(i,new RoundedBoxGeometry(d.width,bike?.22:.25,d.length,2,.04));
 if(!cabins.has(i))cabins.set(i,new RoundedBoxGeometry(d.width*.86,bus?.5:.27,d.length*(bus?.8:.48),2,.035));
 const brake=useMemo(()=>new MeshStandardMaterial({color:'#8e392d',emissive:'#a33d25',emissiveIntensity:.1,roughness:.55}),[]);useEffect(()=>()=>brake.dispose(),[brake]);
 useFrame(()=>{if(wheels.current)for(const wheel of wheels.current.children)wheel.rotation.x=travel()/.112;brake.emissiveIntensity=braking()?.6:.05});
 return <group dispose={null}>
 <mesh geometry={bodies.get(i)} position={[0,.25,0]} material={surface(colors[i],'metal',q)} castShadow dispose={null}/>
 {!bike&&<mesh geometry={cabins.get(i)} position={[0,bus?.57:.48,bus?-.03:-.1]} material={surface(colors[i],'metal',q)} castShadow dispose={null}/>}
 {!bike&&<>
 <Part p={[0,bus?.62:.49,d.length*(bus?.39:.175)]} s={[d.width*.73,bus?.31:.19,.025]} r={[bus?-.1:-.35,0,0]} c="#3a535d" kind="glass"/>
 <Part p={[0,bus?.62:.49,-d.length*(bus?.42:.31)]} s={[d.width*.73,bus?.31:.18,.025]} r={[.25,0,0]} c="#3a535d" kind="glass"/>
 {[-1,1].map(side=><group key={side}>
  <Part p={[side*d.width*.445,bus?.62:.49,-.08]} s={[.015,bus?.3:.18,d.length*(bus?.65:.42)]} c="#415d67" kind="glass"/>
  <Part p={[side*d.width*.46,.47,-.1]} s={[.017,.22,.018]} c="#6a7773" kind="metal" detail={1}/>
  <Part p={[side*d.width*.512,.31,-.06]} s={[.015,.23,.018]} c="#697773" kind="metal" detail={1}/>
  <Part p={[side*d.width*.52,.37,-.13]} s={[.02,.018,.065]} c="#a0aaa3" kind="metal" detail={1}/>
  <Part p={[side*d.width*.56,.46,.18]} s={[.07,.04,.07]} c={colors[i]} kind="metal" detail={1}/>
 </group>)}
 </>}
 {[-1,1].map(side=><group key={side}>
  <Part p={[side*d.width*.33,.28,d.length*.502]} s={[.105,.055,.025]} c="#d9d4b8" kind="glass"/>
  <mesh position={[side*d.width*.33,.28,-d.length*.502]} material={brake} geometry={brakeGeometry} dispose={null}/>
 </group>)}
 <Part p={[0,.2,d.length*.51]} s={[d.width*.8,.045,.035]} c="#646e67" kind="metal"/>
 <Part p={[0,.29,d.length*.53]} s={[.14,.035,.012]} c="#d5d3c1" detail={1}/>
 {(i===3||i===4)&&<Part p={[0,bus?.87:.67,0]} s={[.24,.045,.1]} c="#b9954e" kind="glass"/>}
 {bike&&<>
 <Part p={[0,.43,-.09]} s={[.18,.055,.36]} c="#514e45"/>
 <Part p={[0,.46,.24]} s={[.26,.025,.025]} c="#65736b" kind="metal"/>
 <Part p={[0,.28,.26]} s={[.04,.36,.04]} r={[-.18,0,0]} c="#76867d" kind="metal"/>
 <Part p={[0,.37,.07]} s={[.15,.13,.22]} shape="sphere" c={colors[i]} kind="metal"/>
 </>}
 {i===4&&<><Part p={[0,.7,-.15]} s={[.07,.54,.07]} c="#aa9759" kind="metal"/><Part p={[0,.92,.15]} s={[.08,.06,.67]} c="#aa9759" kind="metal"/><Part p={[0,.58,.49]} s={[.37,.12,.2]} c="#6b7465" kind="metal"/></>}
 <group ref={wheels}>{(bike?[0]:[-1,1]).flatMap(side=>[-1,1].map(end=><group key={side+':'+end} position={[side*(d.width/2+.012),.112,end*d.length*.33]}>
 <mesh geometry={tire} material={surface('#30372f','soil',q)} castShadow dispose={null}/>
 {q!=='low'&&<mesh geometry={hub} material={surface('#8a9790','metal',q)} dispose={null}/>}
 </group>))}</group>
 </group>;
}
