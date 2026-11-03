'use client';
import {useEffect,useMemo,useRef,useState,type ComponentRef} from 'react';
import {Canvas,useFrame,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {CHUNK_SIZE,heightAt,footprint,placementError,type World,type WorldObject} from '../../../packages/nation-core/world';
import {Model} from '../../../packages/world-engine/Models';
import {chunks,emptyGeo,sample,regions,type Geo} from '../../../packages/nation-core/geography';
export type CameraAction={kind:string;serial:number;x?:number;z?:number;span?:number};
function Chunk({cx,cz,geo,step}:{cx:number;cz:number;geo:Geo;step:number}){
 const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();const p:number[]=[],c:number[]=[];const color=new THREE.Color();
 for(let z=0;z<CHUNK_SIZE;z+=step)for(let x=0;x<CHUNK_SIZE;x+=step){
 const xx=cx*CHUNK_SIZE+x,zz=cz*CHUNK_SIZE+z;const vertices=[[xx,zz],[xx,zz+step],[xx+step,zz],[xx+step,zz],[xx,zz+step],[xx+step,zz+step]];
 const {h,biome}=sample(geo,xx+.5,zz+.5);color.set(h<.5||biome==='sand'?'#dfd3a4':biome==='forest'?'#427c5c':biome==='rock'||h>3?'#7f9d80':(x+z)%3?'#9abd80':'#a2c488');
 for(const [vx,vz]of vertices){p.push(vx,sample(geo,vx,vz).h,vz);c.push(color.r,color.g,color.b);}
 if(step===1&&biome==='forest'&&h>.5&&xx%3===0&&zz%3===0){
 const crown=new THREE.Color('#37765a'),base=sample(geo,xx,zz).h;
 for(let side=0;side<5;side++){const a=side*2*Math.PI/5,b=(side+1)*2*Math.PI/5;
 p.push(xx+.8*Math.cos(b),base,zz+.8*Math.sin(b),xx+.8*Math.cos(a),base,zz+.8*Math.sin(a),xx,base+2.8,zz);
 for(let i=0;i<3;i++)c.push(crown.r,crown.g,crown.b);}
 }}
 g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return g;},[cx,cz,geo,step]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry} receiveShadow><meshStandardMaterial vertexColors flatShading/></mesh>
}
function Terrain({geo}:{geo:Geo}){
 const [visible,setVisible]=useState<string[]>([]),[step,setStep]=useState(1);
 const matrix=useMemo(()=>new THREE.Matrix4(),[]),frustum=useMemo(()=>new THREE.Frustum(),[]),sphere=useMemo(()=>new THREE.Sphere(new THREE.Vector3(),24),[]);
 const last=useRef('');const tick=useRef(-1);
 useFrame(({camera,clock})=>{
 if(clock.elapsedTime-tick.current<.12)return;tick.current=clock.elapsedTime;
 const zoom=(camera as THREE.OrthographicCamera).zoom;setStep(zoom<2?4:zoom<5?2:1);
 frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 const next=[];for(const k of chunks(geo).keys()){const [cx,cz]=k.split(':').map(Number);sphere.center.set(cx*16+8,1,cz*16+8);if(frustum.intersectsSphere(sphere))next.push(k)}
 const sig=next.join(',');if(sig!==last.current){last.current=sig;setVisible(next)}
 });
 return <>{visible.map(k=>{const [cx,cz]=k.split(':').map(Number);return <Chunk key={k} cx={cx} cz={cz} geo={geo} step={step}/>})}</>;
}
function Camera({action}:{action:CameraAction}){const ref=useRef<ComponentRef<typeof OrbitControls>>(null);useEffect(()=>{const c=ref.current;if(!c)return;const camera=c.object as THREE.OrthographicCamera;
 if(action.kind==='focus'){const x=action.x??0,z=action.z??0;c.target.set(x,0,z);const offset=Math.max(48,action.span??0);camera.far=Math.max(500,offset*5);camera.position.set(x+offset,offset,z+offset);camera.zoom=action.span?Math.min(10,Math.min(camera.right-camera.left,camera.top-camera.bottom)/(action.span*1.7)):10;}
 if(action.kind==='home'){camera.far=500;c.target.set(0,0,0);camera.position.set(48,48,48);camera.zoom=10;}
 if(action.kind==='in')camera.zoom=Math.min(30,camera.zoom*1.25);
 if(action.kind==='out')camera.zoom=Math.max(.0001,camera.zoom/1.25);
 camera.updateProjectionMatrix();c.update();},[action]);return <OrbitControls ref={ref} makeDefault minZoom={.0001} maxZoom={30} minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.6} enableDamping mouseButtons={{LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE}}/>}
