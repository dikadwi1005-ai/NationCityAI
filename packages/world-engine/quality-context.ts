'use client';
import {createContext,useContext} from 'react';
import type {Quality} from './visual-config';
export const QualityContext=createContext<Quality>('medium');
export const useQuality=()=>useContext(QualityContext);
