'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as T from 'three';
import {chunks,sample,type Geo} from '../../../packages/nation-core/geography';
import {useQuality} from '../../../packages/world-engine/quality-context';
import {QUALITY} from '../../../packages/world-engine/visual-config';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {surface,planarUV} from '../../../packages/world-engine/materials';
import {visualHeight} from '../../../packages/world-engine/visual-terrain';

function Chunk({cx,cz,geo,step,regional=false}:{cx:number;cz:number;geo:Geo;step:number;regional?:boolean}){
  const quality=useQuality();const material=useMemo(()=>{const m=surface('#ffffff','grass',quality).clone();m.vertexColors=true;return m},[quality]);useEffect(()=>()=>material.dispose(),[material]);
  const geometry=useMemo(()=>{
    const g=new T.BufferGeometry(),positions:number[]=[],colors:number[]=[],color=new T.Color();
    const sand=new T.Color('#c6ba91'),grass=new T.Color('#81966a'),rock=new T.Color('#8b9177');
    for(let z=0;z<16;z+=step)for(let x=0;x<16;x+=step){
      const xx=cx*16+x,zz=cz*16+z;
      for(const [vx,vz]of [[xx,zz],[xx,zz+step],[xx+step,zz],[xx+step,zz],[xx,zz+step],[xx+step,zz+step]]){
        const raw=sample(geo,vx,vz),flat=regional&&raw.h===.8&&[[1,0],[-1,0],[0,1],[0,-1]].every(([x,z])=>sample(geo,vx+x,vz+z).h===.8);
        const h=flat?.8:visualHeight(geo,vx,vz),biome=raw.biome;
        const soil=Math.max(0,Math.min(1,(h-.2)/.65));
        color.copy(sand).lerp(grass,soil);
        if(biome==='sand')color.lerp(sand,.85);
        if(biome==='forest')color.lerp(new T.Color('#587b53'),.5);
        if(h>2||biome==='rock')color.lerp(rock,Math.min(.8,(h-1)/7));
        color.multiplyScalar(.96+.035*Math.sin(vx*.28+vz*.19)+.025*Math.cos(vx*.66-vz*.41));
        positions.push(vx,h,vz);colors.push(color.r,color.g,color.b);
      }
    }
    g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));const merged=mergeVertices(g);g.dispose();merged.computeVertexNormals();planarUV(merged);return merged;
  },[cx,cz,geo,step,regional]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} material={material} receiveShadow userData={{terrainChunk:true,cx,cz}}/>;
}
export default function TerrainSurface({geo,regional=false}:{geo:Geo;regional?:boolean}){
  const quality=useQuality();const {size,controls}=useThree();const [visible,setVisible]=useState<string[]>([]),[step,setStep]=useState(.5);
  const matrix=useMemo(()=>new T.Matrix4(),[]),frustum=useMemo(()=>new T.Frustum(),[]),sphere=useMemo(()=>new T.Sphere(new T.Vector3(),25),[]);
  const last=useRef(''),tick=useRef(-1);
  useFrame(({camera,clock})=>{
    if(clock.elapsedTime-tick.current<.15)return;tick.current=clock.elapsedTime;
    const distance=camera.position.distanceTo((controls as any)?.target??new T.Vector3());const zoom=(camera as T.PerspectiveCamera).isPerspectiveCamera?size.height/(2*Math.tan((camera as T.PerspectiveCamera).fov*Math.PI/360)*distance):(camera as T.OrthographicCamera).zoom;setStep(regional&&zoom<8?(zoom<3?4:2):zoom<2?2:zoom<5?1:QUALITY[quality].terrainStep);
    frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    const next=[];for(const k of chunks(geo).keys()){const [cx,cz]=k.split(':').map(Number);sphere.center.set(cx*16+8,1,cz*16+8);if(frustum.intersectsSphere(sphere))next.push(k)}
    if(regional){const target=(controls as any)?.target??new T.Vector3();next.sort((a,b)=>{const [ax,az]=a.split(':').map(Number),[bx,bz]=b.split(':').map(Number);return Math.hypot(ax*16+8-target.x,az*16+8-target.z)-Math.hypot(bx*16+8-target.x,bz*16+8-target.z)});next.splice(quality==='low'?40:quality==='high'?96:64)}
    const sig=next.join(',');if(sig!==last.current){last.current=sig;setVisible(next)}
  });
  return <>{visible.map(k=>{const [cx,cz]=k.split(':').map(Number);return <Chunk key={k} cx={cx} cz={cz} geo={geo} step={step} regional={regional}/>})}</>;
}
