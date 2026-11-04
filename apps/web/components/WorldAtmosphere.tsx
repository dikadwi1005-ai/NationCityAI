'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as T from 'three';
import {chunks,emptyGeo,sample} from '../../../packages/nation-core/geography';
import {visualHeight} from '../../../packages/world-engine/visual-terrain';
import {useQuality} from '../../../packages/world-engine/quality-context';
import {QUALITY} from '../../../packages/world-engine/visual-config';
import {materialResourceCounts} from '../../../packages/world-engine/materials';
import type {World} from '../../../packages/nation-core/world';
export {default as Ocean} from './Ocean';
export {default as WorldDressing} from './TropicalDressing';
export function RenderMetrics(){
 const sample=useRef({at:0,frames:0});
 useFrame(({gl,scene,camera,size,clock})=>{const tick=sample.current;tick.frames++;if(clock.elapsedTime-tick.at<.5)return;const context=gl.getContext(),extension=context.getExtension('WEBGL_debug_renderer_info');const debug=globalThis as typeof globalThis&{__nationMetrics?:unknown;__nationProject?:(x:number,y:number,z:number)=>{x:number;y:number}};debug.__nationMetrics={fps:tick.frames/(clock.elapsedTime-tick.at),drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,programs:gl.info.programs?.length,materialResources:materialResourceCounts(),projection:(camera as T.PerspectiveCamera).isPerspectiveCamera?'perspective':'orthographic',canvasWidth:size.width,canvasHeight:size.height,zoom:(camera as T.OrthographicCamera).zoom,renderer:extension?context.getParameter(extension.UNMASKED_RENDERER_WEBGL):'unavailable',meshes:scene.children.length};debug.__nationProject=(x,y,z)=>{const v=new T.Vector3(x,y,z).project(camera);return {x:(v.x+1)*size.width/2,y:(1-v.y)*size.height/2}};tick.at=clock.elapsedTime;tick.frames=0});
 useEffect(()=>()=>{const debug=globalThis as typeof globalThis&{__nationMetrics?:unknown;__nationProject?:unknown};delete debug.__nationMetrics;delete debug.__nationProject},[]);return null;
}
