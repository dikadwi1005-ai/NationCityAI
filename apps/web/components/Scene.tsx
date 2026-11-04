'use client';
import {useEffect,useMemo,useRef,useState,type ComponentRef} from 'react';
import {Canvas,useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {CHUNK_SIZE,heightAt,footprint,placementError,type World,type WorldObject} from '../../../packages/nation-core/world';
import RoadSurface from './RoadSurface';
import LivingWorld from './LivingWorld';
import {Ocean,WorldDressing,RenderMetrics} from './WorldAtmosphere';
import {Model} from '../../../packages/world-engine/Models';
import {chunks,emptyGeo,sample,regions,type Geo} from '../../../packages/nation-core/geography';
export type CameraAction={kind:string;serial:number;x?:number;z?:number;span?:number};
function Chunk({cx,cz,geo,step}:{cx:number;cz:number;geo:Geo;step:number}){
 const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();const p:number[]=[],c:number[]=[];const color=new THREE.Color();
 for(let z=0;z<CHUNK_SIZE;z+=step)for(let x=0;x<CHUNK_SIZE;x+=step){
 const xx=cx*CHUNK_SIZE+x,zz=cz*CHUNK_SIZE+z;const vertices=[[xx,zz],[xx,zz+step],[xx+step,zz],[xx+step,zz],[xx,zz+step],[xx+step,zz+step]];
 const {h,biome}=sample(geo,xx+.5,zz+.5);color.set(h<0?'#438e91':h<.5||biome==='sand'?'#dac898':biome==='forest'?'#4b8250':biome==='rock'||h>4?'#8b9a76':'#77a361');color.multiplyScalar(.96+.05*Math.sin(xx*.19)*Math.cos(zz*.21));
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
function Camera({action}:{action:CameraAction}){
 const ref=useRef<ComponentRef<typeof OrbitControls>>(null),goal=useRef<{position:THREE.Vector3;target:THREE.Vector3;zoom:number}|null>(null);const {size}=useThree();
 useEffect(()=>{const c=ref.current;if(!c)return;const cam=c.object as THREE.OrthographicCamera;let position=cam.position.clone(),target=c.target.clone(),zoom=cam.zoom;
 if(action.kind==='home'){target.set(0,0,0);position.set(48,44,48);zoom=size.width<650?8:Math.min(size.width/94,size.height/60)}
 if(action.kind==='focus'){const x=action.x??0,z=action.z??0;target.set(x,0,z);const offset=Math.max(48,action.span??0);position.set(x+offset,offset*.92,z+offset);cam.far=Math.max(500,offset*6);zoom=action.span?Math.min(72,Math.min(size.width,size.height)/(action.span*1.35)):16}
 if(action.kind==='follow'){cam.zoom=26;cam.updateProjectionMatrix();goal.current=null;return;}
 if(action.kind==='in')zoom=Math.min(100,zoom*1.25);
 if(action.kind==='out')zoom=Math.max(.0001,zoom/1.25);
 if(action.kind==='orbit'){const offset=position.clone().sub(target).applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4);position.copy(target).add(offset)}
 goal.current={position,target,zoom};
 },[action,size.width,size.height]);
 useFrame((_,dt)=>{const c=ref.current,g=goal.current;if(!c||!g)return;const cam=c.object as THREE.OrthographicCamera,a=1-Math.exp(-9*Math.min(dt,.1));cam.position.lerp(g.position,a);c.target.lerp(g.target,a);cam.zoom=THREE.MathUtils.lerp(cam.zoom,g.zoom,a);cam.updateProjectionMatrix();c.update();if(cam.position.distanceTo(g.position)<.01&&Math.abs(cam.zoom-g.zoom)<.002)goal.current=null});
 return <OrbitControls ref={ref} makeDefault minZoom={.0001} maxZoom={100} minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.5} enableDamping dampingFactor={.09} onStart={()=>{goal.current=null}} mouseButtons={{LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE}}/>;
}
export default function Scene({children,brush,world,draft,selected,grid,layers=false,low,activityIsland,action,onGround,onSelect,onHover}:{children?:React.ReactNode;brush?:{x:number;z:number;radius:number};world:World;draft:WorldObject|null;selected:string|null;grid:boolean;layers?:boolean;low:boolean;activityIsland?:string;action:CameraAction;onGround:(x:number,z:number)=>void;onSelect:(id:string)=>void;onHover:(x:number,z:number)=>void}){
 const [webgl,setWebgl]=useState(true);useEffect(()=>{const canvas=document.createElement('canvas');if(!canvas.getContext('webgl2'))setWebgl(false)},[]);
 if(!webgl)return <div className="loading">WebGL 2 tidak tersedia. Aktifkan akselerasi grafis pada browser.</div>;
 const geo=world.geo??emptyGeo;
 const ground=(e:ThreeEvent<PointerEvent>)=>{onHover(Math.round(e.point.x/2)*2,Math.round(e.point.z/2)*2)};
 return <Canvas orthographic shadows={!low} dpr={low?1:[1,1.5]} camera={{position:[48,48,48],zoom:10,near:.1,far:500}} gl={{antialias:!low}} onCreated={({gl})=>{gl.setClearColor('#387f87');gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.08;gl.shadowMap.type=THREE.PCFSoftShadowMap}}>
 <ambientLight intensity={.75}/><hemisphereLight args={['#e9f2df','#4b735d',1]}/><directionalLight position={[20,45,15]} intensity={2.4} castShadow={!low} shadow-mapSize={[2048,2048]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55} shadow-camera-far={130} shadow-bias={-.001}/>
 <Ocean low={low}/><WorldDressing world={world}/><RenderMetrics/>
 <Terrain geo={geo}/>{brush&&<mesh rotation={[-Math.PI/2,0,0]} position={[brush.x,sample(geo,brush.x,brush.z).h+.35,brush.z]} renderOrder={5}><ringGeometry args={[brush.radius-.2,brush.radius,64]}/><meshBasicMaterial color="#fff7ba" depthTest={false}/></mesh>}
 {(grid||layers)&&regions(geo).map(r=><mesh key={r.id} position={[r.x,sample(geo,r.x,r.z).h+.2,r.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[r.radius-.25,r.radius,64]}/><meshBasicMaterial color="#ffca64" depthTest={false} transparent opacity={.8}/></mesh>)}
 {grid&&<gridHelper args={[80,40,'#668c7b','#9db398']} position={[0,.83,0]}/>}
 {world.objects.map(o=><group key={o.id} position={[o.x,sample(geo,o.x,o.z).h,o.z]} rotation={[0,o.rotation*Math.PI/2,0]} onClick={e=>{if(e.delta>5)return;e.stopPropagation();if(draft)onGround(o.x,o.z);else onSelect(o.id)}}>{o.asset==='road'?<RoadSurface geo={geo} x={o.x} z={o.z} rotation={o.rotation}><Model asset={o.asset} variant={parseInt(o.id.slice(-4),16)%3} connections={o.asset==='road'?(()=>{const dirs=[[0,-2],[2,0],[0,2],[-2,0]].map(([x,z])=>world.objects.some(v=>v.asset==='road'&&v.x===o.x+x&&v.z===o.z+z));return {n:dirs[(4-o.rotation)%4],e:dirs[(5-o.rotation)%4],s:dirs[(6-o.rotation)%4],w:dirs[(7-o.rotation)%4]}})():undefined}/></RoadSurface>:<Model asset={o.asset} variant={parseInt(o.id.slice(-4),16)%3}/>}{selected===o.id&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.12,0]}><ringGeometry args={[1.8,2,40]}/><meshBasicMaterial color="#fff3bf" side={THREE.DoubleSide}/></mesh>}</group>)}
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.85,0]} onPointerMove={ground} onClick={e=>{if(e.delta>5)return;e.stopPropagation();onGround(Math.round(e.point.x/2)*2,Math.round(e.point.z/2)*2)}}><planeGeometry args={[2100000,2100000]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 {draft&&<group position={[draft.x,sample(geo,draft.x,draft.z).h+.12,draft.z]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[footprint(draft).w,footprint(draft).d]}/><meshBasicMaterial color={placementError(draft,world.objects,geo)?'#ea6b65':'#f8e9a6'} transparent opacity={.75} side={THREE.DoubleSide} depthWrite={false}/></mesh><group rotation={[0,draft.rotation*Math.PI/2,0]}>{draft.asset==='road'?<RoadSurface geo={geo} x={draft.x} z={draft.z} rotation={draft.rotation}><Model asset={draft.asset} variant={parseInt(draft.id.slice(-4),16)%3}/></RoadSurface>:<Model asset={draft.asset}/>}</group></group>}
 <LivingWorld world={world} island={activityIsland}/><Camera action={action}/>{children}
 </Canvas>
}
