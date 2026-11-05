import type {World} from '../nation-core/world.ts';
import {sample,emptyGeo} from '../nation-core/geography.ts';
import {traversable,clearSegment} from './living-world.ts';
import {demoPresentation} from './demo-presentation.ts';
export type Animal={id:number;species:'cat'|'dog'|'goat'|'chicken';x:number;z:number;size:number;color:string};
const notRoad=(world:World,x:number,z:number)=>!world.objects.some(o=>o.asset==='road'&&Math.abs(o.x-x)<1.2&&Math.abs(o.z-z)<1.2);
export function habitatAnimals(world:World,limit:number):Animal[]{
 const result:Animal[]=[],houses=world.objects.filter(o=>o.asset==='house'),districts=demoPresentation(world)?.districts??[];
 // Rural homes are sampled first so a small cap still represents both habitats.
 const rural=(o:{x:number;z:number})=>districts.find(d=>d.role==='village'&&Math.hypot(o.x-d.x,o.z-d.z)<d.span/2);
 const ruralHouses=houses.filter(rural),urbanHouses=houses.filter(o=>!rural(o)),ordered=Array.from({length:Math.max(ruralHouses.length,urbanHouses.length)},(_,i)=>[ruralHouses[i],urbanHouses[i]]).flat().filter(Boolean);let ruralCount=0,urbanCount=0;
 for(const h of ordered){if(result.length>=limit)break;const village=!!rural(h),species=village?(ruralCount++%2?'chicken':'goat'):(urbanCount++%2?'dog':'cat');
  for(const [dx,dz]of [[1.55,1.4],[-1.55,1.4],[1.55,-1.4],[-1.55,-1.4]]){const x=h.x+dx,z=h.z+dz;if(!traversable(world,x,z,.15)||!notRoad(world,x,z))continue;result.push({id:result.length,species,x,z,size:species==='goat'?.16:species==='chicken'?.06:species==='dog'?.11:.07,color:species==='goat'?'#c3b29a':species==='chicken'?'#a16e49':species==='dog'?'#8e775f':'#b5a999'});break}
 }
 return result;
}
export function animalPosition(world:World,a:Animal,time:number){const x=a.x+Math.sin(time*.42+a.id)*.25,z=a.z+Math.cos(time*.31+a.id)*.2;return traversable(world,x,z,.12)&&notRoad(world,x,z)&&clearSegment(world,a,{x,z},.12)?{x,y:sample(world.geo??emptyGeo,x,z).h,z}:{x:a.x,y:sample(world.geo??emptyGeo,a.x,a.z).h,z:a.z}}
