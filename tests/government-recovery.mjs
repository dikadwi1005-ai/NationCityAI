import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {mkdtempSync,mkdirSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {DatabaseSync} from 'node:sqlite';import {once} from 'node:events';import {execFileSync,spawn} from 'node:child_process';
import {PGlite} from '@electric-sql/pglite';
import {store} from '../packages/persistence/store.ts';import {defaults} from '../packages/citizens/model.ts';
import {database,authenticate,identify,saveLook} from '../packages/citizens/db.ts';
import {change,overview,currentRole} from '../packages/government/service.mjs';
import {snapshot,config,restore,history,retain} from '../packages/recovery/local.mjs';
import {exportSql} from '../scripts/postgres-export.mjs';
const dir=mkdtempSync(join(tmpdir(),'nation-recovery-qa-'));process.env.WORLD_DATA_DIR=join(dir,'active');process.env.BACKUP_DIR=join(dir,'private');process.env.BACKUP_KEY=randomBytes(32).toString('base64');delete process.env.BACKUP_S3_BUCKET;
const db=database(),w=store();const {source}=config(),region=randomUUID(),island=randomUUID();let rev=0;
function terrain(tool,x,id,name){w.mutate({requestId:randomUUID(),expectedRevision:rev++,command:{type:'geo',tool,id,name,island:'island-001',x,z:0,radius:12,strength:2,biome:'grass',level:1,parent:'nation-001'}})}
terrain('island',80,island,'Sagara');terrain('region',0,region,'Aurora');
const house={...w.read().objects.find(o=>o.asset==='house'),id:randomUUID(),x:18,z:12};w.mutate({requestId:randomUUID(),expectedRevision:rev++,command:{type:'place',object:house}});
const world=w.read(),day=86400000;let now=Date.now(),pg;
try{
 const people=[];for(const login of ['Aruna','Bima','Citra','Luar']){const id=identify(await authenticate(login,'test-password-123',true));saveLook(id,{...defaults,name:login});people.push(id)}
 now=Date.now(); // Freeze the election clock after all fixture registrations exist.
 const [a,b,c,out]=people;
 const op=(user,action,body,admin=false)=>change(db,world,user,admin,{action,...body},now),adm=(action,body)=>op(null,action,body,true);
 for(const u of [a,b,c])op(u,'reside',{region});
 assert.ok(history(config().dir).some(m=>m.reason==='pre-migration-v5'));
 const o=adm('office',{region,title:'Gubernur',days:2,minAge:0,method:'elected',building:world.objects.find(o=>o.asset==='hall').id,permission:'announce'});
 const e=adm('election',{office:o,opens:now,closes:now+day,tie:'earliest'}),stage=next=>adm('stage',{id:e,next});
 assert.throws(()=>stage('FINALIZED'));stage('NOMINATION');const ca=op(a,'apply',{id:e,program:'Sekolah'}),cb=op(b,'apply',{id:e,program:'Klinik'});
 assert.throws(()=>op(out,'apply',{id:e,program:'salah'}));assert.throws(()=>op(c,'reside',{region:'nation-001'}));stage('REVIEW');
 for(const id of [ca,cb])adm('review',{id,status:'APPROVED'});stage('VOTING');
 const vote=(u,candidate)=>op(u,'vote',{id:e,candidate});
 assert.throws(()=>op(c,'vote',{id:e,candidate:ca,user:a}));assert.throws(()=>vote(out,ca));assert.throws(()=>vote(null,ca));
 db.exec("CREATE TRIGGER fail_ballot BEFORE INSERT ON ballots BEGIN SELECT RAISE(ABORT,'fixture rollback'); END");assert.throws(()=>vote(c,ca));assert.equal(db.prepare('SELECT count(*) n FROM participation').get().n,0);db.exec('DROP TRIGGER fail_ballot');
 vote(a,ca);vote(b,cb);vote(c,ca);assert.throws(()=>vote(c,cb));now+=day+1;assert.throws(()=>vote(a,cb));overview(db,world,null,false,now);stage('FINALIZED');stage('FINALIZED');assert.deepEqual(db.prepare('SELECT votes FROM election_results ORDER BY votes').all().map(x=>x.votes),[1,2]);assert.equal(currentRole(db,a,now).id,o);
 assert.throws(()=>op(a,'office',{region,title:'X',days:1,minAge:0,method:'appointed',building:'',permission:'none'}));op(a,'announce',{office:o,description:'Agenda belajar'});op(a,'uniform',{office:o,enabled:true});
 const prop=op(c,'proposal',{region,kind:'Sekolah',description:'Sekolah Aurora'});adm('decision',{id:prop,status:'REVIEWED'});adm('decision',{id:prop,status:'APPROVED'});assert.deepEqual(w.read(),world);
 const m=snapshot(source);assert.equal(m.integrity,'ok');const newPath=join(dir,'restored.sqlite');restore(source,m.id,newPath);assert.throws(()=>restore(source,m.id,newPath));assert.throws(()=>restore(source,m.id,source));
 const recovered=new DatabaseSync(newPath,{readOnly:true});try{for(const t of ['worlds','terrain_chunks','world_events','citizens','appearances','residency','offices','eligibility','participation','ballots','election_results','office_terms','proposals','gov_events','gov_audit'])assert.deepEqual(recovered.prepare('SELECT * FROM '+t).all(),db.prepare('SELECT * FROM '+t).all(),t);
 assert.equal(recovered.prepare('SELECT count(*) n FROM citizen_sessions').get().n,0);assert.deepEqual(recovered.prepare("PRAGMA table_info('ballots')").all().map(r=>r.name),['nonce','election','candidate']);assert.ok(db.prepare('SELECT count(*) n FROM citizen_sessions').get().n>0)}finally{recovered.close()}
 const key=process.env.BACKUP_KEY;process.env.BACKUP_KEY=randomBytes(32).toString('base64');assert.throws(()=>restore(source,m.id,join(dir,'bad.sqlite')));process.env.BACKUP_KEY=key;
 const cli=()=>execFileSync(process.execPath,['scripts/recovery.mjs','tick'],{env:process.env});cli();cli();assert.equal(history(config().dir).filter(r=>r.reason==='scheduled').length,1);
 const worker=spawn(process.execPath,['scripts/recovery.mjs','watch'],{env:{...process.env,BACKUP_INTERVAL_HOURS:'0.0002',BACKUP_POLL_SECONDS:'1'},stdio:['ignore','pipe','inherit']});const stopped=once(worker,'exit');
 try{await new Promise((resolve,reject)=>{let count=0;const timer=setTimeout(()=>reject(Error('Scheduled backup did not repeat')),12000);worker.stdout.on('data',chunk=>{count+=(String(chunk).match(/"remote"/g)??[]).length;if(count>=2){clearTimeout(timer);resolve()}})})}finally{worker.kill();await stopped}
 const lastGood=history(config().dir)[0];process.env.BACKUP_KEY='invalid';assert.throws(()=>snapshot(source));process.env.BACKUP_KEY=key;restore(source,lastGood.id,join(dir,'after-failure.sqlite'));
 const tampered=snapshot(source);const file=join(config().dir,tampered.id+'.enc');const blob=readFileSync(file);blob[32]^=1;writeFileSync(file,blob);assert.throws(()=>restore(source,tampered.id,join(dir,'corrupt.sqlite')));
 now+=3*day;overview(db,world,a,false,now);assert.equal(currentRole(db,a,now),null);assert.equal(db.prepare("SELECT count(*) n FROM gov_events WHERE kind='INAUGURATION'").get().n,1);
 pg=new PGlite();await pg.exec(exportSql(source));assert.deepEqual((await pg.query('SELECT votes FROM nation_import.election_results ORDER BY votes')).rows.map(r=>r.votes),[1,2]);assert.equal((await pg.query('SELECT count(*)::int AS n FROM nation_import.gov_events')).rows[0].n,db.prepare('SELECT count(*) n FROM gov_events').get().n);
 assert.deepEqual(w.read(),world);console.log('PASS governance stages, candidate eligibility, frozen residence, private votes, rollback, deadline, 2:1 tally, idempotent term, expiration, proposal, PostgreSQL staging. PASS encrypted WAL backup, pre-migration, scheduled deduplication, restore contents and IDs, main unchanged, corruption and wrong-key rejection.');
}finally{await pg?.close();w.close();rmSync(dir,{recursive:true,force:true})}
