'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as T from 'three';
import {chunks,emptyGeo,type Geo} from '../../../packages/nation-core/geography';
import {visualHeight} from '../../../packages/world-engine/visual-terrain';

export default function Ocean({low,geo=emptyGeo}:{low:boolean;geo?:Geo}){
  const shader=useRef<T.ShaderMaterial>(null);
  const field=useMemo(()=>{
    const keys=[...chunks(geo).keys()].map(k=>k.split(':').map(Number));
    const minX=Math.min(...keys.map(k=>k[0]*16))-8,minZ=Math.min(...keys.map(k=>k[1]*16))-8;
    const width=Math.max(...keys.map(k=>k[0]*16))+24-minX,height=Math.max(...keys.map(k=>k[1]*16))+24-minZ;
    const w=Math.min(256,Math.ceil(width*2)),h=Math.min(256,Math.ceil(height*2)),data=new Uint8Array(w*h*4);
    for(let z=0;z<h;z++)for(let x=0;x<w;x++){
      const depth=Math.max(0,-.25-visualHeight(geo,minX+x/(w-1)*width,minZ+z/(h-1)*height));
      const i=(z*w+x)*4;data[i]=Math.min(255,depth/2*255);data[i+3]=255;
    }
    const texture=new T.DataTexture(data,w,h,T.RGBAFormat);texture.minFilter=texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
    return {texture,bounds:new T.Vector4(minX,minZ,width,height)};
  },[geo]);
  useEffect(()=>()=>field.texture.dispose(),[field]);
  const uniforms=useMemo(()=>({time:{value:0},depthMap:{value:field.texture},bounds:{value:field.bounds},deep:{value:new T.Color('#285c6c')},shallow:{value:new T.Color('#72b2a4')},detail:{value:low?.45:1}}),[field,low]);
  useFrame((_,dt)=>{if(shader.current)shader.current.uniforms.time.value+=Math.min(dt,.1)});
  return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.25,0]}>
    <planeGeometry args={[2100000,2100000]}/><shaderMaterial ref={shader} uniforms={uniforms}
      vertexShader={'varying vec2 water;void main(){vec4 p=modelMatrix*vec4(position,1.);water=p.xz;gl_Position=projectionMatrix*viewMatrix*p;}'}
      fragmentShader={`uniform float time;uniform float detail;uniform sampler2D depthMap;uniform vec4 bounds;uniform vec3 deep;uniform vec3 shallow;varying vec2 water;
      void main(){vec2 uv=(water-bounds.xy)/bounds.zw;float inside=step(0.,uv.x)*step(0.,uv.y)*step(uv.x,1.)*step(uv.y,1.);float depth=mix(.625,texture2D(depthMap,uv).r,inside);
      float wave=sin(water.x*.65+water.y*.43-time*.7)*sin(water.y*.9-time*.45);
      float ripple=pow(max(0.,wave),10.)*.018*(.2+exp(-depth*12.))*detail;
      float foam=pow(.5+.5*sin(depth*95.-time*1.7),12.)*exp(-depth*28.)*.18;
      vec3 color=mix(shallow,deep,smoothstep(.015,.7,depth));color+=vec3(ripple+foam);gl_FragColor=vec4(color,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`}/>
  </mesh>;
}
