import type {Asset} from '../nation-core/world';
function Box({position=[0,0,0],size,color}:{position?:[number,number,number];size:[number,number,number];color:string}){return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color}/></mesh>}
export function Model({asset}:{asset:Asset}) {
 if(asset==='road')return <><Box position={[0,.03,0]} size={[2,.06,2]} color="#738486"/><Box position={[0,.07,0]} size={[.7,.01,.07]} color="#efdfb1"/></>;
 if(asset==='tree')return <><Box position={[0,.65,0]} size={[.25,1.3,.25]} color="#80644b"/><mesh position={[0,1.65,0]} castShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#419f77"/></mesh><mesh position={[.35,2.1,.1]} castShadow><icosahedronGeometry args={[.65,0]}/><meshStandardMaterial color="#67b887"/></mesh></>;
 if(asset==='park')return <><Box position={[0,.05,0]} size={[3.8,.1,3.8]} color="#91bc76"/><Box position={[0,.12,0]} size={[.6,.04,3.8]} color="#dfcfad"/><group position={[-1,0,-.8]}><Model asset="tree"/></group><Box position={[1,.35,1]} size={[1,.2,.4]} color="#b78054"/></>;
 const hall=asset==='hall',clinic=asset==='clinic';const w=hall||clinic?3.6:1.7,d=hall?3.6:1.7,h=hall?2.3:1.4;
 return <><Box position={[0,.08,0]} size={[w+.2,.16,d+.2]} color="#d4cfb7"/><Box position={[0,h/2+.16,0]} size={[w,h,d]} color={hall?'#f5ecdb':clinic?'#f4f6ed':'#eed7ae'}/>
 {hall?<><Box position={[0,h+.3,0]} size={[w+.35,.3,d+.35]} color="#56868c"/><mesh position={[0,h+.7,0]} castShadow><coneGeometry args={[1.5,.8,4]}/><meshStandardMaterial color="#527c80"/></mesh></>:<mesh position={[0,h+.45,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[w*.8,.8,4]}/><meshStandardMaterial color={clinic?'#618d91':'#cc805e'}/></mesh>}
 <Box position={[0,.65,d/2+.02]} size={[.45,1,.05]} color="#52777e"/>
 {[-1,1].map(s=><Box key={s} position={[s*w*.32,1,d/2+.04]} size={[.35,.4,.06]} color="#8ec8cd"/>)}
 {clinic&&<><Box position={[0,1.8,d/2+.05]} size={[.6,.15,.07]} color="#ce6d63"/><Box position={[0,1.8,d/2+.05]} size={[.15,.6,.07]} color="#ce6d63"/></>}
 {hall&&<><Box position={[1,h+1,0]} size={[.06,1.8,.06]} color="#596e77"/><Box position={[1.35,h+1.6,0]} size={[.65,.35,.05]} color="#e4ac57"/></>}
 </>;
}
