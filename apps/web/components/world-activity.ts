'use client';
import {create} from 'zustand';
import type {Density} from '../../../packages/world-engine/living-world';
type Settings={npc:Density;traffic:Density;paused:boolean;speed:1|2;paths:boolean;set:(p:Partial<Omit<Settings,'set'>>)=>void};
export const useActivity=create<Settings>(set=>({npc:'low',traffic:'low',paused:false,speed:1,paths:false,set:p=>set(p)}));
