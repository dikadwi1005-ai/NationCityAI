import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {chromium} from 'playwright-core';
const dir=await mkdtemp(join(tmpdir(),'nation-visual-')),key=randomUUID();
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','apps/web','-p','0','-H','127.0.0.1'],{env:{...process.env,WORLD_DATA_DIR:dir,ADMIN_KEY:key},stdio:['ignore','pipe','inherit']});
const exited=once(server,'exit');let origin='',output='',browser;
for await(const chunk of server.stdout){output+=chunk;origin=output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0]??'';if(origin&&output.includes('Ready'))break}
assert.ok(origin);await mkdir('docs/phase-5c',{recursive:true});
try{
 browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],warnings=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&/webgl|three|context/i.test(m.text()))warnings.push(m.text())});
 const world=()=>page.request.get(origin+'/api/world').then(r=>r.json());
 async function ready(){await page.getByText('Dunia tersimpan',{exact:true}).waitFor();await page.waitForFunction(()=>typeof window.__nationProject==='function');await page.waitForTimeout(850)}
 const loadStarted=Date.now();await page.goto(origin);await ready();const observedWorldReadyMs=Date.now()-loadStarted;const initial=await world();assert.equal(initial.objects.length,32);
 await page.screenshot({path:'docs/phase-5c/after-overview.png'});
 async function dimensions(w,h){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(900);const bounds=await page.locator('.world-canvas canvas').boundingBox();assert.ok(bounds);assert.equal(bounds.width,w);assert.equal(bounds.height,h);assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),h);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),w)}
 await page.evaluate(()=>document.querySelector('.world-canvas canvas').dataset.identity='persistent');
 assert.equal((await page.request.post(origin+'/api/session',{headers:{Origin:origin},data:{key}})).status(),200);
 await page.reload();await ready();await page.evaluate(()=>document.querySelector('.world-canvas canvas').dataset.identity='persistent');
 for(let i=0;i<4;i++){await page.getByRole('button',{name:'Katalog bangunan',exact:true}).click();await page.getByRole('button',{name:'Tutup panel'}).click()}
 assert.equal(await page.locator('.world-canvas canvas').getAttribute('data-identity'),'persistent');
 await page.getByRole('button',{name:'Katalog bangunan',exact:true}).click();await page.waitForTimeout(600);await page.screenshot({path:'docs/phase-5c/after-catalog.png'});
 await page.getByLabel('Cari bangunan').fill('klinik');assert.equal(await page.locator('.game-asset').count(),1);await page.getByLabel('Cari bangunan').fill('');
 await page.getByRole('button',{name:/Rumah warga/}).click();
 const screen=await page.evaluate(()=>window.__nationProject(18,.85,12));await page.mouse.move(screen.x,screen.y);await page.waitForTimeout(250);await page.screenshot({path:'docs/phase-5c/after-build-mode.png'});
 const previewId=await page.locator('[data-preview-id]').getAttribute('data-preview-id');await page.keyboard.press('r');await page.getByRole('button',{name:'Tempatkan',exact:true}).click();await page.getByText('Tersimpan di server',{exact:true}).waitFor();
 const placed=(await world()).objects.find(o=>!initial.objects.some(v=>v.id===o.id));assert.ok(placed);assert.equal(placed.id,previewId);assert.equal(placed.x,18);assert.equal(placed.z,12);assert.equal(placed.rotation,1);
 await page.keyboard.press('Escape');
 async function select(o){await page.getByRole('button',{name:'Kamera awal',exact:true}).click();await page.waitForTimeout(950);const point=await page.evaluate(({x,z})=>window.__nationProject(x,1.5,z),o);await page.mouse.click(point.x,point.y);await page.locator('[data-object-id="'+o.id+'"]').waitFor()}
 await select(placed);await page.getByRole('button',{name:'Putar',exact:true}).click();await page.getByText('Tersimpan di server',{exact:true}).waitFor();assert.equal((await world()).objects.find(o=>o.id===placed.id).rotation,2);
 await page.getByRole('button',{name:'Pindah',exact:true}).click();const moved=await page.evaluate(()=>window.__nationProject(22,.85,12));await page.mouse.move(moved.x,moved.y);await page.getByRole('button',{name:'Tempatkan',exact:true}).click();await page.getByText('Tersimpan di server',{exact:true}).waitFor();
 await page.reload();await ready();const persistent=(await world()).objects.find(o=>o.id===placed.id);assert.equal(persistent.x,22);assert.equal(persistent.z,12);assert.equal(persistent.rotation,2);
 await select(persistent);await page.getByRole('button',{name:'Fokus bangunan'}).click();await page.waitForTimeout(1000);await page.screenshot({path:'docs/phase-5c/after-house.png'});
 await select(initial.objects.find(o=>o.asset==='hall'));await page.getByRole('button',{name:'Fokus bangunan'}).click();await page.waitForTimeout(1000);await page.screenshot({path:'docs/phase-5c/after-hall.png'});
 await select(initial.objects.find(o=>o.asset==='clinic'));await page.getByRole('button',{name:'Fokus bangunan'}).click();await page.waitForTimeout(1000);await page.screenshot({path:'docs/phase-5c/after-clinic.png'});
 await page.getByRole('button',{name:'Tutup pilihan'}).click();await page.getByRole('button',{name:'Kamera awal',exact:true}).click();await page.waitForTimeout(1000);
 await page.getByRole('button',{name:'Buka atlas negara'}).click();await page.screenshot({path:'docs/phase-5c/after-atlas.png'});await page.getByRole('button',{name:'Tutup panel'}).click();
 const metrics=[];for(let i=0;i<6;i++){await page.waitForTimeout(600);metrics.push(await page.evaluate(()=>({...window.__nationMetrics,heapBytes:performance.memory?.usedJSHeapSize??null})))}
 await dimensions(1440,900);await page.screenshot({path:'docs/phase-5c/after-desktop-1440.png'});await dimensions(768,1024);await page.screenshot({path:'docs/phase-5c/after-tablet.png'});await dimensions(390,844);await page.screenshot({path:'docs/phase-5c/after-mobile.png'});
 await page.getByRole('button',{name:'Katalog bangunan',exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:'docs/phase-5c/after-mobile-catalog.png'});await page.getByRole('button',{name:'Tutup panel'}).click();
 await page.goto(origin+'/pemerintahan');await page.getByRole('heading',{name:'Pemerintahan negara'}).waitFor();await page.setViewportSize({width:1440,height:900});await page.screenshot({path:'docs/phase-5c/after-government.png'});
 assert.deepEqual((await world()).objects.filter(o=>o.id!==placed.id),initial.objects);assert.deepEqual(errors,[]);
 const navigation=await page.evaluate(()=>performance.getEntriesByType('navigation')[0]?.toJSON());
 const report={at:new Date().toISOString(),observedWorldReadyMs,readyTimingIncludes850msCameraSettle:true,navigation,browser:browser.version(),scope:'Production build, isolated SQLite fixture, desktop GPU; mobile viewport emulation only.',fullscreen:[{width:1920,height:1080},{width:1440,height:900},{width:390,height:844}],persistentCanvas:true,placementRotateMoveRefresh:true,original32ObjectsUnchanged:true,errors,warnings,metrics};await writeFile('docs/phase-5c/browser-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',persistentCanvas:true,placementRotateMoveRefresh:true,errors,warnings,metrics}));
}finally{await browser?.close();server.kill();await exited;await rm(dir,{recursive:true,force:true})}
