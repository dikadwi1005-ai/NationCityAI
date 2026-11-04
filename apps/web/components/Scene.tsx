'use client';
import {useEffect,useMemo,useRef,useState,type ComponentRef} from 'react';
import {Canvas,useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {CHUNK_SIZE,heightAt,footprint,placementError,type World,type WorldObject} from '../../../packages/nation-core/world';
import RoadSurface from './RoadSurface';
import {visualVariant} from '../../../packages/world-engine/asset-registry';
import LivingWorld from './LivingWorld';
import NaturalLight from './NaturalLight';
import DemoLandscape from './DemoLandscape';
import {useVisualSettings} from './visual-settings';
import {QualityContext} from '../../../packages/world-engine/quality-context';
import {QUALITY} from '../../../packages/world-engine/visual-config';
import StaticWorld,{roadConnections} from './StaticWorld';
import UrbanEnvironment from './UrbanEnvironment';
import Terrain from './TerrainSurface';
import {Ocean,WorldDressing,RenderMetrics} from './WorldAtmosphere';
import {Model} from '../../../packages/world-engine/Models';
import {chunks,emptyGeo,sample,regions,type Geo} from '../../../packages/nation-core/geography';
export type CameraAction={kind:string;serial:number;x?:number;z?:number;span?:number};
function Camera({action,world}:{action:CameraAction;world:World}){
 const ref=useRef<ComponentRef<typeof OrbitControls>>(null),goal=useRef<{position:THREE.Vector3;target:THREE.Vector3;fov:number}|null>(null);const {size}=useThree();
 useEffect(()=>{const c=ref.current;if(!c)return;const cam=c.object as THREE.PerspectiveCamera;let position=cam.position.clone(),target=c.target.clone(),fov=cam.fov;cam.zoom=1;
 if(action.kind==='home'||action.kind==='neighborhood'){target.set(2,1,3);position.set(34,29,40)}
 if(action.kind==='city'){target.set(6,1,6);position.set(47,42,57)}
 if(action.kind==='street'){const x=action.x??c.target.x,z=action.z??c.target.z;target.set(x,sample(world.geo??emptyGeo,x,z).h+.45,z);position.copy(target).add(new THREE.Vector3(2,.25,3));fov=50}else if(['home','city','neighborhood','focus','follow'].includes(action.kind))fov=42;
 if(action.kind==='focus'){const x=action.x??0,z=action.z??0,span=action.span??20;target.set(x,sample(world.geo??emptyGeo,x,z).h+.8,z);const offset=Math.max(4,span*(span<=14?.43:.85));position.set(x+offset,target.y+offset*.72,z+offset*1.15);cam.far=Math.max(800,offset*8)}
 if(action.kind==='follow'){cam.position.copy(c.target).add(new THREE.Vector3(3,1.8,4));cam.fov=42;cam.updateProjectionMatrix();c.update();goal.current=null;return;}
 if(action.kind==='in')position.copy(target).add(position.clone().sub(target).multiplyScalar(.8));
 if(action.kind==='out')position.copy(target).add(position.clone().sub(target).multiplyScalar(1.25));
 if(action.kind==='orbit')position.copy(target).add(position.clone().sub(target).applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4));
 cam.updateProjectionMatrix();goal.current={position,target,fov};
 },[action,size.width,size.height]);
 useFrame((_,dt)=>{const c=ref.current,g=goal.current;if(!c)return;const cam=c.object as THREE.PerspectiveCamera;if(!g){cam.position.y=Math.max(cam.position.y,sample(world.geo??emptyGeo,cam.position.x,cam.position.z).h+.35);return}const a=1-Math.exp(-9*Math.min(dt,.1));c.object.position.lerp(g.position,a);c.target.lerp(g.target,a);cam.fov=THREE.MathUtils.lerp(cam.fov,g.fov,a);cam.updateProjectionMatrix();cam.position.y=Math.max(cam.position.y,sample(world.geo??emptyGeo,cam.position.x,cam.position.z).h+.35);c.update();if(c.object.position.distanceTo(g.position)<.01&&Math.abs(cam.fov-g.fov)<.01)goal.current=null});
 return <OrbitControls ref={ref} makeDefault minDistance={3} maxDistance={5000000} minPolarAngle={Math.PI/8} maxPolarAngle={Math.PI/2.03} enableDamping dampingFactor={.09} onStart={()=>{goal.current=null}} touches={{ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE}} mouseButtons={{LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE}}/>;
}
export default function Scene({children,brush,world,draft,selected,grid,layers=false,low,activityIsland,action,onGround,onSelect,onHover}:{children?:React.ReactNode;brush?:{x:number;z:number;radius:number};world:World;draft:WorldObject|null;selected:string|null;grid:boolean;layers?:boolean;low:boolean;activityIsland?:string;action:CameraAction;onGround:(x:number,z:number)=>void;onSelect:(id:string)=>void;onHover:(x:number,z:number)=>void}){
 const selectedQuality=useVisualSettings(s=>s.quality),quality=low?'low':selectedQuality,preset=QUALITY[quality];const [webgl,setWebgl]=useState(true);useEffect(()=>{const canvas=document.createElement('canvas');if(!canvas.getContext('webgl2'))setWebgl(false)},[]);
 if(!webgl)return <div className="loading">WebGL 2 tidak tersedia. Aktifkan akselerasi grafis pada browser.</div>;
 const geo=world.geo??emptyGeo;
 const ground=(e:ThreeEvent<PointerEvent>)=>{onHover(Math.round(e.point.x/2)*2,Math.round(e.point.z/2)*2)};
 return <Canvas shadows={!!preset.shadow} dpr={preset.dpr} camera={{position:[34,29,40],fov:42,near:.08,far:800}} gl={{antialias:!low}} onCreated={({gl})=>{gl.setClearColor('#387f87');gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.08;gl.shadowMap.type=THREE.PCFSoftShadowMap}}>
 <QualityContext.Provider value={quality}><NaturalLight/>
 <Ocean low={quality==='low'} geo={geo}/><WorldDressing world={world}/><RenderMetrics/>
 <Terrain geo={geo}/>{brush&&<mesh rotation={[-Math.PI/2,0,0]} position={[brush.x,sample(geo,brush.x,brush.z).h+.35,brush.z]} renderOrder={5}><ringGeometry args={[brush.radius-.2,brush.radius,64]}/><meshBasicMaterial color="#fff7ba" depthTest={false}/></mesh>}
 {(grid||layers)&&regions(geo).map(r=><mesh key={r.id} position={[r.x,sample(geo,r.x,r.z).h+.2,r.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[r.radius-.25,r.radius,64]}/><meshBasicMaterial color="#ffca64" depthTest={false} transparent opacity={.8}/></mesh>)}
 {grid&&<gridHelper args={[80,40,'#668c7b','#9db398']} position={[0,.83,0]}/>}
 <StaticWorld world={world} pick={(id)=>{const o=world.objects.find(o=>o.id===id);if(o){if(draft)onGround(o.x,o.z);else onSelect(id)}}}/><UrbanEnvironment world={world}/><DemoLandscape world={world}/>
 {selected&&world.objects.filter(o=>o.id===selected).map(o=><mesh key={o.id} rotation={[-Math.PI/2,0,0]} position={[o.x,sample(geo,o.x,o.z).h+.13,o.z]}><ringGeometry args={[1.8,2,40]}/><meshBasicMaterial color="#fff3bf" side={THREE.DoubleSide}/></mesh>)}

 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.85,0]} onPointerMove={ground} onClick={e=>{if(e.delta>5)return;e.stopPropagation();onGround(Math.round(e.point.x/2)*2,Math.round(e.point.z/2)*2)}}><planeGeometry args={[2100000,2100000]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 {draft&&<group position={[draft.x,sample(geo,draft.x,draft.z).h+.12,draft.z]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[footprint(draft).w,footprint(draft).d]}/><meshBasicMaterial color={placementError(draft,world.objects,geo)?'#ea6b65':'#f8e9a6'} transparent opacity={.75} side={THREE.DoubleSide} depthWrite={false}/></mesh><group rotation={[0,draft.rotation*Math.PI/2,0]}>{draft.asset==='road'?<RoadSurface geo={geo} x={draft.x} z={draft.z} rotation={draft.rotation}><Model asset={draft.asset} variant={visualVariant(draft.id)} connections={roadConnections(draft,[...world.objects.filter(o=>o.id!==draft.id),draft])}/></RoadSurface>:<Model asset={draft.asset} variant={visualVariant(draft.id)}/>}</group></group>}
 <LivingWorld world={world} island={activityIsland}/><Camera action={action} world={world}/>{children}
 </QualityContext.Provider></Canvas>
}
