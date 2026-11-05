import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';import {once} from 'node:events';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {randomUUID} from 'node:crypto';
import {chromium} from 'playwright-core';
import {demoCity} from '../packages/world-engine/demo-city.ts';
import {auditSqlite} from '../scripts/audit-sqlite.mjs';

const sourceBefore=auditSqlite('data/nation.sqlite');
const dir=await mkdtemp(join(tmpdir(),'nation-quality-pass2-')),key=randomUUID(),out='docs/phase-5c/pass2';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','apps/web','-p','0','-H','127.0.0.1'],{env:{...process.env,WORLD_DATA_DIR:dir,ADMIN_KEY:key},stdio:['ignore','pipe','inherit']}),exited=once(server,'exit');
let output='',origin='',browser;
for await(const chunk of server.stdout){output+=chunk;origin=output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0]??'';if(origin&&output.includes('Ready'))break}
try{
  await mkdir(out,{recursive:true});browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader']});
  const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],gpuErrors=[],demoApi=[],measurements=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader|geometry/i.test(m.text()))gpuErrors.push(m.text())});
  p.on('request',r=>{if(p.url().includes('/demo-city-legacy')&&new URL(r.url()).pathname.startsWith('/api/'))demoApi.push({url:r.url(),method:r.method()})});
  const ready=async()=>{await p.waitForFunction(()=>window.__nationSimulation&&window.__nationMetrics);await p.waitForTimeout(1100)};
  const snap=name=>p.screenshot({path:out+'/'+name+'.png'});
  async function densityMeasurements(label){
    await p.getByRole('button',{name:'Pengaturan',exact:true}).click();
    for(const density of ['off','low','medium','high']){
      await p.getByLabel('NPC Population').selectOption(density);await p.getByLabel('Traffic Density').selectOption(density);await p.waitForTimeout(1600);
      const samples=[];for(let i=0;i<3;i++){await p.waitForTimeout(600);samples.push(await p.evaluate(()=>window.__nationMetrics))}
      const s=await p.evaluate(()=>window.__nationSimulation);measurements.push({world:label,density,npc:s.npc.length,vehicles:s.vehicles.length,samples});
    }
    await p.getByLabel('NPC Population').selectOption('medium');await p.getByLabel('Traffic Density').selectOption('medium');await p.getByRole('button',{name:'Tutup panel'}).click();
  }
  async function record(name,ms){
  const video=await p.evaluate(async ms=>{
    const stream=document.querySelector('.world-canvas canvas').captureStream(20),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2300000});
    recorder.ondataavailable=e=>chunks.push(e.data);const done=new Promise(resolve=>recorder.onstop=resolve);recorder.start();await new Promise(r=>setTimeout(r,ms));recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());
    const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary);
  },ms);await writeFile(out+'/'+name+'.webm',Buffer.from(video,'base64'));
  }
  await p.goto(origin);await ready();const permanentFixture=await p.request.get(origin+'/api/world').then(r=>r.json());assert.equal(permanentFixture.objects.length,32);
  await snap('harapan-after');await densityMeasurements('starter');await record('harapan',5000);
  const coast=await p.evaluate(()=>window.__nationProject(24,.15,18));await p.mouse.move(coast.x,coast.y);await p.mouse.down();await p.mouse.move(800,500,{steps:14});await p.mouse.up();await p.getByRole('button',{name:'Perbesar',exact:true}).click();await p.getByRole('button',{name:'Perbesar',exact:true}).click();await p.waitForTimeout(1000);await snap('coast-ocean');
  await p.goto(origin+'/demo-city-legacy');await ready();await p.getByRole('heading',{name:'Demo City',exact:true}).waitFor();
  const demo=demoCity();assert.ok(demo.objects.length>200);await snap('demo-overview');await densityMeasurements('demo-city');
  const canvas=await p.locator('.world-canvas canvas').boundingBox();assert.equal(canvas.width,1600);assert.equal(canvas.height,1000);
  async function home(){await p.getByRole('button',{name:'Kamera awal',exact:true}).click();await p.waitForTimeout(1100)}
  async function select(o){await home();const point=await p.evaluate(o=>window.__nationProject(o.x,o.asset==='road'?.88:o.asset==='park'?.94:2,o.z),o);await p.mouse.click(point.x,point.y);await p.locator('[data-object-id="'+o.id+'"]').waitFor()}
  async function focus(o,name){await select(o);await p.getByRole('button',{name:'Fokus bangunan'}).click();await p.waitForTimeout(1000);await snap(name);await p.getByRole('button',{name:'Tutup pilihan'}).click()}
  await focus(demo.objects.find(o=>o.asset==='house'&&o.x===4&&o.z===2),'house-close');
  await focus(demo.objects.find(o=>o.asset==='hall'),'hall-close');
  await focus(demo.objects.find(o=>o.asset==='clinic'&&o.x===18),'clinic-close');
  await focus(demo.objects.find(o=>o.asset==='road'&&o.x===12&&o.z===6),'roads-intersections');
  await focus(demo.objects.find(o=>o.asset==='park'&&o.x===6),'neighborhood-activity');
  await home();await p.getByRole('button',{name:'Perbesar',exact:true}).click();await p.waitForTimeout(900);await snap('demo-neighborhood');
  const first=await p.evaluate(()=>window.__nationSimulation);await p.waitForTimeout(2500);const next=await p.evaluate(()=>window.__nationSimulation);
  assert.ok(next.npc.some((n,i)=>Math.hypot(n.x-first.npc[i].x,n.z-first.npc[i].z)>.1));assert.ok(next.vehicles.some((v,i)=>v.distance>first.vehicles[i].distance));
  await record('demo-city',7000);
  // Build on the demo only, then reload: edits disappear and no server API ran.
  await home();await p.getByRole('button',{name:'Katalog bangunan',exact:true}).click();await p.getByRole('button',{name:/Rumah warga/}).click();
  const free=await p.evaluate(()=>window.__nationProject(28,.85,-12));await p.mouse.move(free.x,free.y);await p.getByRole('button',{name:'Tempatkan',exact:true}).click();await p.getByText('Demo diperbarui · hanya di memori',{exact:true}).waitFor();
  await p.reload();await ready();assert.ok((await p.locator('.world-title').innerText()).includes(demo.objects.length+' objek'));assert.deepEqual(demoApi,[]);
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(1200);await snap('demo-mobile');const mobile=await p.evaluate(()=>({...window.__nationMetrics,npc:window.__nationSimulation.npc.length,vehicles:window.__nationSimulation.vehicles.length}));
  assert.ok(mobile.npc<=5&&mobile.vehicles<=2);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),390);
  await p.getByRole('link',{name:'Kembali ke dunia permanen ↗'}).click();await ready();assert.equal(await p.locator('main').getAttribute('data-world-source'),'permanent');assert.deepEqual(await p.request.get(origin+'/api/world').then(r=>r.json()),permanentFixture);
  assert.deepEqual(errors,[]);assert.deepEqual(gpuErrors,[]);assert.deepEqual(auditSqlite('data/nation.sqlite').signatures,sourceBefore.signatures);
  const report={at:new Date().toISOString(),browser:browser.version(),scope:'Production build, isolated starter fixture and pure in-memory Demo City, native AMD desktop GPU; mobile viewport emulation.',demoObjects:demo.objects.length,assetCounts:Object.fromEntries(['road','house','hall','clinic','park','tree'].map(a=>[a,demo.objects.filter(o=>o.asset===a).length])),zeroDemoApiRequests:true,localDemoPlacementResetOnReload:true,returnToPermanent:true,source25TablesUnchanged:true,cameraAndBatchedPicking:true,npcVehicleMotion:true,errors,gpuErrors,measurements,mobile};
  await writeFile(out+'/verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',demoObjects:demo.objects.length,errors,gpuErrors,measurements:measurements.map(m=>({world:m.world,density:m.density,npc:m.npc,vehicles:m.vehicles,fps:m.samples.map(s=>Math.round(s.fps)),drawCalls:m.samples.map(s=>s.drawCalls)})),mobile}));
}finally{await browser?.close();server.kill();await exited;await rm(dir,{recursive:true,force:true})}
