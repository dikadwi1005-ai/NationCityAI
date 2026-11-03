import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {chromium} from 'playwright-core';
import {Client} from 'colyseus.js';
import {WorldStore} from '../packages/persistence/store.ts';
const dir=await mkdtemp(join(tmpdir(),'chat-qa-')),db=new WorldStore(join(dir,'nation.sqlite')),island=randomUUID();
function terrain(tool,x,radius,extra={}){db.mutate({requestId:randomUUID(),expectedRevision:db.read().revision,command:{id:randomUUID(),name:'Test',x,z:0,tool,island:'island-001',radius,strength:3,level:1,parent:'nation-001',type:'geo',biome:'grass',...extra}})}
terrain('island',499,16,{id:island,name:'Pulau Sagara'});for(const x of [40,75,110,145])terrain('expand',x,28);terrain('region',-1,8,{name:'Barat'});terrain('region',29,8,{name:'Timur'});
const before=db.read();
async function port(){const n=createServer();n.listen(0,'127.0.0.1');await once(n,'listening');const p=n.address().port;await new Promise(r=>n.close(r));return p}
const mp=await port(),web=await port(),origin='http://127.0.0.1:'+web,env={...process.env,MULTIPLAYER_PORT:String(mp),WORLD_DATA_DIR:dir,ADMIN_KEY:randomUUID(),CHAT_RADIUS:'120'};
function service(args,marker){const p=spawn(process.execPath,args,{env,stdio:['ignore','pipe','pipe']});p.stderr.on('data',s=>process.stderr.write(s));const exit=once(p,'exit'),ready=new Promise((r,j)=>{p.stdout.on('data',b=>{if(String(b).includes(marker))r()});exit.then(()=>j(Error('Service stopped')))});return {p,exit,ready}}
const start=()=>service(['apps/multiplayer-server/server.mjs'],'Nation multiplayer ready');let game=start();const next=service(['node_modules/next/dist/bin/next','start','apps/web','-H','127.0.0.1','-p',String(web)],'Ready');
let browser;const errors=[];
try{
 await Promise.all([next.ready,game.ready]);browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 async function enter(name,x,i){const ctx=await browser.newContext({viewport:{width:960,height:720}}),p=await ctx.newPage(),frames=[];p.on('pageerror',e=>errors.push(e.message));p.on('websocket',ws=>ws.on('framereceived',f=>{if(Buffer.from(f.payload).includes(Buffer.from('chatMessage')))frames.push(Buffer.from(f.payload))}));
 const post=(path,data)=>ctx.request.post(origin+path,{headers:{Origin:origin},data});
 const reg=await post('/api/citizen',{action:'register',login:name,password:'sandbox-pass-123'});assert.equal(reg.status(),200);const {id}=await reg.json();const {defaults}=await import('../packages/citizens/model.ts');assert.equal((await post('/api/citizen',{action:'save',look:{...defaults,name}})).status(),200);
 db.db.prepare('UPDATE citizens SET location=? WHERE id=?').run(JSON.stringify({x,z:0,island:i}),id);
 await p.goto(origin+'/warga');await p.getByRole('button',{name:'Jelajahi Negara'}).click();await p.locator('[data-player="'+id+'"]').waitFor();
 return {p,ctx,id,post,frames,received:t=>frames.filter(f=>f.includes(Buffer.from(t))).length}}
 const a=await enter('Aruna',-1,'island-001'),b=await enter('Bima',29,'island-001'),c=await enter('Citra',499,island);
 async function send(p,t){await p.getByLabel('Pesan lokal').fill(t);await p.getByRole('button',{name:'Kirim',exact:true}).click()}
 const far='Sinyal dari balai',near='Selamat datang Citra',leave='Percakapan setelah Bima pergi';
 const t=performance.now();await send(a.p,far);await b.p.getByText(far,{exact:true}).waitFor();assert.equal(c.received(far),0);assert.equal(b.received(far),1);console.log('Nearby measured UI roundtrip ms',Math.round(performance.now()-t),'message frame bytes',b.frames.at(-1).length);
 await c.p.getByLabel('Tujuan perjalanan').selectOption('island-001');await c.p.getByLabel('Pesan lokal').waitFor();assert.equal(c.received(far),0);
 await send(a.p,near);await c.p.getByText(near,{exact:true}).waitFor();
 await b.p.getByText(near,{exact:true}).waitFor();await b.p.keyboard.down('Shift');await b.p.keyboard.down('d');
 try{await b.p.waitForFunction(id=>Number(document.querySelector('[data-player="'+id+'"]')?.getAttribute('data-x'))>122,b.id,{timeout:60000})}finally{await b.p.keyboard.up('d');await b.p.keyboard.up('Shift')}
 await b.p.getByText('Tidak ada warga di sekitar').waitFor();assert.equal(await b.p.getByText(near,{exact:true}).count(),0);
 await send(a.p,leave);await c.p.getByText(leave,{exact:true}).waitFor();assert.equal(b.received(leave),0);
 await b.p.getByLabel('Tujuan perjalanan').selectOption(island);
 await c.p.getByRole('button',{name:'Laporkan pesan'}).last().click();await c.p.getByText('Laporan dikirim kepada moderator.').waitFor();
 const admin=await browser.newContext(),mod=await admin.newPage();
 assert.equal((await c.post('/api/moderation',{id:'1',action:'chat'})).status(),403);
 assert.equal((await admin.request.post(origin+'/api/session',{headers:{Origin:origin},data:{key:env.ADMIN_KEY}})).status(),200);
 await mod.goto(origin+'/moderasi');await mod.getByText(leave,{exact:true}).waitFor();
 await c.p.getByText('Keamanan percakapan').click();await c.p.getByRole('button',{name:'Blokir',exact:true}).click();await a.p.getByText('Tidak ada warga di sekitar').waitFor();await c.p.getByRole('button',{name:/Pulihkan blokir/}).click();
 await b.p.getByLabel('Tujuan perjalanan').selectOption('island-001');await b.p.getByLabel('Pesan lokal').waitFor();
 const safety=c.p.locator('.spatial-chat details');if(!(await safety.evaluate(el=>el.open)))await safety.locator('summary').click();
 const target=c.p.locator('.spatial-chat details div').filter({hasText:'Aruna'});
 await target.getByRole('button',{name:'Bisukan'}).click();await c.p.getByRole('button',{name:/Pulihkan suara/}).waitFor();
 const muted='Penerima bisu';await send(a.p,muted);await b.p.getByText(muted,{exact:true}).waitFor();assert.equal(c.received(muted),0);
 await c.p.getByRole('button',{name:/Pulihkan suara/}).click();
 await target.getByRole('button',{name:'Blokir'}).click();await c.p.getByRole('button',{name:/Pulihkan blokir/}).waitFor();
 const blocked='Penerima terblokir';await send(a.p,blocked);await b.p.getByText(blocked,{exact:true}).waitFor();assert.equal(c.received(blocked),0);
 await c.p.getByRole('button',{name:/Pulihkan blokir/}).click();await b.p.waitForTimeout(1300);await b.p.getByLabel('Tujuan perjalanan').selectOption(island);await b.p.getByText('Tidak ada warga di sekitar').waitFor();
 const html='<script>window.chatAttack=true</script>';await send(a.p,html);await c.p.getByText(html,{exact:true}).waitFor();assert.equal(await c.p.evaluate(()=>window.chatAttack),undefined);
 await game.p.kill();await game.exit;game=start();await game.ready;await a.p.getByLabel('Pesan lokal').waitFor();await c.p.getByLabel('Pesan lokal').waitFor();
 const after='Koneksi baru';await send(a.p,after);await c.p.getByText(after,{exact:true}).waitFor();assert.equal(c.received(after),1);assert.equal(b.received(after),0);assert.equal(await c.p.getByText(html,{exact:true}).count(),0);
 await c.p.screenshot({path:'docs/phase-4-chat.png'});
 const client=new Client('ws://127.0.0.1:'+mp);await assert.rejects(()=>client.joinOrCreate('nation',{ticket:'invalid'}));
 const ticket=await (await a.post('/api/citizen',{action:'ticket'})).json();const raw=await client.joinOrCreate('nation',{ticket:ticket.ticket});
 raw.onMessage('*',()=>{});let response;raw.onMessage('chatNotice',s=>response?.(s));
 async function rejected(payload){const result=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('missing denial')),5000);response=v=>{clearTimeout(timer);resolve(v)}});raw.send('chatSend',payload);return result}
 for(const invalid of [{sender:c.id},{x:0,z:0},{text:'y'.repeat(281)}]){const marker='Spoof payload';await rejected({requestId:randomUUID(),text:marker,...invalid});assert.equal(c.received(marker),0)}
 const replay={requestId:randomUUID(),text:'Pengiriman sekali'};raw.send('chatSend',replay);await c.p.getByText(replay.text,{exact:true}).waitFor();assert.match(await rejected(replay),/duplikat/);
 const flood=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('missing throttle')),5000);response=v=>{clearTimeout(timer);resolve(v)};for(let i=0;i<6;i++)raw.send('chatSend',{requestId:randomUUID(),text:'Uji laju '+i})});assert.match(flood,/Terlalu cepat/);assert.equal(c.received('Uji laju 5'),0);
 await mod.getByRole('button',{name:'Batasi chat 1 jam'}).click();await mod.getByText('Laporan terbuka (0)').waitFor();assert.match(await rejected({requestId:randomUUID(),text:'Tes sanksi'}),/dibatasi/);assert.equal(c.received('Tes sanksi'),0);await raw.leave();
 assert.deepEqual(db.read(),before);assert.deepEqual(errors,[]);console.log('PASS three accounts: 30/500 m, cross-cell and actual province boundaries, walk-out, travel, wire isolation, HTML, report, block, suspension, reconnect and spoof rejection.');
}finally{await browser?.close();game.p.kill();next.p.kill();await Promise.all([next.exit,game.exit]);db.close();await rm(dir,{recursive:true,force:true})}
