import test from'node:test';import assert from'node:assert/strict';
import{demoCity}from'../packages/world-engine/demo-city.ts';import{demoPresentation,fixturePlacementConflict}from'../packages/world-engine/demo-presentation.ts';
import{starterWorld,ASSETS}from'../packages/nation-core/world.ts';import{emptyGeo,sample}from'../packages/nation-core/geography.ts';
import{coastalField}from'../packages/world-engine/coastal-field.ts';import{visualHeight}from'../packages/world-engine/visual-terrain.ts';
import{surface,materialResourceCounts,planarUV}from'../packages/world-engine/materials.ts';import{BoxGeometry}from'three';
import{LivingSimulation,buildNetwork,traversable,trafficPoint}from'../packages/world-engine/living-world.ts';
import{VEHICLE_DIMENSIONS}from'../packages/world-engine/vehicle-dimensions.ts';
test('commercial/public fixtures cannot enter the six-asset world and their solids affect local navigation/placement',()=>{
 const original=starterWorld(),before=JSON.stringify(original),demo=demoCity(),p=demoPresentation(demo)!;assert.equal(demoPresentation(original),null);assert.equal(p.districts.length,7);assert.ok(p.buildings.length>=6);
 assert.ok(demo.objects.every(o=>Object.hasOwn(ASSETS,o.asset)));const shop=p.buildings.find(b=>b.kind==='shop')!;
 assert.equal(traversable(demo,shop.x,shop.z),false);assert.equal(fixturePlacementConflict(demo,{...original.objects.find(o=>o.asset==='house')!,x:shop.x,z:shop.z}),true);assert.equal(JSON.stringify(original),before);
});
test('procedural PBR quality has real map differences, shared bounded reuse, and usable batch UVs',()=>{
 const low=surface('#bcbcbc','concrete','low'),medium=surface('#bcbcbc','concrete','medium'),high=surface('#bcbcbc','concrete','high');assert.equal(low.map,null);assert.ok(medium.map);assert.equal(medium.normalMap,null);assert.ok(high.normalMap);const warm=materialResourceCounts();for(let i=0;i<100;i++)assert.equal(surface('#bcbcbc','concrete','high'),high);assert.deepEqual(materialResourceCounts(),warm);
 const geometry=new BoxGeometry(2,2,2),positions=Array.from(geometry.getAttribute('position').array);planarUV(geometry);assert.deepEqual(Array.from(geometry.getAttribute('position').array),positions);assert.equal(geometry.getAttribute('uv1').count,geometry.getAttribute('position').count);geometry.dispose();
});
test('continuous coast filtering and bounded depth field never mutate authoritative geography',()=>{
 const before=JSON.stringify(emptyGeo),field=coastalField(emptyGeo,128);assert.ok(field.w<=130&&field.h<=130);assert.ok(field.data.some((v,i)=>i%4===0&&v>0));assert.ok(field.data.some((v,i)=>i%4===1&&v>0));
 let last=visualHeight(emptyGeo,28,0);for(let x=28.01;x<38;x+=.01){const y=visualHeight(emptyGeo,x,0);assert.ok(Math.abs(y-last)<.1);last=y}assert.equal(JSON.stringify(emptyGeo),before);assert.equal(sample(emptyGeo,8,4).h,.8);
});
test('lane-width transitions are continuous and traffic accelerates within its type-specific limit',()=>{
 let last=trafficPoint({x:0,z:0},{x:2,z:0},{x:-2,z:0},0,.48,.4);for(let i=1;i<=200;i++){const p=trafficPoint({x:0,z:0},{x:2,z:0},{x:-2,z:0},i/200,.48,.4);assert.ok(Math.hypot(p.x-last.x,p.z-last.z)<.04);last=p}
 const sim=new LivingSimulation(buildNetwork(starterWorld()),0,4);for(let i=0;i<1800;i++){const speeds=sim.vehicles.map(v=>v.speed);sim.step(1/30);for(const v of sim.vehicles){assert.ok(v.speed>=0&&v.speed<=VEHICLE_DIMENSIONS[v.id%5].speed+.001);assert.ok(v.speed-speeds[v.id]<=1.3/30+.001)}}assert.ok(sim.vehicles.every(v=>v.distance>3));
});
