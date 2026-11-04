import {BoxGeometry,IcosahedronGeometry,CylinderGeometry,MeshStandardMaterial,BufferGeometry,Float32BufferAttribute,QuadraticBezierCurve3,Vector3,TubeGeometry} from 'three';
import {surface,type Surface} from './materials';
import {useQuality} from './quality-context';
import type {Asset} from '../nation-core/world';

type V=[number,number,number];
const cube=new BoxGeometry(1,1,1),crown=new IcosahedronGeometry(1,1),trunk=new CylinderGeometry(1,1,1,8);
const gable=new BufferGeometry();
const pyramid=new BufferGeometry();
const corners=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,1,0]];
pyramid.setAttribute('position',new Float32BufferAttribute([[0,4,1],[1,4,2],[2,4,3],[3,4,0],[0,1,2],[0,2,3]].flatMap(f=>f.flatMap(i=>corners[i])),3));pyramid.computeVertexNormals();
const a=[[-1,0,-1],[1,0,-1],[0,1,-1],[-1,0,1],[1,0,1],[0,1,1]];
const faces=[[0,2,1],[3,4,5],[0,3,5],[0,5,2],[1,2,5],[1,5,4],[0,1,4],[0,4,3]];
gable.setAttribute('position',new Float32BufferAttribute(faces.flatMap(f=>f.flatMap(i=>a[i])),3));gable.computeVertexNormals();
const cornerMark=new TubeGeometry(new QuadraticBezierCurve3(new Vector3(0,.089,-.95),new Vector3(0,.089,0),new Vector3(.95,.089,0)),16,.013,3,false);
const materials=new Map<string,MeshStandardMaterial>();
function material(color:string){let m=materials.get(color);if(!m){m=new MeshStandardMaterial({color,roughness:.83});materials.set(color,m)}return m}
export function Box({p=[0,0,0],s,c,r=[0,0,0],kind='plaster'}:{p?:V;s:V;c:string;r?:V;kind?:Surface}){const quality=useQuality();return <mesh position={p} scale={s} rotation={r} geometry={cube} material={surface(c,kind,quality)} castShadow receiveShadow dispose={null}/>}
function Window({x,y,z,w=.35,h=.48}:{x:number;y:number;z:number;w?:number;h?:number}){
 return <><Box p={[x,y,z]} s={[w+.09,h+.09,.07]} c="#e9dec7"/><Box p={[x,y,z+.043]} s={[w,h,.035]} c="#365b63"/><Box p={[x,y,z+.067]} s={[.035,h,.025]} c="#e6d4b1"/><Box p={[x,y-h*.1,z+.07]} s={[w,.025,.025]} c="#e6d4b1"/><Box p={[x,y-h/2-.05,z]} s={[w+.15,.06,.16]} c="#c0b49e"/></>;
}
export type RoadConnections={n:boolean;e:boolean;s:boolean;w:boolean};
function Road({connections}:{connections?:RoadConnections}){
 const c=connections??{n:false,e:true,s:false,w:true},dirs=['n','e','s','w'] as const,count=dirs.filter(d=>c[d]).length;
 const corner=count===2?[[c.n,c.e],[c.e,c.s],[c.s,c.w],[c.w,c.n]].findIndex(v=>v.every(Boolean)):-1;
 return <>
 <Box p={[0,.025,0]} s={[2,.05,2]} c="#babcae"/><Box p={[0,.055,0]} s={[2,.045,2]} c="#46535a"/>
 {dirs.map((d,i)=>!c[d]&&<group key={d} rotation={[0,-i*Math.PI/2,0]}><Box p={[0,.105,-.94]} s={[2,.11,.12]} c="#c4c6b8"/><Box p={[0,.081,-.79]} s={[1.8,.012,.025]} c="#e0dfc6"/></group>)}
 {corner>=0?<mesh geometry={cornerMark} material={material('#e5ce8b')} rotation={[0,-corner*Math.PI/2,0]} dispose={null}/>:dirs.map((d,i)=>c[d]&&<group key={d} rotation={[0,-i*Math.PI/2,0]}><Box p={[0,.084,-.62]} s={[.028,.008,.54]} c="#e7d398"/>{count>=3&&<>{[-.55,-.33,-.11,.11,.33,.55].map(x=><Box key={x} p={[x,.087,-.83]} s={[.12,.009,.25]} c="#e6e3cf"/>)}<Box p={[0,.087,-.58]} s={[1.35,.009,.04]} c="#e6e3cf"/></>}</group>)}
 </>;
}
function Tree({variant}:{variant:number}){return <><mesh geometry={trunk} material={material('#766047')} position={[0,.7,0]} scale={[.11,1.4,.11]} castShadow dispose={null}/>{[[0,1.65,0,.78],[-.37,1.43,.14,.53],[.33,1.84,-.1,.58],[.06,2.15,.05,.48]].map(([x,y,z,s],i)=><mesh key={i} geometry={crown} material={material(['#326b50','#487d50','#619455','#88a461'][(i+variant)%4])} position={[x,y,z]} scale={[s,s*.87,s]} castShadow dispose={null}/>)}</>}
function Park(){return <>
 <Box p={[0,.045,0]} s={[3.8,.09,3.8]} c="#718a59"/><Box p={[0,.1,0]} s={[.65,.04,3.8]} c="#d2c6a6"/><Box p={[0,.1,0]} s={[3.8,.04,.55]} c="#d2c6a6"/>
 <group position={[-1,0,-.8]} scale={.78}><Tree variant={1}/></group>
 <Box p={[1,.34,.9]} s={[1.15,.13,.38]} c="#9b7350"/><Box p={[1,.6,1.1]} s={[1.15,.45,.08]} c="#9b7350"/>{[.6,1.4].map(x=><Box key={x} p={[x,.18,.9]} s={[.1,.3,.3]} c="#364e48"/>)}
 <Box p={[-1.1,.22,1.15]} s={[.75,.35,.55]} c="#c9bca0"/><mesh position={[-1.1,.55,1.15]} geometry={crown} material={material('#567d53')} scale={[.55,.36,.4]} dispose={null}/>
 {[-1.5,1.5].map(x=><Box key={x} p={[x,.16,-1.5]} s={[.3,.25,.3]} c="#9a8d74"/>)}
 </>}
