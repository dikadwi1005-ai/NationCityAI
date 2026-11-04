import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {chromium} from 'playwright-core';
import {WorldStore} from '../packages/persistence/store.ts';
const dir=await mkdtemp(join(tmpdir(),'nation-citizens-')),db=new WorldStore(join(dir,'nation.sqlite'));
const island=randomUUID();
const before=db.mutate({requestId:randomUUID(),expectedRevision:0,command:{id:island,name:'Pulau Sagara',x:72,z:0,tool:'island',island:'island-001',radius:16,strength:3,level:1,parent:'nation-001',type:'geo',biome:'grass'}});
async function port(){const net=createServer();net.listen(0,'127.0.0.1');await once(net,'listening');const p=net.address().port;await new Promise(r=>net.close(r));return p}
const mp=await port(),web=await port(),origin='http://127.0.0.1:'+web;
const env={...process.env,MULTIPLAYER_PORT:String(mp),WORLD_DATA_DIR:dir,ADMIN_KEY:randomUUID()};
function service(args,marker){const p=spawn(process.execPath,args,{env,stdio:['ignore','pipe','pipe']});p.stderr.on('data',s=>process.stderr.write(s));const exit=once(p,'exit');const ready=new Promise((resolve,reject)=>{p.stdout.on('data',b=>{if(String(b).includes(marker))resolve()});exit.then(()=>reject(Error('Service exited before ready')))});return {p,exit,ready}}
const start=()=>service(['apps/multiplayer-server/server.mjs'],'Nation multiplayer ready');let game=start();
const next=service(['node_modules/next/dist/bin/next','start','apps/web','-H','127.0.0.1','-p',String(web)],'Ready');
let browser;
try{
 await Promise.all([game.ready,next.ready]);browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 const errors=[];
 async function player(login,name){const ctx=await browser.newContext({viewport:{width:1024,height:760}}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/warga');
 await p.getByLabel('Username').fill(login);await p.getByLabel('Kata sandi').fill('sandbox-pass-123');await p.getByRole('button',{name:'Daftar warga'}).click();
 await p.getByLabel('Nama karakter').fill(name);await p.getByLabel('Rambut',{exact:true}).selectOption('kuncir');if(login==='warga_b')await p.getByLabel('Tampilkan nama ke pemain sekitar').uncheck();await p.getByRole('button',{name:'Simpan karakter'}).click();await p.getByRole('heading',{name}).waitFor();
 const get=()=>p.request.get(origin+'/api/citizen').then(r=>r.json()),profile=await get();
 await p.reload();await p.getByRole('heading',{name}).waitFor();assert.deepEqual((await get()).look,profile.look);
 await p.getByRole('button',{name:'Jelajahi Negara'}).click();await p.locator('[data-player="'+profile.id+'"]').waitFor();return {p,profile,get,ctx}}
 const a=await player('warga_a','Aruna'),b=await player('warga_b','Bima');
 assert.notEqual(a.profile.id,b.profile.id);
 const aa=a.p.locator('[data-player="'+a.profile.id+'"]'),ba=b.p.locator('[data-player="'+a.profile.id+'"]');
 await ba.waitFor();await a.p.locator('[data-player="'+b.profile.id+'"]').waitFor();
 assert.ok(!(await a.p.locator('[data-player="'+b.profile.id+'"]').innerText()).includes('Bima'));
 await a.p.keyboard.down('w');await b.p.waitForFunction(id=>Number(document.querySelector('[data-player="'+id+'"]')?.getAttribute('data-z'))<-.5,a.profile.id);
 await a.p.waitForTimeout(1200);await a.p.keyboard.up('w');const stopped=Number(await aa.getAttribute('data-z'));assert.ok(stopped>=-1.7&&stopped<-.5,'Balai negara blocks northbound movement: '+stopped);
 await b.p.keyboard.down('d');
 try{await a.p.waitForFunction(id=>Number(document.querySelector('[data-player="'+id+'"]')?.getAttribute('data-x'))>3,b.profile.id)}finally{await b.p.keyboard.up('d')}
 await b.p.screenshot({path:'docs/phase-3-multiplayer.png'});
 await a.p.getByLabel('Tujuan perjalanan').selectOption(island);
 await b.p.waitForFunction(id=>Number(document.querySelector('[data-player="'+id+'"]')?.getAttribute('data-x'))>60,a.profile.id);

 await game.p.kill();await game.exit;game=start();await game.ready;
 await a.p.getByText('Terhubung',{exact:true}).waitFor();await a.p.waitForFunction(id=>document.querySelector('select')?.value===id,island);
 await ba.waitFor();await a.p.getByRole('button',{name:'Profil Warga'}).click();await a.p.getByRole('button',{name:'Keluar warga'}).click();
 await a.p.getByLabel('Username').fill('warga_a');await a.p.getByLabel('Kata sandi').fill('sandbox-pass-123');await a.p.getByRole('button',{name:'Masuk warga'}).click();await a.p.getByRole('heading',{name:'Aruna'}).waitFor();
 const restored=await a.get();assert.equal(restored.id,a.profile.id);assert.deepEqual(restored.look,a.profile.look);assert.equal(restored.location.island,island);
 const denied=await a.p.request.post(origin+'/api/world',{headers:{Origin:origin},data:{}});assert.equal(denied.status(),403);assert.deepEqual(db.read(),before);assert.deepEqual(errors,[]);
 console.log('PASS two citizen accounts, edited 3D characters, refresh, peer movement, collision at z='+stopped+', Sagara, reconnect, logout/login, admin denial, unchanged world.');
}finally{await browser?.close();game.p.kill();next.p.kill();await Promise.all([next.exit,game.exit]);db.close();await rm(dir,{recursive:true,force:true})}
