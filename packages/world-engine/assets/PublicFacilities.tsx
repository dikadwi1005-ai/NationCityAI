'use client';
import type {FixtureAsset} from '../asset-registry';
import {Part,Window,Door,Rail} from './primitives';
/** Visual-fixture assets only; deliberately absent from the six-asset domain catalog. */
export default function PublicFacility({kind}:{kind:FixtureAsset}){
 if(kind==='parking')return <>
  <Part p={[0,.025,0]} s={[4,.05,3]} c="#666e6b" kind="asphalt"/>
  {[-1.5,-.5,.5,1.5].map(x=><Part key={x} p={[x,.055,0]} s={[.03,.012,2.4]} c="#c4c3a8"/>) }
  <Part p={[0,.055,1.25]} s={[3.7,.012,.03]} c="#c4c3a8"/>
 </>;
 if(kind==='recreation')return <>
  <Part p={[0,.1,0]} s={[3,.18,2.5]} c="#858b7c" kind="stone"/>
  {[-1.3,1.3].flatMap(x=>[-1,1].map(z=><Part key={x+':'+z} p={[x,.7,z]} s={[.075,1.2,.075]} c="#766955" kind="timber"/>))}
  <Part p={[0,1.37,0]} s={[3.3,.14,2.8]} c="#727c6d" kind="metal"/>
  <Part p={[0,.4,.8]} s={[2.2,.12,.33]} c="#7e6952" kind="timber"/><Rail p={[0,.68,1.12]} w={2.6}/>
 </>;
 const cafe=kind==='cafe',height=kind==='shophouse'?2.6:kind==='service'?2:1.12,w=kind==='service'?3.7:3.25;
 return <>
 <Part p={[0,.06,0]} s={[w+.2,.12,2.3]} c="#94998a" kind="stone"/>
 <Part p={[0,.12+height/2,-.2]} s={[w,height,1.9]} c={cafe?'#b6aa94':kind==='service'?'#b8c1b8':'#bdbdaf'}/>
 <Part p={[0,height+.18,-.2]} s={[w+.22,.12,2.12]} c="#727d74" kind="concrete"/>
 <Part p={[-.5,.63,.77]} s={[1.55,.78,.035]} c="#405b61" kind="glass"/>
 <Part p={[-.5,.63,.81]} s={[.03,.78,.02]} c="#626e66" kind="metal"/>
 <Door x={.85} y={.54} z={.78} w={.41}/>
 <Part p={[0,1.11,.87]} s={[w,.14,.08]} c={cafe?'#82714e':'#536e67'} kind="metal"/>
 <Part p={[0,1.16,1.0]} s={[w+.12,.06,.54]} c={cafe?'#96886c':'#697d70'} kind="timber"/>
 {kind==='shophouse'&&[1.65,2.37].map(y=><group key={y}><Window p={[-.88,y,.76]} w={.6} h={.43}/><Window p={[0,y,.76]} w={.6} h={.43}/><Window p={[.88,y,.76]} w={.6} h={.43}/></group>)}
 {kind==='service'&&[-1.2,-.4,.4,1.2].map(x=><Window key={x} p={[x,1.67,.76]} w={.49} h={.42}/>)}
 {cafe&&[-1,0].map(x=><group key={x}><Part p={[x,.26,1.62]} s={[.55,.055,.55]} c="#8c765b" kind="timber"/><Part p={[x,.12,1.62]} s={[.05,.25,.05]} c="#5d655b" kind="metal"/>{[-.4,.4].map(s=><Part key={s} p={[x+s,.16,1.62]} s={[.23,.09,.25]} c="#7c7864" kind="timber"/>)}</group>)}
 </>;
}
