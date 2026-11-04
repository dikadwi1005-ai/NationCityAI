import {VEHICLE_DIMENSIONS} from './vehicle-dimensions.ts';
import {avenue} from './demo-presentation.ts';
import {demoPresentation} from './demo-presentation.ts';
import {ASSETS,footprint,type World} from '../nation-core/world.ts';
import {emptyGeo,sample,islands} from '../nation-core/geography.ts';

// Pure, bounded, client-only simulation. No store, citizen identity, socket or fetch.
export type Point={x:number;z:number};
export type Node=Point&{id:string;y:number;edges:string[];cost:number};
export type Network={walk:Map<string,Node>;roads:Map<string,Node>;goals:string[];park:Set<string>;seats:Set<string>;world:World;island:string};
export type Density='off'|'low'|'medium'|'high';
export const populations={off:0,low:5,medium:10,high:18};
export const trafficCounts={off:0,low:2,medium:4,high:7};
export function random(seed:number){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
export function seedOf(text:string){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.z-b.z);
export function traversable(world:World,x:number,z:number,radius=.28){
 if(sample(world.geo??emptyGeo,x,z).h<.5)return false;
 if(demoPresentation(world)?.buildings.some(b=>b.kind!=='parking'&&Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius))return false;
 return !world.objects.some(o=>{if(o.asset==='road'||o.asset==='park')return false;const f=footprint(o);return Math.abs(x-o.x)<f.w/2+radius&&Math.abs(z-o.z)<f.d/2+radius});
}
export function clearSegment(world:World,a:Point,b:Point,radius=.28){
 const n=Math.ceil(distance(a,b)/.2);let previous=sample(world.geo??emptyGeo,a.x,a.z).h;
 for(let i=0;i<=n;i++){const t=n?i/n:0,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,h=sample(world.geo??emptyGeo,x,z).h;if(!traversable(world,x,z,radius)||Math.abs(h-previous)>.25)return false;previous=h}return true;
}
export function buildNetwork(world:World,island='island-001'):Network{
 const geo=world.geo??emptyGeo,center=islands(geo).find(i=>i.id===island)??islands(geo)[0],walk=new Map<string,Node>(),roads=new Map<string,Node>(),park=new Set<string>();
 // Fit the developed district, bounded at 77×77. Empty islands retain their center.
 const district=world.objects.filter(o=>sample(geo,o.x,o.z).island===island);
 const xs=district.map(o=>o.x),zs=district.map(o=>o.z);
 const cx=district.length?Math.round((Math.min(...xs)+Math.max(...xs))/2):Math.round(center.x),cz=district.length?Math.round((Math.min(...zs)+Math.max(...zs))/2):Math.round(center.z);
 const radius=district.length?Math.min(38,Math.max(26,Math.ceil(Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))/2)+3)):26;
 const local=district.filter(o=>Math.abs(o.x-cx)<radius+2&&Math.abs(o.z-cz)<radius+2),localRoads=local.filter(o=>o.asset==='road');
 for(let x=cx-radius;x<=cx+radius;x++)for(let z=cz-radius;z<=cz+radius;z++){
  const px=x+.5,pz=z+.5;if(!traversable(world,px,pz))continue;
  const near=localRoads.reduce((d,o)=>Math.min(d,Math.hypot(px-o.x,pz-o.z)),Infinity),onRoad=localRoads.some(o=>Math.abs(px-o.x)<1&&Math.abs(pz-o.z)<1);
  const id=x+':'+z;walk.set(id,{id,x:px,z:pz,y:sample(geo,px,pz).h,edges:[],cost:onRoad?4:near<2.6?.65:1.2});
 }
 for(const n of walk.values())for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const id=(Math.floor(n.x)+dx)+':'+(Math.floor(n.z)+dz),to=walk.get(id);if(to&&clearSegment(world,n,to))n.edges.push(id)}
 const goals:string[]=[],seats=new Set<string>();
 for(const o of local.filter(o=>['house','hall','clinic','park'].includes(o.asset))){const depth=ASSETS[o.asset].depth/2+.8,angle=o.rotation*Math.PI/2,door={x:o.x+Math.sin(angle)*depth,z:o.z+Math.cos(angle)*depth},nearest=[...walk.values()].sort((a,b)=>distance(a,door)-distance(b,door))[0];if(nearest&&distance(nearest,door)<3){goals.push(nearest.id);if(o.asset==='park')park.add(nearest.id)}}
 for(const b of demoPresentation(world)?.buildings??[]){const door={x:b.x,z:b.z+b.d/2+.5},near=[...walk.values()].sort((a,b)=>distance(a,door)-distance(b,door))[0];if(near&&distance(near,door)<2.5)goals.push(near.id)}
 for(const o of local.filter(o=>o.asset==='park')){const angle=o.rotation*Math.PI/2,x=o.x+Math.cos(angle)+.9*Math.sin(angle),z=o.z-Math.sin(angle)+.9*Math.cos(angle),id='seat:'+o.id,point={x,z};const near=[...walk.values()].filter(n=>distance(n,point)<1.2&&clearSegment(world,n,point));if(near.length){walk.set(id,{...point,id,y:sample(geo,x,z).h,edges:near.map(n=>n.id),cost:1});for(const n of near)n.edges.push(id);goals.push(id);seats.add(id)}}
 for(const o of local.filter(o=>o.asset==='road')){
  // Require the entire driving envelope to be dry and free of solid objects.
  if(![[-.9,-.9],[-.9,.9],[.9,-.9],[.9,.9]].every(([x,z])=>traversable(world,o.x+x,o.z+z,.08)))continue;
  roads.set(o.x+':'+o.z,{id:o.x+':'+o.z,x:o.x,z:o.z,y:sample(geo,o.x,o.z).h,edges:[],cost:1});
 }
 for(const n of roads.values())for(const [dx,dz]of [[2,0],[-2,0],[0,2],[0,-2]]){const to=roads.get((n.x+dx)+':'+(n.z+dz));if(to&&clearSegment(world,n,to,.08)&&Math.abs(to.y-n.y)<.7)n.edges.push(to.id)}
 return {walk,roads,goals:[...new Set(goals)],park,seats,world,island};
}
export function route(nodes:Map<string,Node>,start:string,end:string):string[]{
 if(!nodes.has(start)||!nodes.has(end))return [];
 const open=new Set([start]),cost=new Map([[start,0]]),previous=new Map<string,string>();
 while(open.size){let id='',best=Infinity;for(const candidate of open){const score=cost.get(candidate)!+distance(nodes.get(candidate)!,nodes.get(end)!)*.6;if(score<best){id=candidate;best=score}}if(id===end){const result=[id];while(previous.has(id)){id=previous.get(id)!;result.unshift(id)}return result}open.delete(id);
  for(const to of nodes.get(id)!.edges){const score=cost.get(id)!+distance(nodes.get(id)!,nodes.get(to)!)*nodes.get(to)!.cost;if(score<(cost.get(to)??Infinity)){cost.set(to,score);previous.set(to,id);open.add(to)}}
 }return [];
}
export type Walker=Point&{id:number;node:string;path:string[];state:'IDLE'|'WALKING'|'ARRIVING'|'ACTIVITY'|'NEXT_DESTINATION';wait:number;angle:number;gesture:string;visits:number};
export type Vehicle=Point&{id:number;from:string;to:string;previous:string;progress:number;wait:number;angle:number;distance:number;stopped:boolean;parked:boolean;speed:number;braking:boolean};
/** Cubic lane transition with its tangent. Geometry and heading use the same
 * curve; a car no longer snaps to the next cardinal heading at a junction. */
