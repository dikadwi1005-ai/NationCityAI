import {sample,type Geo} from '../nation-core/geography.ts';

const caches=new WeakMap<Geo,Map<string,number>>();
/** Rendering only. Collision, terrain commands and persistence use sample(). */
function gridHeight(geo:Geo,x:number,z:number):number {
 let cache=caches.get(geo);if(!cache){cache=new Map();caches.set(geo,cache)}const key=x+':'+z,hit=cache.get(key);if(hit!==undefined)return hit;
 const h=sample(geo,x,z).h;if(h>1.3)return h;let sum=0,weight=0,uniform=true;
 for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const w=(dx===0?2:1)*(dz===0?2:1),v=sample(geo,x+dx*.5,z+dz*.5).h;sum+=v*w;weight+=w;if(v!==h)uniform=false}
 const result=uniform?h:sum/weight;if(cache.size<150000)cache.set(key,result);return result;
}
export function visualHeight(geo:Geo,x:number,z:number):number {
 const h=sample(geo,x,z).h;if(h>1.3)return h;const x0=Math.floor(x*2)/2,z0=Math.floor(z*2)/2,u=(x-x0)*2,v=(z-z0)*2;
 const a=gridHeight(geo,x0,z0),b=gridHeight(geo,x0+.5,z0),c=gridHeight(geo,x0,z0+.5),d=gridHeight(geo,x0+.5,z0+.5);
 return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;
}
