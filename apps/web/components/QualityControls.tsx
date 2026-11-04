'use client';
import {useVisualSettings} from './visual-settings';
import type {Quality} from '../../../packages/world-engine/visual-config';
export default function QualityControls({onChange}:{onChange?:(q:Quality)=>void}){const {quality,setQuality}=useVisualSettings();return <label>Kualitas visual<select aria-label="Kualitas visual" value={quality} onChange={e=>{setQuality(e.target.value as Quality);onChange?.(e.target.value as Quality)}}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><small>Material, detail, vegetasi, resolusi dan shadow.</small></label>}
