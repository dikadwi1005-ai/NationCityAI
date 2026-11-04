// Read-only checks of the existing live server. Does not register fixture citizens.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
import {chromium} from 'playwright-core';
import {auditSqlite} from '../scripts/audit-sqlite.mjs';

const source=resolve(process.env.WORLD_DATA_DIR||'data','nation.sqlite');
const before=auditSqlite(source),origin=process.env.SMOKE_ORIGIN||'http://localhost:3000';
try{process.loadEnvFile(resolve('apps/web/.env.local'))}catch(e){if(e.code!=='ENOENT')throw e}
if(!process.env.ADMIN_KEY)throw Error('Kunci admin lokal belum terkonfigurasi.');
const db=new DatabaseSync(source,{readOnly:true});let world;
try{world=JSON.parse(db.prepare('SELECT state FROM worlds').get().state)}finally{db.close()}
const browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/warga','/pemerintahan','/moderasi','/pemulihan','/api/health','/api/government'])assert.equal((await context.request.get(origin+path)).status(),200,path);
 assert.deepEqual(await(await context.request.get(origin+'/api/world')).json(),world);
 for(const path of ['/api/moderation','/api/recovery'])assert.equal((await context.request.get(origin+path)).status(),403,path);
 for(const path of ['/api/world','/api/government','/api/citizen','/api/recovery'])assert.equal((await context.request.post(origin+path,{headers:{Origin:'https://invalid.example'},data:{}})).status(),403,path);
 const login=await context.request.post(origin+'/api/session',{headers:{Origin:origin},data:{key:process.env.ADMIN_KEY}});assert.equal(login.status(),200);
 assert.ok((await context.cookies()).some(c=>c.name==='nation_admin'&&c.httpOnly));
 for(const path of ['/api/moderation','/api/recovery'])assert.equal((await context.request.get(origin+path)).status(),200,path);
 await page.goto(origin);await page.locator('canvas').waitFor();await page.getByText('Dunia tersimpan',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Buka atlas negara'}).click();await page.getByRole('button',{name:'Katalog bangunan'}).waitFor();
 await page.getByRole('button',{name:'Panduan'}).click();await page.getByText('PANDUAN NEGARA',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Mulai membangun'}).click();
 for(const path of ['/warga','/pemerintahan','/moderasi','/pemulihan']){await page.goto(origin+path);await page.locator('main').waitFor()}
 assert.equal((await context.request.get('http://127.0.0.1:2567/health')).status(),200);
 assert.deepEqual(errors,[]);assert.deepEqual(auditSqlite(source).signatures,before.signatures);
 const report={at:new Date().toISOString(),origin,source,status:'PASS',liveWorldMatchesDatabase:true,adminSessionAndProtectedReads:true,crossOriginDenied:true,anonymousAdminDenied:true,atlasAndHelpRendered:true,allPhasePagesRendered:true,multiplayerHealth:true,browserErrors:0,sourceUnchanged:true,scope:'Existing runtime read-only smoke; mutating multi-user acceptance runs on isolated fixtures.'};
 writeFileSync('docs/phase5b-live-smoke.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close()}