export function trafficPoint(from:Point,to:Point,previous:Point|undefined,t:number,lane=.4,previousLane=lane){
 const dx=(to.x-from.x)/2,dz=(to.z-from.z)/2,ix=previous?(from.x-previous.x)/2:dx,iz=previous?(from.z-previous.z)/2:dz;
 if(t>=.3||!previous||ix===dx&&iz===dz&&previousLane===lane)return {x:from.x+dx*2*t-dz*lane,z:from.z+dz*2*t+dx*lane,angle:Math.atan2(dx,dz)};
 const u=t/.3,v=1-u,s={x:from.x-iz*previousLane,z:from.z+ix*previousLane},e={x:from.x+dx*.6-dz*lane,z:from.z+dz*.6+dx*lane};
 const a={x:s.x+ix*.2,z:s.z+iz*.2},b={x:e.x-dx*.2,z:e.z-dz*.2};
 const x=v*v*v*s.x+3*v*v*u*a.x+3*v*u*u*b.x+u*u*u*e.x,z=v*v*v*s.z+3*v*v*u*a.z+3*v*u*u*b.z+u*u*u*e.z;
 const tx=3*v*v*(a.x-s.x)+6*v*u*(b.x-a.x)+3*u*u*(e.x-b.x),tz=3*v*v*(a.z-s.z)+6*v*u*(b.z-a.z)+3*u*u*(e.z-b.z);
 return {x,z,angle:Math.atan2(tx,tz)};
}
export class LivingSimulation{
 network:Network;walkers:Walker[]=[];vehicles:Vehicle[]=[];random:()=>number;locks=new Map<string,number>();time=0;turns=0;stops=0;
 constructor(network:Network,npc:number,traffic:number){this.network=network;this.random=random(seedOf(network.island));const goals=network.goals;
  const occupied=new Set<string>();for(let i=0;i<npc&&goals.length;i++){const goal=network.walk.get(goals[i%goals.length])!,node=[goal,...goal.edges.map(id=>network.walk.get(id)!)].find(n=>!occupied.has(n.id))??goal;occupied.add(node.id);this.walkers.push({id:i,x:node.x,z:node.z,node:node.id,path:[],state:'IDLE',wait:.25+this.random()*4,angle:this.random()*6.28,gesture:'idle',visits:0})}
  const roads=[...network.roads.values()].filter(n=>n.edges.length);for(let i=0;i<Math.min(traffic,Math.ceil(roads.length/3));i++){const n=roads[Math.floor(i*roads.length/Math.min(traffic,Math.ceil(roads.length/3)))],to=n.edges[i%n.edges.length],b=network.roads.get(to)!,dx=(b.x-n.x)/2,dz=(b.z-n.z)/2,sourceRoad=network.world.objects.find(o=>o.asset==='road'&&o.x===n.x&&o.z===n.z),lane=sourceRoad&&avenue(network.world,sourceRoad)?.48:.4;this.vehicles.push({id:i,x:n.x-dz*lane,z:n.z+dx*lane,from:n.id,to,previous:'',progress:0,wait:this.random()*1.5,angle:Math.atan2(dx,dz),distance:0,stopped:false,parked:false,speed:0,braking:false})}
 }
 step(dt:number){dt=Math.min(.05,Math.max(0,dt));this.time+=dt;const {network:n}=this;
  for(const a of this.walkers){if(a.wait>0){a.wait-=dt;if(a.gesture==='idle')a.angle+=Math.sin(this.time*.9+a.id)*dt*.2;continue}
   if(a.state==='IDLE'||a.state==='NEXT_DESTINATION'){
    const choices=n.goals.filter(g=>g!==a.node),goal=choices[Math.floor(this.random()*choices.length)];a.path=goal?route(n.walk,a.node,goal).slice(1):[];
    a.state=a.path.length?'WALKING':'IDLE';a.gesture='idle';if(!a.path.length)a.wait=2+this.random()*3;continue;
   }
   if(a.state==='ARRIVING'){a.state='ACTIVITY';a.gesture=n.seats.has(a.node)?'sit':n.park.has(a.node)?'wave':this.random()<.5?'wave':'idle';if(a.gesture==='sit'){const o=n.world.objects.find(o=>'seat:'+o.id===a.node)!;a.angle=Math.PI+o.rotation*Math.PI/2}a.wait=2+this.random()*5;continue}
   if(a.state==='ACTIVITY'){a.visits++;a.state='NEXT_DESTINATION';continue}
   const target=n.walk.get(a.path[0]);if(!target){a.state='ARRIVING';continue}const d=distance(a,target),step=(.6+(a.id%3)*.08)*dt;a.angle=Math.atan2(target.x-a.x,target.z-a.z);
   if(d<=step){a.x=target.x;a.z=target.z;a.node=target.id;a.path.shift();if(!a.path.length)a.state='ARRIVING'}else{a.x+=(target.x-a.x)/d*step;a.z+=(target.z-a.z)/d*step}
  }
  for(const a of this.vehicles){
   a.stopped=false;a.braking=false;
   for(const [id,owner]of this.locks)if(owner===a.id&&distance(a,n.roads.get(id)!)>1.35)this.locks.delete(id);
   if(a.wait>0){a.wait-=dt;a.stopped=true;a.braking=true;a.speed=0;continue}a.parked=false;
   const from=n.roads.get(a.from)!,to=n.roads.get(a.to)!,dimension=VEHICLE_DIMENSIONS[a.id%5],dx=(to.x-from.x)/2,dz=(to.z-from.z)/2;
   let target:number=dimension.speed;
   if(to.edges.length>=3){
    const owner=this.locks.get(to.id),occupied=this.vehicles.some(b=>b!==a&&distance(b,to)<1.15);
    if(owner===undefined&&!occupied)this.locks.set(to.id,a.id);
    if(this.locks.get(to.id)!==a.id)target=Math.min(target,Math.max(0,(1-a.progress)*2-1.15)*1.5);
    else target=Math.min(target,Math.sqrt(3*Math.max(.002,(1-a.progress)*2)));
   }
   for(const b of this.vehicles){if(b===a)continue;const forward=(b.x-a.x)*Math.sin(a.angle)+(b.z-a.z)*Math.cos(a.angle),lateral=Math.abs((b.x-a.x)*Math.cos(a.angle)-(b.z-a.z)*Math.sin(a.angle));
    if(forward>0&&lateral<.65&&Math.cos(b.angle-a.angle)>.35){const gap=distance(a,b)-(dimension.length+VEHICLE_DIMENSIONS[b.id%5].length)/2;target=Math.min(target,Math.max(0,gap-.2)*1.5)}
   }
   a.braking=target<a.speed-.02;a.speed+=Math.max(-3.5*dt,Math.min(1.3*dt,target-a.speed));
   if(a.speed<.015){a.stopped=true;this.stops++;continue}
   const step=a.speed*dt,t=Math.min(1,a.progress+step/2),road=n.world.objects.find(o=>o.asset==='road'&&o.x===from.x&&o.z===from.z),prev=n.roads.get(a.previous);
   const lane=road&&avenue(n.world,road)?.48:.4,previousRoad=prev?n.world.objects.find(o=>o.asset==='road'&&o.x===prev.x&&o.z===prev.z):road,previousLane=previousRoad&&avenue(n.world,previousRoad)?.48:.4,point=trafficPoint(from,to,prev,t,lane,previousLane),{x,z}=point;
   if(this.vehicles.some(b=>b!==a&&distance({x,z},b)<(Math.cos(b.angle-a.angle)>.35?(dimension.length+VEHICLE_DIMENSIONS[b.id%5].length)/2+.1:.52)&&((b.x-a.x)*dx+(b.z-a.z)*dz)>0)){a.stopped=true;a.braking=true;a.speed=0;this.stops++;continue}
   a.progress=t;a.distance+=step;a.x=x;a.z=z;a.angle=point.angle;
   if(t>=1){let choices=to.edges.filter(id=>id!==a.from);if(!choices.length)choices=[a.from];const next=choices[Math.floor(this.random()*choices.length)],b=n.roads.get(next)!,angle=Math.atan2(b.x-to.x,b.z-to.z);if(Math.abs(angle-a.angle)>.1)this.turns++;
    a.previous=a.from;a.from=a.to;a.to=next;a.progress=0;a.wait=to.edges.length>2?.65+this.random()*.6:choices[0]===a.previous?1.4:0;
    // A short curbside service stop; parked state remains explicitly simulation-only.
    if((a.id%4===3&&this.random()<.12)||(to.edges.length===1&&a.id%2===0)){a.wait=4+this.random()*3;a.parked=true}else a.parked=false;
   }
  }
 }
}
