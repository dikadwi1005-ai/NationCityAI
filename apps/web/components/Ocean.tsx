'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as T from 'three';
import {chunks,emptyGeo,type Geo} from '../../../packages/nation-core/geography';
import {coastalField} from '../../../packages/world-engine/coastal-field';
import {visualHeight} from '../../../packages/world-engine/visual-terrain';

export default function Ocean({low,geo=emptyGeo}:{low:boolean;geo?:Geo}){
  const shader=useRef<T.ShaderMaterial>(null);
  const field=useMemo(()=>{
    const {data,w,h,minX,minZ,width,height}=coastalField(geo,low?128:384);
    const texture=new T.DataTexture(data,w,h,T.RGBAFormat);texture.minFilter=texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
    return {texture,bounds:new T.Vector4(minX,minZ,width,height)};
  },[geo,low]);
  useEffect(()=>()=>field.texture.dispose(),[field]);
  const uniforms=useMemo(()=>({time:{value:0},viewer:{value:new T.Vector3()},depthMap:{value:field.texture},bounds:{value:field.bounds},deep:{value:new T.Color('#234f62')},shallow:{value:new T.Color('#528e8a')},detail:{value:low?.45:1}}),[field,low]);
  useFrame(({camera},dt)=>{if(shader.current){shader.current.uniforms.time.value+=Math.min(dt,.1);shader.current.uniforms.viewer.value.copy(camera.position)}});
  return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.25,0]}>
    <planeGeometry args={[4096,4096]}/><shaderMaterial ref={shader} uniforms={uniforms}
      vertexShader={'varying vec2 water;void main(){vec4 p=modelMatrix*vec4(position,1.);water=p.xz;gl_Position=projectionMatrix*viewMatrix*p;}'}
      fragmentShader={`uniform float time;uniform vec3 viewer;uniform float detail;uniform sampler2D depthMap;uniform vec4 bounds;uniform vec3 deep;uniform vec3 shallow;varying vec2 water;varying float waterDistance;
      void main(){vec2 uv=(water-bounds.xy)/bounds.zw;float inside=step(0.,uv.x)*step(0.,uv.y)*step(uv.x,1.)*step(uv.y,1.);vec2 field=texture2D(depthMap,uv).rg;float coast=mix(12.,field.g*12.,inside);float depth=mix(.9,field.r+coast*.035,inside);
      float wave=sin(water.x*.65+water.y*.43-time*.7)*sin(water.y*.9-time*.45);
      float ripple=pow(max(0.,wave),10.)*.018*(.2+exp(-depth*12.))*detail;
      float foam=pow(max(0.,sin(coast*5.5-time*.9)),8.)*.09*exp(-coast*1.8);
      vec3 color=mix(shallow,deep,smoothstep(.015,.7,depth));color+=vec3(ripple+foam);color=mix(color,vec3(.26,.38,.41),1.-exp(-pow(distance(viewer,vec3(water.x,-.25,water.y))*.0015,2.)));gl_FragColor=vec4(color,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`}/>
  </mesh>;
}
