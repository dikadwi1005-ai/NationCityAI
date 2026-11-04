'use client';
import{Part}from'../../../packages/world-engine/assets/primitives';
import{demoPresentation}from'../../../packages/world-engine/demo-presentation';
import{sample,emptyGeo}from'../../../packages/nation-core/geography';
import type{World}from'../../../packages/nation-core/world';
export default function DemoLandscape({world}:{world:World}){
 if(!demoPresentation(world))return null;const h=(x:number,z:number)=>sample(world.geo??emptyGeo,x,z).h;
 return <group name="fixture-district-landscape" raycast={()=>null}>
 <group position={[6,h(6,-12),-12]}>
  <Part p={[0,.015,0]} s={[8,.03,8]} c="#989c8b" kind="stone"/>
  <Part p={[0,.025,4.1]} s={[.9,.04,1.8]} c="#a4a896" kind="concrete"/>
  {[-3.15,3.15].flatMap(x=>[-2.9,0,2.9].map(z=><group key={x+':'+z} position={[x,0,z]}><Part p={[0,.15,0]} s={[.75,.3,.75]} c="#8b9180" kind="stone"/><Part p={[0,.36,0]} s={[.8,.38,.8]} c="#4e6e42" kind="grass" shape="sphere"/></group>))}
  <Part p={[2,1.35,3]} s={[.025,2.65,.025]} c="#909e93" kind="metal"/><Part p={[2.22,2.48,3]} s={[.42,.25,.02]} c="#ad6c50"/>
 </group>
 <group position={[53,h(53,22),22]}>
  <Part p={[0,.045,0]} s={[.85,.09,14]} c="#8a7b61" kind="timber"/>
  {[-6,-3,0,3,6].map(z=><group key={z}><Part p={[.39,.28,z]} s={[.035,.5,.035]} c="#6b786b" kind="metal"/><Part p={[.39,.52,z]} s={[.045,.03,3]} c="#6b786b" kind="metal"/></group>)}
 </group>
 </group>;
}
