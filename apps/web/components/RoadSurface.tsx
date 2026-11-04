'use client';
import {useLayoutEffect,useRef,type ReactNode} from 'react';
import {Group,Mesh} from 'three';
import {conformRoadGeometry} from '../../../packages/world-engine/road-surface';
import {sample,type Geo} from '../../../packages/nation-core/geography';
export default function RoadSurface({children,geo,x,z,rotation}:{children:ReactNode;geo:Geo;x:number;z:number;rotation:number}){
 const group=useRef<Group>(null);
 useLayoutEffect(()=>{const root=group.current;if(!root)return;root.updateWorldMatrix(true,true);const originals:{mesh:Mesh;geometry:Mesh['geometry']}[]=[];root.traverse(object=>{if(!(object instanceof Mesh))return;const original=object.geometry;originals.push({mesh:object,geometry:original});object.geometry=conformRoadGeometry(original,object.matrixWorld,sample(geo,x,z).h,(a,b)=>sample(geo,a,b).h)});return()=>{for(const {mesh,geometry}of originals){mesh.geometry.dispose();mesh.geometry=geometry}}},[geo,x,z,rotation]);
 return <group ref={group}>{children}</group>;
}
