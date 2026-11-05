import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {randomUUID} from 'node:crypto';
import {SCENES} from '../packages/nation-sim/atlas.ts';import {regionGeo} from '../packages/nation-sim/regions.ts';import {regionalLayout} from '../packages/nation-sim/layout.ts';import {buildingError,buildingSolid} from '../packages/nation-sim/spatial.ts';import {NationSandboxStore} from '../packages/nation-sim/sandbox-store.ts';
const context=(id:typeof SCENES[number]['id'])=>{const geo=regionGeo(SCENES.find(s=>s.id===id)!);return {scene:id,geo,...regionalLayout(id,geo)}};
test('regional lots reserve real body/road space, reject collision, terrain and illegal height',()=>{
 for(const s of SCENES){const c=context(s.id);assert.ok(c.buildings.length>=3,s.id);assert.ok(c.buildings.some(b=>b.asset===({capital:'palace',province:'governor',metropolis:'mayor',city:'mayor',regency:'regent',subdistrict:'camat',village:'village-hall',coast:'community'}[s.id])),s.id+' government');for(const b of c.buildings){assert.equal(buildingError(b,c),null);assert.ok(buildingSolid(c.buildings,b.x,b.z));assert.ok(buildingError({...b,id:'collision'},c));assert.ok(buildingError({...b,x:10000},c))}}
 const c=context('village'),b=c.buildings[0];assert.match(buildingError({...b,asset:'tower',zone:'business'},c)!,/Ketinggian/);
});
test('sandbox approval, persistent reopen, optimistic concurrency, idempotency, atomic failure and undo',()=>{
 const dir=mkdtempSync(join(tmpdir(),'nation-spatial-')),path=join(dir,'nation-sandbox.sqlite');let db=new NationSandboxStore(path,context);
 try{const before=db.read('capital'),raw={requestId:randomUUID(),expectedRevision:0,target:'sandbox' as const,scene:'capital' as const,action:'apply' as const,approved:true,buildings:before.buildings.slice(1)};
  assert.throws(()=>db.execute(raw,false),/administrator/);assert.throws(()=>db.execute({...raw,target:'permanent' as 'sandbox'},true),/Permanent/);
  const after=db.execute(raw,true);assert.equal(after.revision,1);assert.deepEqual(db.execute(raw,true),after);db.close();db=new NationSandboxStore(path,context);assert.deepEqual(db.read('capital'),after);
  assert.throws(()=>db.execute({...raw,requestId:randomUUID()},true),/revision changed/);
  assert.throws(()=>db.execute({...raw,requestId:randomUUID(),expectedRevision:1,buildings:[{...before.buildings[0],x:10000}]},true));assert.deepEqual(db.read('capital'),after);
  const undone=db.execute({...raw,requestId:randomUUID(),expectedRevision:1,action:'undo'},true);assert.deepEqual(undone.buildings,before.buildings);assert.equal(undone.revision,2);
 }finally{db.close();rmSync(dir,{recursive:true,force:true})}
});
