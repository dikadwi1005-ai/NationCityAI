'use client';
import {useEffect,useMemo} from 'react';
import {BoxGeometry,CylinderGeometry,SphereGeometry,InstancedMesh,MeshStandardMaterial,Object3D} from 'three';
import {sample,emptyGeo} from '../../../packages/nation-core/geography';
import {footprint,type World,type WorldObject} from '../../../packages/nation-core/world';
import {useQuality} from '../../../packages/world-engine/quality-context';
import {leafGeometry,leafMaterial} from '../../../packages/world-engine/assets/Vegetation';
import {surface} from '../../../packages/world-engine/materials';
import {demoPresentation} from '../../../packages/world-engine/demo-presentation';
import {roadConnections} from './StaticWorld';

type V=[number,number,number];
type Part={x:number;y:number;z:number;size:V;angle:number;color:string;shape:'box'|'pole'|'bush'|'shade'};
const shapes={box:new BoxGeometry(1,1,1),pole:new CylinderGeometry(.5,.5,1,7),bush:new SphereGeometry(.5,12,8)};
const materials=new Map<string,MeshStandardMaterial>();
function material(color:string){if(!materials.has(color))materials.set(color,new MeshStandardMaterial({color,roughness:.9}));return materials.get(color)!}

/** Derived streetscape, not stored objects. Rebuilds around actual object footprints;
 * new placement always wins and suppresses conflicting decorative parts. */
export default function UrbanEnvironment({world}:{world:World}){
  const quality=useQuality();const batches=useMemo(()=>{
    const parts:Part[]=[],geo=world.geo??emptyGeo;
    function add(o:WorldObject,x:number,y:number,z:number,size:V,color:string,shape:Part['shape']='box'){
      const a=o.rotation*Math.PI/2,px=o.x+x*Math.cos(a)+z*Math.sin(a),pz=o.z-x*Math.sin(a)+z*Math.cos(a),h=sample(geo,px,pz).h;
      if(h<.5||Math.abs(h-sample(geo,o.x,o.z).h)>.45)return;
      const radius=Math.min(.22,Math.max(size[0],size[2])*.25);
      if(world.objects.some(v=>{if(v.id===o.id||v.asset==='road'||v.asset==='park')return false;const f=footprint(v);return Math.abs(px-v.x)<f.w/2+radius&&Math.abs(pz-v.z)<f.d/2+radius}))return;
      if(demoPresentation(world)?.buildings.some(b=>Math.abs(px-b.x)<b.w/2+radius&&Math.abs(pz-b.z)<b.d/2+radius))return;
      if(quality==='low'&&Math.max(...size)<.16)return;
      parts.push({x:px,y:h+y,z:pz,size,angle:a,color,shape});
    }
    for(const o of world.objects){
      if(o.asset==='road'){
        const c=roadConnections(o,world.objects),sides=[!c.n,!c.e,!c.s,!c.w];
        sides.forEach((edge,i)=>{if(!edge)return;const a=i*Math.PI/2,x=Math.sin(a)*1.26,z=-Math.cos(a)*1.26;
          add(o,x,.065,z,i%2?[.48,.09,2]:[2,.09,.48],'#b8b9a7');
          if((Math.abs(o.x)+Math.abs(o.z))%8===0&&i===(sides[0]?0:sides[2]?2:1)){
            add(o,x,1.18,z,[.065,2.35,.065],'#3b504d','pole');
            add(o,x,.12,z,[.2,.24,.2],'#718075');
            add(o,x,2.32,z,[.32,.075,.32],'#d5c99c');
            add(o,x,2.24,z,[.25,.08,.25],'#f0deb0');
          }
          if((Math.abs(o.x)+Math.abs(o.z))%12===4&&(Math.abs(o.x)+Math.abs(o.z))%8!==0&&i===(sides[0]?0:sides[2]?2:1)){
            const tx=Math.sin(a)*1.9,tz=-Math.cos(a)*1.9;
            add(o,tx,.65,tz,[.1,1.3,.1],'#77664c','pole');
            add(o,tx,1.6,tz,[.68,.65,.68],'#668759','shade');
          }
        });
      }
      if(o.asset==='house'){
        add(o,0,.025,1.3,[1.9,.04,.55],'#91a16d');
        add(o,.34,.055,1.22,[.43,.08,.85],'#c1bba3');
        add(o,-.68,.22,1.32,[.5,.32,.4],'#637f53','bush');
        add(o,.88,.26,1.35,[.14,.5,.14],'#b2aa8b');
        add(o,.88,.51,1.35,[.24,.16,.19],'#536f68');
      }
      if(o.asset==='hall'||o.asset==='clinic'){
        const depth=footprint(o).d/2;
        add(o,0,.025,depth+.7,[o.asset==='hall'?4.8:4.2,.05,1.2],'#b4b3a2');
        for(const x of [-1.9,1.9]){
          add(o,x,.24,depth+.58,[.45,.42,.45],'#a7997b');
          add(o,x,.53,depth+.58,[.55,.42,.55],'#5e8054','bush');
        }
      }
      if(o.asset==='clinic'){
        // Two small marked bays and a parked service car, all 3D geometry.
        for(const x of [-1.25,-.3]){
          add(o,x,.02,-1.9,[.8,.035,1.5],'#a4a795');
          for(const edge of [-.38,.38])add(o,x+edge,.043,-1.9,[.035,.012,1.4],'#e0d8b9');
        }
        add(o,-1.25,.23,-1.9,[.52,.28,1.02],'#e2ddc8');
        add(o,-1.25,.45,-1.98,[.45,.23,.57],'#617a79');
        for(const x of [-1.54,-.96])for(const z of [-2.23,-1.57])add(o,x,.13,z,[.1,.2,.2],'#34413e');
      }
    }
    const groups=new Map<string,Part[]>();
    for(const p of parts){const k=p.shape+':'+p.color;if(!groups.has(k))groups.set(k,[]);groups.get(k)!.push(p)}
    const dummy=new Object3D();
    return [...groups.values()].map(entries=>{
      const mesh=new InstancedMesh(entries[0].shape==='shade'?leafGeometry(quality):shapes[entries[0].shape],entries[0].shape==='shade'?leafMaterial(quality):surface(entries[0].color,entries[0].shape==='bush'?'grass':'concrete',quality),entries.length);
      entries.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.set(...p.size);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});
      mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;mesh.raycast=()=>{};return mesh;
    });
  },[world,quality]);
  useEffect(()=>()=>batches.forEach(m=>m.dispose()),[batches]);
  return <group name="derived-urban-environment" dispose={null}>{batches.map(m=><primitive key={m.uuid} object={m}/>)}</group>;
}