function Hall(){return <>
 <Box p={[0,.1,0]} s={[3.95,.2,3.95]} c="#aaa999"/>
 <Box p={[0,1.33,-.28]} s={[3.5,2.35,2.7]} c="#e1dac6"/>
 <Box p={[0,2.5,-.2]} s={[3.7,.18,2.96]} c="#c3b796"/>
 <Box p={[0,2.7,-.2]} s={[3.94,.16,3.55]} c="#325a54"/>
 {[-1.46,-.88,.88,1.46].map(x=><group key={x}><Box p={[x,1.52,1.25]} s={[.19,2,.19]} c="#eee7d3"/><Box p={[x,.54,1.25]} s={[.3,.15,.3]} c="#b7ac94"/><Box p={[x,2.5,1.25]} s={[.3,.18,.3]} c="#eee7d3"/></group>)}
 {[0,1,2].map(i=><Box key={i} p={[0,.21+i*.1,1.83-i*.16]} s={[3.5-i*.18,.1,.3]} c="#c7c3af"/>)}
 <Box p={[0,1.11,1.11]} s={[.94,1.65,.08]} c="#355b62"/>
 <Box p={[0,1.11,1.17]} s={[.04,1.65,.035]} c="#bfaa7c"/>
 {[-1.16,1.16].map(x=><Window key={x} x={x} y={1.55} z={1.11} w={.48} h={.85}/>)}
 {[-1,1].map(side=><group key={side} position={[side*1.77,0,-.32]} rotation={[0,side*Math.PI/2,0]}>{[-.72,.2,.95].map(x=><Window key={x} x={x} y={1.55} z={0} w={.48} h={.85}/>)}</group>)}
 <Box p={[0,2.34,1.18]} s={[.8,.24,.1]} c="#b99855"/>
 <mesh position={[0,2.78,-.2]} scale={[3.94,.72,3.55]} geometry={pyramid} material={material('#426e61')} castShadow dispose={null}/>
 <Box p={[0,3.57,-.05]} s={[.68,.43,.68]} c="#e2d8b8"/>
 <mesh position={[0,3.785,-.05]} scale={[.83,.3,.83]} geometry={pyramid} material={material('#31584f')} castShadow dispose={null}/>
 <Box p={[1.55,3.27,.92]} s={[.035,1.45,.035]} c="#c8c6b7"/><Box p={[1.76,3.78,.92]} s={[.42,.25,.035]} c="#bb7554"/>
 </>}
