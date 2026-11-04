import {IcosahedronGeometry,CylinderGeometry,QuadraticBezierCurve3,Vector3,TubeGeometry} from 'three';
import {surface} from '../materials';
import {Box} from './primitives';
import type {RoadConnections} from '../asset-registry';
type V=[number,number,number];
const crown=new IcosahedronGeometry(1,1),trunk=new CylinderGeometry(1,1,1,8),cornerMark=new TubeGeometry(new QuadraticBezierCurve3(new Vector3(0,.089,-.95),new Vector3(0,.089,0),new Vector3(.95,.089,0)),16,.013,3,false);
const material=(color:string)=>surface(color,'grass');
export function Road({connections}:{connections?:RoadConnections}){
 const c=connections??{n:false,e:true,s:false,w:true},dirs=['n','e','s','w'] as const,count=dirs.filter(d=>c[d]).length;
 const corner=count===2?[[c.n,c.e],[c.e,c.s],[c.s,c.w],[c.w,c.n]].findIndex(v=>v.every(Boolean)):-1;
 return <>
 <Box p={[0,.025,0]} s={[2,.05,2]} c="#babcae"/><Box p={[0,.055,0]} s={[2,.045,2]} c="#46535a"/>
 {dirs.map((d,i)=>!c[d]&&<group key={d} rotation={[0,-i*Math.PI/2,0]}><Box p={[0,.105,-.94]} s={[2,.11,.12]} c="#c4c6b8"/><Box p={[0,.081,-.79]} s={[1.8,.012,.025]} c="#e0dfc6"/></group>)}
 {corner>=0?<mesh geometry={cornerMark} material={material('#e5ce8b')} rotation={[0,-corner*Math.PI/2,0]} dispose={null}/>:dirs.map((d,i)=>c[d]&&<group key={d} rotation={[0,-i*Math.PI/2,0]}><Box p={[0,.084,-.62]} s={[.028,.008,.54]} c="#e7d398"/>{count>=3&&<>{[-.55,-.33,-.11,.11,.33,.55].map(x=><Box key={x} p={[x,.087,-.83]} s={[.12,.009,.25]} c="#e6e3cf"/>)}<Box p={[0,.087,-.58]} s={[1.35,.009,.04]} c="#e6e3cf"/></>}</group>)}
 </>;
}
export function Tree({variant}:{variant:number}){return <><mesh geometry={trunk} material={material('#766047')} position={[0,.7,0]} scale={[.11,1.4,.11]} castShadow dispose={null}/>{[[0,1.65,0,.78],[-.37,1.43,.14,.53],[.33,1.84,-.1,.58],[.06,2.15,.05,.48]].map(([x,y,z,s],i)=><mesh key={i} geometry={crown} material={material(['#326b50','#487d50','#619455','#88a461'][(i+variant)%4])} position={[x,y,z]} scale={[s,s*.87,s]} castShadow dispose={null}/>)}</>}
export function Park(){return <>
 <Box p={[0,.045,0]} s={[3.8,.09,3.8]} c="#718a59"/><Box p={[0,.1,0]} s={[.65,.04,3.8]} c="#d2c6a6"/><Box p={[0,.1,0]} s={[3.8,.04,.55]} c="#d2c6a6"/>
 <group position={[-1,0,-.8]} scale={.78}><Tree variant={1}/></group>
 <Box p={[1,.34,.9]} s={[1.15,.13,.38]} c="#9b7350"/><Box p={[1,.6,1.1]} s={[1.15,.45,.08]} c="#9b7350"/>{[.6,1.4].map(x=><Box key={x} p={[x,.18,.9]} s={[.1,.3,.3]} c="#364e48"/>)}
 <Box p={[-1.1,.22,1.15]} s={[.75,.35,.55]} c="#c9bca0"/><mesh position={[-1.1,.55,1.15]} geometry={crown} material={material('#567d53')} scale={[.55,.36,.4]} dispose={null}/>
 {[-1.5,1.5].map(x=><Box key={x} p={[x,.16,-1.5]} s={[.3,.25,.3]} c="#9a8d74"/>)}
 </>}
