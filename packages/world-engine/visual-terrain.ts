import {sample,type Geo} from '../nation-core/geography.ts';

const caches=new WeakMap<Geo,Map<string,number>>();
/** Rendering only. Collision, terrain commands and persistence use sample(). */
export function visualHeight(geo:Geo,x:number,z:number):number {
  let cache=caches.get(geo);if(!cache){cache=new Map();caches.set(geo,cache)}
  const key=x+':'+z,hit=cache.get(key);if(hit!==undefined)return hit;
  const h=sample(geo,x,z).h;
  if(h>.81||h< -1.6)return h;
  let total=h*4,weight=4,uniform=true;
  for(const [dx,dz]of [[.6,0],[-.6,0],[0,.6],[0,-.6],[.42,.42],[-.42,.42],[.42,-.42],[-.42,-.42]]){
    const neighbor=sample(geo,x+dx,z+dz).h;total+=neighbor;weight++;if(neighbor!==h)uniform=false;
  }
  const result=uniform?h:total/weight;
  if(cache.size<150000)cache.set(key,result);
  return result;
}
