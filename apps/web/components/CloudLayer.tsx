'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {BackSide,ShaderMaterial,type Mesh} from 'three';
import {localWorldClock} from '../../../packages/nation-sim/world-clock';
import {useQuality} from '../../../packages/world-engine/quality-context';
export default function CloudLayer(){
 const quality=useQuality(),ref=useRef<Mesh>(null),material=useMemo(()=>new ShaderMaterial({transparent:true,depthWrite:false,side:BackSide,uniforms:{time:{value:0},strength:{value:.7},day:{value:1},twilight:{value:0}},vertexShader:'varying vec2 vUv;varying vec3 vDir;void main(){vUv=uv;vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;varying vec3 vDir;uniform float time;uniform float strength;uniform float day;uniform float twilight;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){if(vDir.y<=.005)discard;vec2 p=vUv*vec2(18.,10.)+vec2(time*.015,0);float n=.58*noise(p)+.27*noise(p*2.1)+.15*noise(p*4.2);float a=smoothstep(.43,.65,n)*smoothstep(.025,.16,vDir.y)*(1.-smoothstep(.65,.95,vDir.y));vec3 sky=mix(vec3(.67,.80,.82),vec3(.20,.48,.64),smoothstep(.03,.7,vDir.y));vec3 cloud=mix(vec3(.62,.72,.75),vec3(.98,.98,.93),n);sky=mix(vec3(.018,.035,.065),sky,day);cloud=mix(vec3(.055,.075,.105),cloud,day);sky=mix(sky,vec3(.60,.36,.26),twilight*.22*day);gl_FragColor=vec4(mix(sky,cloud,a*strength),smoothstep(.005,.05,vDir.y));}`}),[]);
 useEffect(()=>{material.uniforms.strength.value=quality==='low'?.6:.88},[material,quality]);useEffect(()=>()=>material.dispose(),[material]);
 useFrame(({camera,clock})=>{ref.current?.position.copy(camera.position);material.uniforms.time.value=clock.elapsedTime;const t=localWorldClock.sample();material.uniforms.day.value=t.day;material.uniforms.twilight.value=t.twilight});
 return <mesh ref={ref} material={material} renderOrder={-1} raycast={()=>null}><sphereGeometry args={[300,32,16]}/></mesh>;
}
