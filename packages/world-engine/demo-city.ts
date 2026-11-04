import {placementError,REGION_ID,type World,type WorldObject,type Asset} from '../nation-core/world.ts';
import type {Stroke} from '../nation-core/geography.ts';

/** In-memory visual fixture. Never import this module into persistence/server code. */
export function demoCity():World {
  let serial=1;
  const id=()=>`de000000-0000-4000-8000-${String(serial++).padStart(12,'0')}`;
  const strokes:Stroke[]=[[-18,-12],[20,-12],[-18,20],[20,20]].map(([x,z])=>({
    type:'geo',id:id(),tool:'expand',island:'island-001',name:'Demo coast',x,z,
    radius:38,strength:1,biome:'grass',level:1,parent:'nation-001',
  }));
  strokes.unshift({type:'geo',id:id(),tool:'lower',island:'island-001',name:'Demo graded district',x:-15,z:-12,radius:12,strength:7,biome:'grass',level:1,parent:'nation-001'});
  const world:World={id:'nation-001',revision:0,terrainVersion:1,geo:{strokes},objects:[]};
  const add=(asset:Asset,x:number,z:number,rotation=0)=>{
    const object:WorldObject={id:id(),asset,x,z,rotation,regionId:REGION_ID,ownerId:'administrator',assetVersion:1};
    if(!placementError(object,world.objects,world.geo))world.objects.push(object);
  };
  // A main avenue, four connected streets and several blocks. Every tile is an
  // ordinary buildable Phase 1 road; intersections are inferred by the renderer.
  for(const z of [-6,6,18])for(let x=-22;x<=34;x+=2)add('road',x,z);
  for(const x of [-12,0,12,24])for(let z=-16;z<=28;z+=2)add('road',x,z);
  for(let z=-4;z<=4;z+=2)add('road',-18,z);
  // A coastal bend and terminating T junction, rather than only a rectangular grid.
  for(let x=0;x<=36;x+=2)add('road',x,28);
  for(let z=18;z<=26;z+=2)add('road',36,z);
  add('hall',6,-12);add('clinic',18,-12);add('clinic',-18,22);
  add('park',6,12);add('park',18,0);add('park',-18,12);
  const lots=[-20,-16,-8,-4,4,8,16,20,28,32];
  for(const z of [-2,2,10,14,22,26])for(const x of lots){
    if(world.objects.some(o=>!['road','house'].includes(o.asset)&&Math.hypot(o.x-x,o.z-z)<4.5))continue;
    add('house',x,z,z===-2||z===10||z===22?2:0);
  }
  for(const x of [-24,-10,2,14,26,38])for(const z of [-18,32])add('tree',x,z);
  return world;
}
