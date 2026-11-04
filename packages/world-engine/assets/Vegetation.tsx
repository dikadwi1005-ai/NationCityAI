'use client';
import {BufferGeometry,Float32BufferAttribute,SphereGeometry,CylinderGeometry,MeshStandardMaterial,DoubleSide,Color} from 'three';
import {useQuality} from '../quality-context';import type{Quality}from'../visual-config';
import {surface} from '../materials';import {Part} from './primitives';

const leaves=new Map<string,BufferGeometry>(),materials=new Map<string,MeshStandardMaterial>();
export function leafGeometry(quality:Quality,palm=false){
 const key=quality+':'+palm;if(leaves.has(key))return leaves.get(key)!;
 if(quality==='low'&&!palm){const g=new SphereGeometry(1,8,6);leaves.set(key,g);return g}
 const positions:number[]=[],colors:number[]=[],color=new Color();
 const count=palm?8:quality==='high'?130:72;
 for(let i=0;i<count;i++){
  const a=i*2.39996,vertical=1-2*(i+.5)/count,r=Math.sqrt(1-vertical*vertical),radius=(.6+.3*(.5+.5*Math.sin(i*17)))*(i%3===0?.62:1);
  const cx=palm?0:Math.cos(a)*r*radius,cy=palm?0:vertical*radius*.8,cz=palm?0:Math.sin(a)*r*radius;
  const length=palm?.95:.24+.065*Math.sin(i*3.1),width=palm?.17:.14;
  const points=[[-length,0,0],[-length*.45,0,width],[length*.5,.025,width*.72],[length,.045,0],[length*.5,.025,-width*.72],[-length*.45,0,-width],[0,.05,0]];
  for(let j=0;j<6;j++)for(const k of [6,j,(j+1)%6]){
   let [x,y,z]=points[k];if(palm){x=(x+length)/2;y=-Math.pow(x,2)*.45;}
   if(!palm){const tilt=Math.sin(i*2.7)*.85,roll=Math.cos(i*1.3)*.65,yy=y*Math.cos(tilt)-z*Math.sin(tilt),zz=y*Math.sin(tilt)+z*Math.cos(tilt),xx=x*Math.cos(roll)-yy*Math.sin(roll);y=x*Math.sin(roll)+yy*Math.cos(roll);x=xx;z=zz;}
   positions.push(cx+x*Math.cos(a)-z*Math.sin(a),cy+y,cz+x*Math.sin(a)+z*Math.cos(a));
   color.set(palm?'#8ba67a':i%3===0?'#819872':i%3===1?'#a7b490':'#6f8f62');colors.push(color.r,color.g,color.b);
  }
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('color',new Float32BufferAttribute(colors,3));g.computeVertexNormals();leaves.set(key,g);return g;
}
export function leafMaterial(quality:Quality,palm=false){const key=quality+':'+palm;if(!materials.has(key))materials.set(key,new MeshStandardMaterial({color:quality==='low'?'#5c7849':'#71915a',vertexColors:quality!=='low'||palm,roughness:.95,side:DoubleSide,envMapIntensity:.1}));return materials.get(key)!}
const trunk=new CylinderGeometry(.075,.115,1,9);
export function Plant({variant=0}:{variant?:number}){
 const quality=useQuality(),palm=variant%3===1,small=variant%3===2,height=small?1.35:palm?2.05:1.7;
 return <>
 <mesh geometry={trunk} position={[0,height/2,0]} scale={[1,height,1]} material={surface('#716550','timber',quality)} castShadow dispose={null}/>
 {!palm&&[-1,1].map(side=><Part key={side} p={[side*.16,height*.77,0]} s={[.055,.53,.055]} r={[0,0,-side*.52]} c="#716550" kind="timber" shape="cylinder" detail={1}/>)}
 <mesh geometry={leafGeometry(quality,palm)} material={leafMaterial(quality,palm)} position={[0,height,0]} scale={palm?[.92,.9,.92]:small?[.7,.65,.7]:[.85,.8,.85]} castShadow dispose={null}/>
 </>;
}
export function GardenPark(){return <>
 <Part p={[0,.025,0]} s={[3.9,.05,3.9]} c="#6e8051" kind="grass"/>
 <Part p={[0,.06,0]} s={[.65,.04,3.8]} c="#aaa58d" kind="stone"/><Part p={[0,.06,0]} s={[3.8,.04,.55]} c="#aaa58d" kind="stone"/>
 <group position={[-1,0,-.85]} scale={.72}><Plant variant={0}/></group>
 <Part p={[1,.16,.9]} s={[1.15,.055,.34]} c="#806c51" kind="timber"/>
 <Part p={[1,.31,1.06]} s={[1.15,.3,.035]} c="#806c51" kind="timber"/>
 {[.6,1.4].map(x=><Part key={x} p={[x,.09,.9]} s={[.045,.18,.22]} c="#5a6658" kind="metal"/>)}
 <Part p={[-1.1,.1,1.15]} s={[.7,.2,.5]} c="#8e8f79" kind="stone"/>
 <Part p={[-1.1,.27,1.15]} s={[.65,.3,.45]} c="#526d40" kind="grass" shape="sphere"/>
 </>;
}
