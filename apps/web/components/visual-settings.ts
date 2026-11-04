'use client';
import {create} from 'zustand';
import type {Quality} from '../../../packages/world-engine/visual-config';
export const useVisualSettings=create<{quality:Quality;setQuality:(quality:Quality)=>void}>(set=>({quality:'medium',setQuality:quality=>set({quality})}));
