import {create} from 'zustand';
import type {Asset} from '../../../packages/nation-core/world';
type Editor={tool:'select'|'place'|'move';asset:Asset;rotation:number;selected:string|null;grid:boolean;layers:boolean;low:boolean;set:(patch:Partial<Omit<Editor,'set'>>)=>void};
export const useEditor=create<Editor>(set=>({tool:'select',asset:'house',rotation:0,selected:null,grid:false,layers:false,low:false,set:patch=>set(patch)}));
