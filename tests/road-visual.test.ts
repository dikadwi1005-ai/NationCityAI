import test from 'node:test';import assert from 'node:assert/strict';
import {BoxGeometry,Matrix4,Vector3} from 'three';
import {conformRoadGeometry} from '../packages/world-engine/road-surface.ts';
test('visual road tiles share terrain elevation at seams and never mutate shared source geometry',()=>{
 const original=new BoxGeometry(2,.06,2),before=Array.from(original.getAttribute('position').array),height=(x:number,z:number)=>.8+x*.1+z*.05;
 const tiles=[{x:0,z:0,angle:0},{x:2,z:0,angle:Math.PI/2}].map(({x,z,angle})=>{const m=new Matrix4().makeRotationY(angle);m.setPosition(x,height(x,z)+.03,z);return {geometry:conformRoadGeometry(original,m,height(x,z),height),matrix:m}});
 try{for(const {geometry,matrix}of tiles){const points=geometry.getAttribute('position');for(let i=0;i<points.count;i++){const p=new Vector3().fromBufferAttribute(points,i).applyMatrix4(matrix);assert.ok(Math.abs(p.y-height(p.x,p.z))<.00001||Math.abs(p.y-height(p.x,p.z)-.06)<.00001)}}assert.deepEqual(Array.from(original.getAttribute('position').array),before)}finally{for(const t of tiles)t.geometry.dispose();original.dispose()}
});
