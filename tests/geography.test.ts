import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {applyStroke,chunks,emptyGeo,regions,sample,type Stroke} from '../packages/nation-core/geography.ts';
import {applyCommand,starterWorld} from '../packages/nation-core/world.ts';
import {WorldStore} from '../packages/persistence/store.ts';
const island:Stroke={type:'geo',tool:'island',id:randomUUID(),island:'island-001',x:80,z:0,radius:16,strength:4,name:'Sagara',level:1,parent:'nation-001',biome:'grass'};
const stroke=(tool:Stroke['tool'],patch:Partial<Stroke>={}):Stroke=>({...island,id:randomUUID(),island:island.id,tool,radius:5,...patch});
test('pulau baru menjaga setiap sampel pulau awal dan objek lama',()=>{
 const world=starterWorld(),next=applyCommand(world,island);
 assert.deepEqual(next.objects,world.objects);
 for(let x=-48;x<=48;x++)for(let z=-32;z<=32;z++)assert.deepEqual(sample(next.geo!,x,z),sample(emptyGeo,x,z));
 assert.ok(chunks(next.geo!).has('5:0'));assert.ok(chunks(next.geo!).has('4:-1'));
 assert.throws(()=>applyCommand(next,{...island,id:randomUUID()}));
});
test('brush lintas chunk, material, garis pantai dan smoothing deterministik',()=>{
 let g=applyStroke(emptyGeo,island);
 const h=()=>sample(g,80,0).h,initial=h();
 g=applyStroke(g,stroke('raise'));assert.equal(h(),initial+4);
 g=applyStroke(g,stroke('smooth'));assert.ok(h()<initial+4);
 g=applyStroke(g,stroke('lower'));assert.ok(h()<initial);
 g=applyStroke(g,stroke('paint',{biome:'forest'}));assert.equal(sample(g,79,0).biome,'forest');assert.equal(sample(g,80,0).biome,'forest');
 assert.deepEqual(sample(JSON.parse(JSON.stringify(g)),80,0),sample(g,80,0));
 g=applyStroke(g,stroke('water'));assert.ok(h()<0);
 g=applyStroke(g,stroke('expand',{radius:8}));assert.ok(h()>0);
 g=applyStroke(g,stroke('remove'));assert.ok(h()<0);
 assert.throws(()=>applyCommand(starterWorld(),stroke('raise',{island:'island-001',x:0,z:-4})));
});
test('wilayah menolak induk salah, batas keluar induk dan perubahan yang mengeluarkan anak',()=>{
 let g=applyStroke(emptyGeo,island);
 const province=stroke('region',{radius:12}),city=stroke('region',{radius:5,level:2,parent:province.id});
 g=applyStroke(g,province);g=applyStroke(g,city);
 assert.throws(()=>applyStroke(g,{...city,x:92}));
 assert.throws(()=>applyStroke(g,{...province,radius:3}));
 assert.throws(()=>applyStroke(g,{...city,level:4}));
 g=applyStroke(g,{...province,name:'Provinsi Sagara'});assert.equal(regions(g).length,2);assert.equal(regions(g)[0].name,'Provinsi Sagara');
});
test('migrasi SQLite v1 mempertahankan snapshot historis dan rumah 18,12',()=>{
 const dir=mkdtempSync(join(tmpdir(),'nation-upgrade-')),file=join(dir,'world.sqlite');
 let db=new WorldStore(file);
 try{
 const seed=db.read(),house={...seed.objects.find(o=>o.asset==='house')!,id:randomUUID(),x:18,z:12};
 const saved=db.mutate({requestId:randomUUID(),expectedRevision:0,command:{type:'place',object:house}});
 db.db.exec("UPDATE worlds SET state=json_remove(state,'$.geo'); UPDATE world_events SET snapshot=json_remove(snapshot,'$.geo'); DELETE FROM schema_migrations WHERE version=2");
 const old=db.db.prepare('SELECT * FROM world_events WHERE revision=1').get();db.close();db=new WorldStore(file);
 assert.deepEqual(db.read().objects,saved.objects);
 db.mutate({requestId:randomUUID(),expectedRevision:1,command:island});
 assert.deepEqual(db.db.prepare('SELECT * FROM world_events WHERE revision=1').get(),old);
 assert.throws(()=>db.mutate({requestId:randomUUID(),expectedRevision:2,command:{...island,id:randomUUID(),x:0}}));
 assert.equal(db.read().revision,2);
 assert.equal(db.db.prepare("SELECT version FROM terrain_chunks WHERE id='5:0'").get()?.version,2);
 }finally{db.close();rmSync(dir,{recursive:true,force:true})}
});
