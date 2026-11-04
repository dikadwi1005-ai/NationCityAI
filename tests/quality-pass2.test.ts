import test from 'node:test';import assert from 'node:assert/strict';
import {demoCity} from '../packages/world-engine/demo-city.ts';
import {starterWorld,placementError} from '../packages/nation-core/world.ts';
import {emptyGeo,sample} from '../packages/nation-core/geography.ts';
import {visualHeight} from '../packages/world-engine/visual-terrain.ts';
import {trafficPoint,buildNetwork,LivingSimulation} from '../packages/world-engine/living-world.ts';

test('Demo City is a deterministic valid fixture with blocks, T/four-way junctions, and no mutation of the starter',()=>{
  const source=starterWorld(),before=JSON.stringify(source),world=demoCity();assert.deepEqual(world,demoCity());
  assert.ok(world.objects.filter(o=>o.asset==='house').length>=40);
  for(const o of world.objects)assert.equal(placementError(o,world.objects,world.geo),null,o.id);
  const roads=buildNetwork(world).roads;assert.ok([...roads.values()].some(n=>n.edges.length===4));assert.ok([...roads.values()].some(n=>n.edges.length===3));
  assert.equal(JSON.stringify(source),before);assert.equal(source.objects.length,32);assert.equal(source.revision,0);
});
test('visual coast filtering preserves inland height and leaves every authoritative sample unchanged',()=>{
  const points=[[0,0],[-15,-12],[34,0],[32,3],[8,4]],before=points.map(([x,z])=>sample(emptyGeo,x,z));
  for(const [x,z]of points){const a=visualHeight(emptyGeo,x,z);assert.ok(Number.isFinite(a));assert.equal(visualHeight(emptyGeo,x,z),a)}
  assert.deepEqual(points.map(([x,z])=>sample(emptyGeo,x,z)),before);assert.equal(visualHeight(emptyGeo,8,4),sample(emptyGeo,8,4).h);
});
test('road-turn positions and tangent heading join continuously inside real road tiles',()=>{
  const from={x:0,z:0},to={x:2,z:0},prev={x:0,z:2};let last=trafficPoint(from,to,prev,0),curved=false;
  for(let i=1;i<=200;i++){const p=trafficPoint(from,to,prev,i/200);assert.ok(Math.hypot(p.x-last.x,p.z-last.z)<.04);if(Math.abs(Math.sin(p.angle))>.1&&Math.abs(Math.cos(p.angle))>.1)curved=true;assert.ok(p.x>=-1&&p.x<=3&&p.z>=-1&&p.z<=1);last=p}
  assert.ok(curved);assert.ok(Math.abs(last.angle-Math.PI/2)<.001);
  const sim=new LivingSimulation(buildNetwork(demoCity()),10,4);for(let i=0;i<600;i++)sim.step(1/30);assert.ok(sim.vehicles.some(v=>v.distance>3));
});
