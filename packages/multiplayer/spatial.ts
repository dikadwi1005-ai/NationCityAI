import {footprint,type World,type WorldObject} from '../nation-core/world.ts';
import {emptyGeo,islands,sample} from '../nation-core/geography.ts';
import type {Position} from '../citizens/model.ts';
export const cell=(n:number)=>Math.floor(n/32);
export class Spatial<T extends {x:number;z:number}>{
 buckets=new Map<string,T[]>();
 add(p:T){const key=cell(p.x)+':'+cell(p.z);const bucket=this.buckets.get(key);if(bucket)bucket.push(p);else this.buckets.set(key,[p])}
 near(x:number,z:number,r:number){const result:T[]=[];for(let a=cell(x-r);a<=cell(x+r);a++)for(let b=cell(z-r);b<=cell(z+r);b++)for(const p of this.buckets.get(a+':'+b)??[])if(Math.hypot(x-p.x,z-p.z)<=r)result.push(p);return result}
}
export class Land{
 world:World;objects=new Spatial<WorldObject>();
 constructor(world:World){this.world=world;for(const o of world.objects)this.objects.add(o)}
 sample(x:number,z:number){return sample(this.world.geo??emptyGeo,x,z)}
 valid(p:Position){const ground=this.sample(p.x,p.z);return ground.island===p.island&&ground.h>=.45&&!this.objects.near(p.x,p.z,5).some(o=>{
 if(o.asset==='road'||o.asset==='park')return false;const {w,d}=footprint(o);return Math.abs(o.x-p.x)<w/2+.32&&Math.abs(o.z-p.z)<d/2+.32})}
 spawn(id:string){const i=islands(this.world.geo??emptyGeo).find(i=>i.id===id);if(!i)throw Error('Pulau tidak tersedia.');
 for(let radius=0;radius<=i.radius+4;radius++)for(let d=0;d<Math.max(1,radius*8);d++){const angle=2*Math.PI*d/Math.max(1,radius*8),p={x:i.x+Math.round(radius*Math.cos(angle)),z:i.z+Math.round(radius*Math.sin(angle)),island:id};if(this.valid(p))return p}
 throw Error('Tidak ada titik kedatangan yang aman.')}
 area(p:Position){const strokes=this.world.geo?.strokes??[];const ids=new Set<string>([p.island]);for(const s of strokes)if(Math.hypot(p.x-s.x,p.z-s.z)<128+s.radius)ids.add(s.tool==='island'?s.id:s.island);
 return {...this.world,objects:this.objects.near(p.x,p.z,128),geo:{strokes:strokes.filter(s=>ids.has(s.tool==='island'?s.id:s.island))}}}
}