export default function Scene({brush,world,draft,selected,grid,low,action,onGround,onSelect,onHover}:{brush?:{x:number;z:number;radius:number};world:World;draft:WorldObject|null;selected:string|null;grid:boolean;low:boolean;action:CameraAction;onGround:(x:number,z:number)=>void;onSelect:(id:string)=>void;onHover:(x:number,z:number)=>void}){
 const [webgl,setWebgl]=useState(true);useEffect(()=>{const canvas=document.createElement('canvas');if(!canvas.getContext('webgl2'))setWebgl(false)},[]);
 if(!webgl)return <div className="loading">WebGL 2 tidak tersedia. Aktifkan akselerasi grafis pada browser.</div>;
 const geo=world.geo??emptyGeo;
 const ground=(e:ThreeEvent<PointerEvent>)=>{onHover(Math.round(e.point.x/2)*2,Math.round(e.point.z/2)*2)};
 return <Canvas orthographic shadows={!low} dpr={low?1:[1,1.5]} camera={{position:[48,48,48],zoom:10,near:.1,far:500}} gl={{antialias:!low}} onCreated={({gl})=>{gl.setClearColor('#b8d9db')}}>
 <ambientLight intensity={1.6}/><hemisphereLight args={['#fff9e8','#7b9c92',1]}/><directionalLight position={[20,45,15]} intensity={2.5} castShadow={!low} shadow-mapSize={[2048,2048]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={130} shadow-bias={-.001}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.25,0]} receiveShadow><planeGeometry args={[2100000,2100000]}/><meshStandardMaterial color="#87bfc8" roughness={.4}/></mesh>
 <Terrain geo={geo}/>{brush&&<mesh rotation={[-Math.PI/2,0,0]} position={[brush.x,sample(geo,brush.x,brush.z).h+.35,brush.z]} renderOrder={5}><ringGeometry args={[brush.radius-.2,brush.radius,64]}/><meshBasicMaterial color="#fff7ba" depthTest={false}/></mesh>}
 {regions(geo).map(r=><mesh key={r.id} position={[r.x,sample(geo,r.x,r.z).h+.2,r.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[r.radius-.25,r.radius,64]}/><meshBasicMaterial color="#ffca64" depthTest={false} transparent opacity={.8}/></mesh>)}
 {grid&&<gridHelper args={[80,40,'#668c7b','#9db398']} position={[0,.83,0]}/>}
 {world.objects.map(o=><group key={o.id} position={[o.x,sample(geo,o.x,o.z).h,o.z]} rotation={[0,o.rotation*Math.PI/2,0]} onClick={e=>{if(e.delta>5)return;e.stopPropagation();if(draft)onGround(o.x,o.z);else onSelect(o.id)}}><Model asset={o.asset}/>{selected===o.id&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.12,0]}><ringGeometry args={[1.8,2,40]}/><meshBasicMaterial color="#fff3bf" side={THREE.DoubleSide}/></mesh>}</group>)}
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.85,0]} onPointerMove={ground} onClick={e=>{if(e.delta>5)return;e.stopPropagation();onGround(Math.round(e.point.x/2)*2,Math.round(e.point.z/2)*2)}}><planeGeometry args={[2100000,2100000]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 {draft&&<group position={[draft.x,sample(geo,draft.x,draft.z).h+.12,draft.z]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[footprint(draft).w,footprint(draft).d]}/><meshBasicMaterial color={placementError(draft,world.objects,geo)?'#ea6b65':'#f8e9a6'} transparent opacity={.75} side={THREE.DoubleSide} depthWrite={false}/></mesh><group rotation={[0,draft.rotation*Math.PI/2,0]}><Model asset={draft.asset}/></group></group>}
 <Camera action={action}/>
 </Canvas>
}
