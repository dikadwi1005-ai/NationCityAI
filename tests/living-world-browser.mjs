import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';import {once} from 'node:events';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {randomUUID} from 'node:crypto';
import {chromium} from 'playwright-core';
import {traversable} from '../packages/world-engine/living-world.ts';
const dir=await mkdtemp(join(tmpdir(),'nation-living-')),key=randomUUID();
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','apps/web','-p','0','-H','127.0.0.1'],{env:{...process.env,WORLD_DATA_DIR:dir,ADMIN_KEY:key},stdio:['ignore','pipe','inherit']}),exited=once(server,'exit');
let output='',origin='',browser;
for await(const chunk of server.stdout){output+=chunk;origin=output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0]??'';if(origin&&output.includes('Ready'))break}
await mkdir('docs/phase-5c/living-world',{recursive:true});
try{
 browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET')requests.push({path:new URL(r.url()).pathname,method:r.method()})});
 const state=()=>page.evaluate(()=>window.__nationSimulation),world=()=>page.request.get(origin+'/api/world').then(r=>r.json());
 await page.goto(origin);await page.waitForFunction(()=>window.__nationSimulation?.npc.length===5);await page.waitForTimeout(1800);const initial=await world(),first=await state();
 await page.waitForTimeout(3500);const moving=await state();assert.ok(moving.npc.some((p,i)=>Math.hypot(p.x-first.npc[i].x,p.z-first.npc[i].z)>.3));assert.ok(moving.vehicles.some((v,i)=>v.distance>first.vehicles[i].distance+.2));
 await page.getByRole('button',{name:'Pengaturan',exact:true}).click();await page.getByRole('button',{name:'Pause Simulation'}).click();await page.waitForTimeout(100);const paused=await state();await page.waitForTimeout(1100);assert.deepEqual((await state()).npc,paused.npc);assert.deepEqual((await state()).vehicles,paused.vehicles);
 await page.getByRole('button',{name:'Resume Simulation'}).click();await page.getByLabel('Simulation Speed').selectOption('2');await page.waitForTimeout(600);const fast=await state();assert.equal(fast.speed,2);assert.ok(fast.time>paused.time+.8);await page.getByLabel('Simulation Speed').selectOption('1');
 const performance=[];
 for(const density of ['off','low','medium','high']){await page.getByLabel('NPC Population').selectOption(density);await page.getByLabel('Traffic Density').selectOption(density);await page.waitForTimeout(1800);const snapshots=[];for(let i=0;i<3;i++){await page.waitForTimeout(650);snapshots.push(await page.evaluate(()=>window.__nationMetrics))}const s=await state();assert.equal(s.npc.length,{off:0,low:5,medium:10,high:18}[density]);performance.push({density,npc:s.npc.length,vehicles:s.vehicles.length,samples:snapshots});for(const p of s.npc)assert.ok(traversable(initial,p.x,p.z));}
 await page.getByLabel('Show NPC Paths').check();await page.waitForTimeout(700);await page.screenshot({path:'docs/phase-5c/living-world/desktop-controls.png'});await page.getByLabel('Show NPC Paths').uncheck();await page.getByRole('button',{name:'Tutup panel'}).click();
 await page.getByRole('button',{name:'Perbesar',exact:true}).click();await page.waitForTimeout(900);await page.screenshot({path:'docs/phase-5c/living-world/desktop-active.png'});
 // Record the live WebGL game canvas, rather than a generated animation/mockup.
 const recording=await page.evaluate(async()=>{const canvas=document.querySelector('.world-canvas canvas'),stream=canvas.captureStream(15),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:1800000});recorder.ondataavailable=e=>chunks.push(e.data);const done=new Promise(resolve=>recorder.onstop=resolve);recorder.start();await new Promise(resolve=>setTimeout(resolve,6500));recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary)});await writeFile('docs/phase-5c/living-world/living-world.webm',Buffer.from(recording,'base64'));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(900);const mobile=await state();assert.ok(mobile.npc.length<=5&&mobile.vehicles.length<=2);await page.screenshot({path:'docs/phase-5c/living-world/mobile-active.png'});
 assert.deepEqual(await world(),initial);assert.deepEqual(requests,[]); // no movement network writes
 // Real branching roads exist only in this isolated acceptance fixture.
 assert.equal((await page.request.post(origin+'/api/session',{headers:{Origin:origin},data:{key}})).status(),200);
 async function command(command){const w=await world();const response=await page.request.post(origin+'/api/world',{headers:{Origin:origin},data:{requestId:randomUUID(),expectedRevision:w.revision,command}});assert.equal(response.status(),200)}
 await command({type:'remove',id:initial.objects.find(o=>o.asset==='park').id});for(let z=2;z<=10;z+=2)await command({type:'place',object:{...initial.objects.find(o=>o.asset==='road'),id:randomUUID(),x:0,z}});
 await page.setViewportSize({width:1440,height:900});await page.reload();await page.waitForFunction(()=>window.__nationSimulation?.roads===19);await page.getByRole('button',{name:'Pengaturan',exact:true}).click();await page.getByLabel('Traffic Density').selectOption('high');await page.getByLabel('NPC Population').selectOption('medium');await page.getByRole('button',{name:'Tutup panel'}).click();await page.waitForTimeout(12000);const turning=await state();assert.ok(turning.turns>0);assert.ok(turning.vehicles.some(v=>Math.abs(Math.cos(v.angle))>.8));await page.screenshot({path:'docs/phase-5c/living-world/intersection-fixture.png'});
 assert.deepEqual(errors,[]);await writeFile('docs/phase-5c/living-world/browser-verification.json',JSON.stringify({at:new Date().toISOString(),scope:'Production build; isolated SQLite fixtures; native Edge GPU; mobile viewport emulation',browser:browser.version(),motion:true,pauseResume:true,speed:true,noMovementRequests:true,sourceFixtureUnchangedBeforeExplicitRoadCommands:true,branchingFixtureTurns:turning.turns,mobile:{npc:mobile.npc.length,vehicles:mobile.vehicles.length},performance,errors},null,2)+'\n');console.log(JSON.stringify({status:'PASS',motion:true,pauseResume:true,turns:turning.turns,errors,performance:performance.map(p=>({density:p.density,npc:p.npc,vehicles:p.vehicles,fps:p.samples.map(s=>Math.round(s.fps)),drawCalls:p.samples.map(s=>s.drawCalls)}))}));
}finally{await browser?.close();server.kill();await exited;await rm(dir,{recursive:true,force:true})}
