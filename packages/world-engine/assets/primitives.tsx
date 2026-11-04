'use client';
import {BoxGeometry,CylinderGeometry,SphereGeometry,BufferGeometry,Float32BufferAttribute,type EulerTuple} from 'three';
import {surface,planarUV,type Surface} from '../materials';
import {useQuality} from '../quality-context';
import {QUALITY} from '../visual-config';
export type V=[number,number,number];
const cube=new BoxGeometry(1,1,1),cylinder=new CylinderGeometry(.5,.5,1,16),sphere=new SphereGeometry(.5,12,8);
const gable=new BufferGeometry(),p=[[-.5,0,-.5],[.5,0,-.5],[0,1,-.5],[-.5,0,.5],[.5,0,.5],[0,1,.5]];
gable.setAttribute('position',new Float32BufferAttribute([[0,2,1],[3,4,5],[0,3,5],[0,5,2],[1,2,5],[1,5,4],[0,1,4],[0,4,3]].flatMap(f=>f.flatMap(i=>p[i])),3));gable.computeVertexNormals();planarUV(gable);
export function Part({p=[0,0,0],s,c='#c4c2b8',kind='plaster',r=[0,0,0],shape='box',detail=0}:{p?:V;s:V;c?:string;kind?:Surface;r?:EulerTuple;shape?:'box'|'cylinder'|'sphere'|'gable';detail?:number}){
 const quality=useQuality();if(QUALITY[quality].detail<detail)return null;
 return <mesh position={p} scale={s} rotation={r} geometry={shape==='box'?cube:shape==='cylinder'?cylinder:shape==='sphere'?sphere:gable} material={surface(c,kind,quality)} castShadow receiveShadow dispose={null}/>;
}
export const Box=Part;
export function Window({p,w=.42,h=.43,r=0}:{p:V;w?:number;h?:number;r?:number}){
 return <group position={p} rotation={[0,r,0]}>
  <Part s={[w+.055,h+.055,.045]} c="#4c514b" kind="metal"/>
  <Part p={[0,0,.026]} s={[w,h,.018]} c="#486370" kind="glass"/>
  <Part p={[0,-h/2-.035,.03]} s={[w+.12,.04,.12]} c="#aaa99e" kind="concrete" detail={1}/>
  <Part p={[0,0,.041]} s={[.018,h,.015]} c="#343e3e" kind="metal" detail={2}/>
 </group>;
}
export function Door({x=0,z=.69,y=.43,w=.34}:{x?:number;z?:number;y?:number;w?:number}){return <>
 <Part p={[x,y,z]} s={[w+.075,.84,.06]} c="#50544d" kind="metal"/>
 <Part p={[x,y,z+.035]} s={[w,.78,.03]} c="#78614c" kind="timber"/>
 <Part p={[x+w*.31,y,.067+z]} s={[.012,.06,.015]} c="#b2b4af" kind="metal" detail={1}/>
 </>}
export function Rail({p,w=1.2}:{p:V;w?:number}){return <group position={p}>
 <Part p={[0,.16,0]} s={[w,.025,.025]} c="#4b5552" kind="metal"/>
 <Part p={[0,.02,0]} s={[w,.025,.025]} c="#4b5552" kind="metal"/>
 {[-.5,.5].map(t=><Part key={t} p={[t*w,0,0]} s={[.025,.34,.025]} c="#4b5552" kind="metal"/>)}
 <Part p={[0,0,0]} s={[w-.04,.27,.015]} c="#648385" kind="glass" detail={1}/>
 </group>}
