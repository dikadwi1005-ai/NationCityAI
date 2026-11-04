'use client';
import {Html} from '@react-three/drei';
import {demoPresentation,avenue} from '../../../packages/world-engine/demo-presentation';
import PublicFacility from '../../../packages/world-engine/assets/PublicFacilities';
import type {FixtureAsset} from '../../../packages/world-engine/asset-registry';
import {useLayoutEffect,useMemo,useRef,useState} from 'react';
import {BufferGeometry,Group,Matrix4,Mesh,type Material} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {ThreeEvent} from '@react-three/fiber';
import {visualVariant} from '../../../packages/world-engine/asset-registry';
import {planarUV} from '../../../packages/world-engine/materials';
import {useQuality} from '../../../packages/world-engine/quality-context';
import {Model,type RoadConnections} from '../../../packages/world-engine/Models';
import {sample,emptyGeo} from '../../../packages/nation-core/geography';
import type {World,WorldObject} from '../../../packages/nation-core/world';

export function roadConnections(o:WorldObject,objects:WorldObject[]):RoadConnections {
  const dirs=[[0,-2],[2,0],[0,2],[-2,0]].map(([x,z])=>objects.some(v=>v.asset==='road'&&v.x===o.x+x&&v.z===o.z+z));
  return {n:dirs[(4-o.rotation)%4],e:dirs[(5-o.rotation)%4],s:dirs[(6-o.rotation)%4],w:dirs[(7-o.rotation)%4]};
}
type RenderItem=WorldObject&{fixture?:FixtureAsset;label?:string};
const variant=(o:WorldObject)=>visualVariant(o.id);
const keyOf=(o:RenderItem,objects:WorldObject[],world:World)=>o.fixture?'fixture:'+o.fixture:o.asset==='road'?'road:'+Object.values(roadConnections(o,objects)).map(Number).join('')+':'+Number(avenue(world,o)):o.asset+':'+variant(o);
type Batch={geometry:BufferGeometry;material:Material;ranges:{end:number;id:string}[]};

/** Shared models compiled into material batches. Triangle spans retain object IDs
 * for picking. Road vertices still conform to the authoritative terrain sampler. */
export default function StaticWorld({world,pick}:{world:World;pick:(id:string,e:ThreeEvent<MouseEvent>)=>void}){
  const quality=useQuality();const [fixtureInfo,setFixtureInfo]=useState<RenderItem|null>(null);const templates=useRef<Group>(null),[batches,setBatches]=useState<Batch[]>([]);
  const items=useMemo<RenderItem[]>(()=>[...world.objects,...(demoPresentation(world)?.buildings??[]).map(b=>({id:b.id,asset:'house' as const,x:b.x,z:b.z,rotation:b.rotation,assetVersion:1 as const,regionId:'region-001' as const,ownerId:'administrator' as const,fixture:b.kind,label:b.name}))],[world]);
  const representatives=useMemo(()=>[...new Map(items.map(o=>[keyOf(o,world.objects,world),o])).entries()],[world,items]);
  useLayoutEffect(()=>{
    const root=templates.current;if(!root)return;root.updateWorldMatrix(true,true);
    const byKey=new Map(root.children.map(g=>[g.name,g]));
    const groups=new Map<string,{material:Material;geometries:BufferGeometry[];ranges:Batch['ranges'];faces:number}>();
    for(const o of items){
      const template=byKey.get(keyOf(o,world.objects,world));if(!template)continue;
      const base=sample(world.geo??emptyGeo,o.x,o.z).h;
      const transform=new Matrix4().makeRotationY(o.rotation*Math.PI/2);transform.setPosition(o.x,base,o.z);
      template.traverse(child=>{
        if(!(child instanceof Mesh)||Array.isArray(child.material))return;
        const local=new Matrix4().copy(template.matrixWorld).invert().multiply(child.matrixWorld);
        let geometry=child.geometry.clone().applyMatrix4(transform.clone().multiply(local));
        if(geometry.index){const indexed=geometry;geometry=geometry.toNonIndexed();indexed.dispose()}
        planarUV(geometry);
        if(o.asset==='road'){
          const positions=geometry.getAttribute('position');
          for(let i=0;i<positions.count;i++)positions.setY(i,positions.getY(i)+sample(world.geo??emptyGeo,positions.getX(i),positions.getZ(i)).h-base);
          geometry.computeVertexNormals();
        }
        const material=child.material;let group=groups.get(material.uuid);
        if(!group){group={material,geometries:[],ranges:[],faces:0};groups.set(material.uuid,group)}
        group.geometries.push(geometry);group.faces+=(geometry.index?.count??geometry.getAttribute('position').count)/3;
        group.ranges.push({end:group.faces,id:o.id});
      });
    }
    const next:Batch[]=[];
    for(const group of groups.values()){
      const geometry=mergeGeometries(group.geometries);group.geometries.forEach(g=>g.dispose());
      if(geometry){geometry.computeBoundingSphere();next.push({geometry,material:group.material,ranges:group.ranges})}
    }
    setBatches(next);return()=>next.forEach(b=>b.geometry.dispose());
  },[world,representatives,quality,items]);
  return <>
    <group ref={templates} visible={false}>{representatives.map(([key,o])=><group name={key} key={key}>{o.fixture?<PublicFacility kind={o.fixture}/>:<Model asset={o.asset} variant={variant(o)} mainRoad={avenue(world,o)} connections={o.asset==='road'?roadConnections(o,world.objects):undefined}/>}</group>)}</group>
    {batches.map(b=><mesh key={b.material.uuid} geometry={b.geometry} material={b.material} castShadow receiveShadow dispose={null} onClick={e=>{
      if(e.delta>5)return;const range=b.ranges.find(r=>(e.faceIndex??-1)<r.end);if(range){e.stopPropagation();const fixture=items.find(o=>o.id===range.id&&o.fixture);if(fixture)setFixtureInfo(fixture);else{setFixtureInfo(null);pick(range.id,e)}}
    }}/>) }
  {fixtureInfo&&<Html position={[fixtureInfo.x,sample(world.geo??emptyGeo,fixtureInfo.x,fixtureInfo.z).h+3,fixtureInfo.z]} center zIndexRange={[15,0]}><div className="fixture-info"><strong>{fixtureInfo.label}</strong><p>Aset fixture demo · belum tersedia di katalog pembangunan.</p><button onClick={()=>setFixtureInfo(null)}>Tutup</button></div></Html>}
  </>;
}