function Clinic(){return <>
 <Box p={[0,.1,0]} s={[3.95,.2,1.95]} c="#b8bbaf"/>
 <Box p={[0,1.05,0]} s={[3.65,1.8,1.72]} c="#e6e5d5"/>
 <Box p={[0,1.98,0]} s={[3.96,.16,1.98]} c="#507b77"/>
 <Box p={[0,1.83,.89]} s={[3.6,.13,.08]} c="#8ca59b"/>
 <Box p={[.7,.94,.9]} s={[.72,1.55,.065]} c="#365c66"/>
 {[-1.35,-.58].map(x=><Window key={x} x={x} y={1.15} z={.9} w={.55} h={.8}/>)}
 <Box p={[.7,1.73,1.04]} s={[1.4,.13,.55]} c="#658d83"/>
 <Box p={[-.27,1.65,.98]} s={[.12,.4,.07]} c="#b56957"/><Box p={[-.27,1.65,.98]} s={[.4,.12,.07]} c="#b56957"/>
 <Box p={[1.48,.3,.93]} s={[.42,.4,.16]} c="#b5ac8d"/>
 <Box p={[-.8,2.15,-.2]} s={[.7,.25,.65]} c="#b5bdb5"/>
 {[0,1].map(i=><Box key={i} p={[.25+i*.65,2.13,-.25]} s={[.55,.055,.7]} r={[-.15,0,0]} c="#405d66"/>)}
 <group position={[1.84,0,0]} rotation={[0,Math.PI/2,0]}><Window x={0} y={1.1} z={0} w={.9} h={.7}/></group>
 </>}
function House({variant}:{variant:number}){
 const v=variant%3,wall=['#d9cdb2','#cad0bc','#dcc1a9'][v],tile=['#9e6147','#4f6f65','#6b7475'][v],height=v===2?2.45:1.66;
 return <>
 <Box p={[0,.08,0]} s={[1.97,.16,1.94]} c="#b7b5a2"/>
 <Box p={[0,.16+height/2,-.09]} s={[1.72,height,1.55]} c={wall}/>
 <mesh position={[0,height+.16,-.07]} scale={[.99,.52,.99]} geometry={gable} material={material(tile)} castShadow dispose={null}/>
 <Box p={[0,height+.68,-.07]} s={[.07,.065,2.04]} c={tile}/>
 {[-1,1].map(s=><Box key={s} p={[s*.49,height+.4,-.07]} s={[1.13,.08,2.06]} r={[0,0,-s*.49]} c={tile}/>)}
 <Box p={[.37,.81,.72]} s={[.42,1.22,.07]} c="#466057"/>
 <Box p={[.47,.83,.77]} s={[.035,.035,.03]} c="#ceb581"/>
 <Window x={-.4} y={1.13} z={.72} w={.43} h={.52}/>
 <Box p={[.3,.22,.83]} s={[1.18,.15,.3]} c="#cdc2a7"/>
 <Box p={[.34,1.49,.88]} s={[1.24,.09,.35]} c={tile}/>
 <Box p={[.86,.87,.93]} s={[.065,1.22,.065]} c="#b6ad94"/>
 {v===2&&<><Window x={-.4} y={2.09} z={.72} w={.43} h={.49}/><Window x={.4} y={2.09} z={.72} w={.43} h={.49}/><Box p={[0,1.73,.86]} s={[1.35,.1,.27]} c="#beb6a0"/></>}
 {[-1,1].map(side=><group key={side} position={[side*.88,0,-.14]} rotation={[0,side*Math.PI/2,0]}><Window x={0} y={1.12} z={0} w={.48} h={.52}/>{v===2&&<Window x={0} y={2.09} z={0} w={.48} h={.49}/>}</group>)}
 <Box p={[-.43,.34,.88]} s={[.55,.26,.2]} c="#aa8565"/>
 <mesh position={[-.43,.52,.87]} scale={[.27,.16,.18]} geometry={crown} material={material('#688652')} dispose={null}/>
 <Box p={[.63,height+.43,-.45]} s={[.22,.52,.24]} c="#b7aa91"/>
 {[.93,-.93].map(x=><Box key={x} p={[x,.28,-.35]} s={[.055,.4,1.15]} c="#aa9e80"/>)}
 <Box p={[0,.28,-.94]} s={[1.9,.4,.055]} c="#aa9e80"/>
 </>;
}
export function Model({asset,variant=0,connections}:{asset:Asset;variant?:number;connections?:RoadConnections}){
 if(asset==='road')return <Road connections={connections}/>;
 if(asset==='tree')return <Tree variant={variant}/>;
 if(asset==='park')return <Park/>;
 if(asset==='hall')return <Hall/>;
 if(asset==='clinic')return <Clinic/>;
 return <House variant={variant}/>;
}
