import test from 'node:test';import assert from 'node:assert/strict';
import {starterWorld} from '../packages/nation-core/world.ts';
import {fingerprint,assertSourceContract} from '../packages/postgres/source-contract.mjs';
test('approved starter contract pins every object coordinate and ID independently of JSON key order',()=>{
 const world={...starterWorld(),geo:{strokes:[]}},contract={format:1,worldId:world.id,revision:0,objectCount:32,worldSha256:fingerprint(world)};
 const archive={rows:{worlds:[{id:world.id,revision:0,state:world}]}};
 assert.doesNotThrow(()=>assertSourceContract(archive,contract));
 assert.equal(fingerprint(Object.fromEntries(Object.entries(world).reverse())),contract.worldSha256);
 const moved=structuredClone(archive);moved.rows.worlds[0].state.objects[0].x+=2;
 assert.throws(()=>assertSourceContract(moved,contract),/Sumber berbeda/);
 const changed=structuredClone(archive);changed.rows.worlds[0].state.objects[0].id='replaced';
 assert.throws(()=>assertSourceContract(changed,contract),/Sumber berbeda/);
});
