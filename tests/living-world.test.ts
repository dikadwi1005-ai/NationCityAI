import test from 'node:test';
import assert from 'node:assert/strict';
import {starterWorld,type World} from '../packages/nation-core/world.ts';
import {sample,emptyGeo} from '../packages/nation-core/geography.ts';
import {buildNetwork,clearSegment,LivingSimulation,route,traversable} from '../packages/world-engine/living-world.ts';

test('seeded pedestrians travel between destinations without crossing solids, water or changing the world',()=>{
 const world=starterWorld(),before=JSON.stringify(world),network=buildNetwork(world),a=new LivingSimulation(network,10,4),b=new LivingSimulation(network,10,4);let moving=0,activity=0,sitting=0;
 for(let i=0;i<18000;i++){a.step(1/30);b.step(1/30);for(const p of a.walkers){assert.ok(traversable(world,p.x,p.z));assert.ok(sample(emptyGeo,p.x,p.z).h>=.5);if(p.state==='WALKING')moving++;if(p.state==='ACTIVITY')activity++;if(p.gesture==='sit')sitting++}}
 assert.deepEqual(a.walkers,b.walkers);assert.ok(moving>100);assert.ok(activity>0);assert.ok(sitting>0);assert.ok(a.walkers.some(p=>p.visits>0));assert.equal(JSON.stringify(world),before);
});
test('all pedestrian edges sample the full segment; disconnected destinations have no fake straight route',()=>{
 const n=buildNetwork(starterWorld());for(const p of n.walk.values())for(const id of p.edges)assert.ok(clearSegment(n.world,p,n.walk.get(id)!));assert.deepEqual(route(n.walk,'absent','also-absent'),[]);
});
test('traffic turns on real branching road tiles and remains in dry road envelopes',()=>{
 const world=starterWorld();world.objects=world.objects.filter(o=>!['hall','clinic','park','tree','house'].includes(o.asset));for(let z=-8;z<=8;z+=2)if(z)world.objects.push({...world.objects[0],id:'road-z-'+z,x:0,z});
 const sim=new LivingSimulation(buildNetwork(world),0,5);for(let i=0;i<2700;i++){sim.step(1/30);for(const v of sim.vehicles){assert.ok(world.objects.some(o=>o.asset==='road'&&Math.abs(v.x-o.x)<=1&&Math.abs(v.z-o.z)<=1));assert.ok(traversable(world,v.x,v.z,.08))}}
 assert.ok(sim.turns>3);assert.ok(sim.vehicles.every(v=>v.distance>2));assert.ok(sim.stops>0);
});
test('removed roads and a new building rebuild visual routing; empty islands never invent a road',()=>{
 const world=starterWorld(),before=JSON.stringify(world),n=buildNetwork(world);assert.equal(n.roads.size,14);
 const changed:World={...world,objects:world.objects.filter(o=>!(o.asset==='road'&&o.x===0))};assert.ok(!buildNetwork(changed).roads.has('0:0'));assert.equal(JSON.stringify(world),before);
 assert.equal(buildNetwork({...world,objects:[]},'nonexistent').roads.size,0);
 const blocking={...world.objects.find(o=>o.asset==='hall')!,x:0,z:0};const b=buildNetwork({...world,objects:[...world.objects,blocking]});assert.ok(!b.roads.has('0:0'));assert.ok(!b.walk.has('0:0'));
});
