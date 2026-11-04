'use client';
import {useEffect,useMemo,useRef,useState,type ComponentRef} from 'react';
import {Canvas,useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {CHUNK_SIZE,heightAt,footprint,placementError,type World,type WorldObject} from '../../../packages/nation-core/world';
import RoadSurface from './RoadSurface';
import LivingWorld from './LivingWorld';
import StaticWorld,{roadConnections} from './StaticWorld';
import UrbanEnvironment from './UrbanEnvironment';
import Terrain from './TerrainSurface';
import {Ocean,WorldDressing,RenderMetrics} from './WorldAtmosphere';
import {Model} from '../../../packages/world-engine/Models';
import {chunks,emptyGeo,sample,regions,type Geo} from '../../../packages/nation-core/geography';
export type CameraAction={kind:string;serial:number;x?:number;z?:number;span?:number};
function Camera({action}:{action:CameraAction}){
 const ref=useRef<ComponentRef<typeof OrbitControls>>(null),goal=useRef<{position:THREE.Vector3;target:THREE.Vector3;zoom:number}|null>(null);const {size}=useThree();
 useEffect(()=>{const c=ref.current;if(!c)return;const cam=c.object as THREE.OrthographicCamera;let position=cam.position.clone(),target=c.target.clone(),zoom=cam.zoom;
 if(action.kind==='home'){target.set(2,0,3);position.set(50,40,51);zoom=size.width<650?10:Math.min(size.width/66,size.height/43)}
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
 <Ocean low={low} geo={geo}/><WorldDressing world={world}/><RenderMetrics/>
 <Terrain geo={geo}/>{brush&&<mesh rotation={[-Math.PI/2,0,0]} position={[brush.x,sample(geo,brush.x,brush.z).h+.35,brush.z]} renderOrder={5}><ringGeometry args={[brush.radius-.2,brush.radius,64]}/><meshBasicMaterial color="#fff7ba" depthTest={false}/></mesh>}
 {(grid||layers)&&regions(geo).map(r=><mesh key={r.id} position={[r.x,sample(geo,r.x,r.z).h+.2,r.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[r.radius-.25,r.radius,64]}/><meshBasicMaterial color="#ffca64" depthTest={false} transparent opacity={.8}/></mesh>)}
 {grid&&<gridHelper args={[80,40,'#668c7b','#9db398']} position={[0,.83,0]}/>}
 <StaticWorld world={world} pick={(id)=>{const o=world.objects.find(o=>o.id===id);if(o){if(draft)onGround(o.x,o.z);else onSelect(id)}}}/><UrbanEnvironment world={world}/>
 {selected&&world.objects.filter(o=>o.id===selected).map(o=><mesh key={o.id} rotation={[-Math.PI/2,0,0]} position={[o.x,sample(geo,o.x,o.z).h+.13,o.z]}><ringGeometry args={[1.8,2,40]}/><meshBasicMaterial color="#fff3bf" side={THREE.DoubleSide}/></mesh>)}

 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.85,0]} onPointerMove={ground} onClick={e=>{if(e.delta>5)return;e.stopPropagation();onGround(Math.round(e.point.x/2)*2,Math.round(e.point.z/2)*2)}}><planeGeometry args={[2100000,2100000]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 {draft&&<group position={[draft.x,sample(geo,draft.x,draft.z).h+.12,draft.z]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[footprint(draft).w,footprint(draft).d]}/><meshBasicMaterial color={placementError(draft,world.objects,geo)?'#ea6b65':'#f8e9a6'} transparent opacity={.75} side={THREE.DoubleSide} depthWrite={false}/></mesh><group rotation={[0,draft.rotation*Math.PI/2,0]}>{draft.asset==='road'?<RoadSurface geo={geo} x={draft.x} z={draft.z} rotation={draft.rotation}><Model asset={draft.asset} variant={parseInt(draft.id.slice(-4),16)%3} connections={roadConnections(draft,[...world.objects.filter(o=>o.id!==draft.id),draft])}/></RoadSurface>:<Model asset={draft.asset} variant={parseInt(draft.id.slice(-4),16)%3}/>}</group></group>}
 <LivingWorld world={world} island={activityIsland}/><Camera action={action}/>{children}
 </Canvas>
}
