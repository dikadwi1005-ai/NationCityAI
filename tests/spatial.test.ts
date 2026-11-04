import test from 'node:test';
import assert from 'node:assert/strict';
import {Land,Spatial} from '../packages/multiplayer/spatial.ts';
import {starterWorld} from '../packages/nation-core/world.ts';
import {appearance,defaults} from '../packages/citizens/model.ts';
test('radius crosses adjacent spatial cells and omits distant avatars',()=>{const s=new Spatial<{x:number;z:number}>();s.add({x:32,z:0});s.add({x:250,z:0});assert.equal(s.near(31,0,5).length,1)});
test('authoritative land permits roads and rejects water and buildings',()=>{const l=new Land(starterWorld()),p=l.spawn('island-001');assert.ok(l.valid(p));assert.equal(l.valid({...p,x:0,z:-4}),false);assert.equal(l.valid({...p,x:1000,z:0}),false);assert.throws(()=>l.spawn('unknown'))});
test('appearance validates allowed presets and strips untrusted identity fields',()=>{assert.throws(()=>appearance({...defaults,eyes:'invalid'}));assert.deepEqual(appearance({...defaults,admin:true}),defaults)});
