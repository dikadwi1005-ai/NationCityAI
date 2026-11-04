'use client';
import {Part,Window,Door,Rail} from './primitives';

const walls=['#bdb7a8','#d0cfc5','#c5c9c4','#aead9f','#cec5b2','#d0cec2','#c3bda9','#babeb4'];
function PitchedRoof({y=1.12,tile='#70554a',w=1.92,d=1.83}:{y?:number;tile?:string;w?:number;d?:number}){return <>
 <Part p={[0,y,-.04]} s={[w,.48,d]} shape="gable" c={tile} kind="tile"/>
 <Part p={[0,y+.49,-.04]} s={[.045,.04,d+.04]} c={tile} kind="metal" detail={1}/>
 {[-1,1].map(side=><Part key={side} p={[side*w/2,y-.025,-.04]} s={[.035,.045,d]} c="#4c5350" kind="metal" detail={1}/>)}
 </>}
function Balcony({y=1.08,w=1.65}:{y?:number;w?:number}){return <>
 <Part p={[0,y,.8]} s={[w,.09,.34]} c="#a8a99e" kind="concrete"/>
 <Rail p={[0,y+.23,.94]} w={w-.08}/>
 </>}
/** Eight genuinely different envelopes, all inside the same 2×2 legacy lot. */
export default function Residential({variant}:{variant:number}){
 const v=variant%8,tall=[2,3,5].includes(v),floors=v===3?3:tall?2:1,body=v===4?1.04:1.72,x=v===4?-.3:0;
 const h=floors*.9,wall=walls[v];
 return <>
 <Part p={[0,.045,0]} s={[1.98,.09,1.96]} c="#8e9287" kind="concrete"/>
 <Part p={[x,.1+h/2,-.09]} s={[body,h,1.5]} c={wall}/>
 <Part p={[x,.12,-.09]} s={[body+.035,.14,1.53]} c="#8f9186" kind="stone"/>
 {v===0||v===6||v===7?<PitchedRoof y={h+.1} tile={v===6?'#6f766d':v===7?'#676c69':'#79604e'}/>:<>
 <Part p={[x,h+.13,-.08]} s={[body+.13,.12,1.68]} c="#7d827b" kind="concrete"/>
 <Part p={[x,h+.23,-.84]} s={[body+.13,.17,.05]} c={wall}/>
 </>}
 <Door x={v===4?-.3:.36} y={.52}/>
 <Window p={[v===4?-.3:-.4,.65,.681]} w={v===4?.45:.48} h={.39}/>
 {Array.from({length:floors-1},(_,i)=><group key={i}>
  <Part p={[0,1.03+i*.9,-.08]} s={[1.77,.065,1.57]} c="#9eaa9f" kind="concrete"/>
  <Window p={[-.4,1.52+i*.9,.681]} w={.46} h={.46}/><Window p={[.4,(i===0&&(v===2||v===5))?1.49:(v===3&&i===1)?2.38:1.52+i*.9,.681]} w={.46} h={(i===0&&(v===2||v===5))||(v===3&&i===1)?.78:.46}/>
 </group>)}
 {[-1,1].map(side=><group key={side}><Window p={[v===4?(side===1?.23:-.83):side*.87,.67,-.14]} r={side*Math.PI/2} w={.43} h={.38}/>{tall&&<Window p={[side*.87,1.54,-.14]} r={side*Math.PI/2} w={.43} h={.42}/>}</group>)}
 <Part p={[.33,.12,.86]} s={[.65,.11,.23]} c="#b8b09b" kind="stone"/>
 {v===0&&<>
  <Part p={[0,.95,.77]} s={[1.86,.06,.35]} c="#6b5b4b" kind="timber"/>
  {[-.83,.83].map(x=><Part key={x} p={[x,.51,.89]} s={[.045,.9,.045]} c="#706556" kind="timber"/>)}
 </>}
 {v===1&&<><Part p={[-.66,.58,.73]} s={[.34,.96,.12]} c="#959586" kind="stone"/><Part p={[.32,1.06,.8]} s={[1.3,.055,.32]} c="#797c72" kind="concrete"/></>}
 {v===2&&<><Balcony/><Part p={[.67,1.51,.78]} s={[.28,.83,.12]} c="#7d6854" kind="timber"/></>}
 {v===3&&<><Balcony y={1.98} w={1.56}/><Part p={[.8,1.5,.75]} s={[.075,2.8,.08]} c="#7b7e70" kind="concrete"/></>}
 {v===4&&<><Part p={[.61,1.04,-.02]} s={[.64,.07,1.76]} c="#626b65" kind="metal"/><Part p={[.86,.54,.79]} s={[.045,1,.045]} c="#5e6861" kind="metal"/><Part p={[.65,.09,-.03]} s={[.58,.035,1.6]} c="#b5b2a1" kind="concrete"/></>}
 {v===5&&<><Balcony y={1.04}/><Part p={[0,1.99,.79]} s={[1.9,.065,.36]} c="#686e65" kind="concrete"/>{[-.79,.79].map(x=><Part key={x} p={[x,1.55,.89]} s={[.045,.95,.045]} c="#74634f" kind="timber"/>)}</>}
 {v===6&&<><Part p={[0,.18,.91]} s={[1.8,.25,.09]} c="#878b7b" kind="stone"/>{[-.77,.77].map(x=><Part key={x} p={[x,.33,.82]} s={[.23,.28,.25]} shape="sphere" c="#466840" kind="grass"/>)}</>}
 {v===7&&<><Part p={[-.58,1.29,-.1]} s={[.43,.39,1.5]} c={wall}/><Part p={[-.58,1.5,-.08]} s={[.55,.055,1.72]} c="#586662" kind="metal"/></>}
 <Part p={[-.39,.28,.9]} s={[.46,.2,.14]} c="#8b785e" kind="stone" detail={1}/>
 <Part p={[-.39,.4,.91]} s={[.43,.18,.17]} shape="sphere" c="#496b42" kind="grass" detail={1}/>
 <Part p={[.67,.78,.685]} s={[.06,.09,.04]} c="#d0be88" kind="metal" detail={1}/>
 {[-.94,.94].map(x=><Part key={x} p={[x,.24,-.35]} s={[.035,.35,1.15]} c="#797e70" kind="metal" detail={1}/>)}
 <Part p={[0,.24,-.94]} s={[1.9,.35,.035]} c="#797e70" kind="metal" detail={1}/>
 </>;
}
