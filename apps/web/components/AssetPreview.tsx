'use client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Model} from '../../../packages/world-engine/Models';
import type {Asset} from '../../../packages/nation-core/world';
export default function AssetPreview({asset}:{asset:Asset}){return <div className="asset-preview" aria-hidden="true"><Canvas frameloop="demand" orthographic dpr={1} camera={{position:[6,5,7],zoom:asset==='hall'?20:asset==='tree'?24:asset==='house'?30:22}} gl={{antialias:true,alpha:true}}><ambientLight intensity={1.2}/><directionalLight position={[4,8,5]} intensity={2}/><group position={[0,-.65,0]}><Model asset={asset}/></group><OrbitControls makeDefault target={[0,.5,0]} enablePan={false} enableRotate={false} enableZoom={false}/></Canvas></div>}
