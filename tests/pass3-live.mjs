// Read-only evidence from the actual permanent runtime, never an initialized fixture.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
import {auditSqlite} from '../scripts/audit-sqlite.mjs';
const source='data/nation.sqlite',origin='http://localhost:3000',before=auditSqlite(source);
const initial=JSON.parse(await readFile('data/pass3-before.private.json','utf8'));
assert.deepEqual(before.signatures,initial.signatures);
const db=new DatabaseSync(source,{readOnly:true});let expected;
try{expected=JSON.parse(db.prepare('SELECT state FROM worlds').get().state)}finally{db.close()}
const browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],demoApi=[],measurements=[];
 async function benchmark(world){
  await page.getByRole('button',{name:'Pengaturan',exact:true}).click();
  await page.getByLabel('NPC Population').selectOption('medium');await page.getByLabel('Traffic Density').selectOption('medium');await page.getByRole('button',{name:'City Overview',exact:true}).click();
  for(const quality of ['low','medium','high']){await page.getByLabel('Kualitas visual',{exact:true}).selectOption(quality);await page.waitForTimeout(3000);const samples=[];for(let i=0;i<3;i++){await page.waitForTimeout(1000);samples.push(await page.evaluate(()=>window.__nationMetrics))}const state=await page.evaluate(()=>window.__nationSimulation);measurements.push({world,quality,npc:state.npc.length,vehicles:state.vehicles.length,samples})}
  await page.getByLabel('Kualitas visual',{exact:true}).selectOption('medium');await page.getByRole('button',{name:'Tutup panel',exact:true}).click();
 }
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(page.url().includes('/demo-city')&&new URL(r.url()).pathname.startsWith('/api/'))demoApi.push(r.url())});
 await page.goto(origin);await page.waitForFunction(()=>window.__nationMetrics&&window.__nationSimulation);await page.waitForTimeout(1800);
 assert.deepEqual(await page.request.get(origin+'/api/world').then(r=>r.json()),expected);
 assert.equal(expected.objects.length,32);assert.equal(expected.revision,0);
 await page.screenshot({path:'docs/phase-5c/pass3/harapan-live.png'});
 const metrics=await page.evaluate(()=>window.__nationMetrics);
 await benchmark('permanent');
 await page.goto(origin+'/demo-city');await page.waitForFunction(()=>window.__nationMetrics&&window.__nationSimulation?.npc.length);await page.waitForTimeout(1200);
 assert.equal(await page.locator('main').getAttribute('data-world-source'),'demo');await benchmark('demo');assert.deepEqual(demoApi,[]);
 await page.getByRole('link',{name:'Kembali ke dunia permanen ↗'}).click();await page.waitForFunction(()=>window.__nationMetrics&&window.__nationSimulation);
 assert.deepEqual(await page.request.get(origin+'/api/world').then(r=>r.json()),expected);
 const after=auditSqlite(source);assert.deepEqual(after.signatures,initial.signatures);assert.deepEqual(errors,[]);
 await writeFile('docs/phase-5c/pass3/live-verification.json',JSON.stringify({at:new Date().toISOString(),origin,scope:'Actual existing permanent SQLite runtime, read-only; not fixture initialization. Same City Overview, 1600x1000, 10 NPC / 4 vehicles, three samples per quality.',objects:32,revision:0,tables:25,allTableSignaturesUnchanged:true,apiMatchesPermanentDatabase:true,demoApiRequests:demoApi,returnToPermanent:true,metrics,measurements,errors},null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',actualPermanent:true,tables:25,objects:32,revision:0,measurements:measurements.map(m=>({world:m.world,quality:m.quality,fps:m.samples.map(s=>Math.round(s.fps)),drawCalls:m.samples.map(s=>s.drawCalls)})),errors}));
}finally{await browser.close()}
