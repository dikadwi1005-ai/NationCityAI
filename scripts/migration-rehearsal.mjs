// Local-only drill against an existing source. Never initializes or writes it.
import EmbeddedPostgres from 'embedded-postgres';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {once} from 'node:events';
import assert from 'node:assert/strict';
import {auditSqlite} from './audit-sqlite.mjs';
import {fromSqlite,importArchive,fromPg} from '../packages/postgres/archive.mjs';
import {nativeRows,connection} from '../packages/postgres/connection.mjs';

if(!process.argv[2])throw Error('Tentukan database SQLite yang sudah ada.');
const source=resolve(process.argv[2]),before=auditSqlite(source);
fromSqlite(source,{requireComplete:true});
const dir=mkdtempSync(join(tmpdir(),'nation-source-drill-'));
const listener=createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
const port=listener.address().port;await new Promise(r=>listener.close(r));
const password=randomBytes(32).toString('hex');
const pg=new EmbeddedPostgres({databaseDir:join(dir,'cluster'),port,user:'postgres',password,persistent:true,onLog:()=>{},onError:()=>{}});
let owner,runtime,started=false;
try{
 const copy=join(dir,'source.sqlite'),sqlite=new DatabaseSync(source,{readOnly:true});
 try{sqlite.prepare('VACUUM INTO ?').run(copy)}finally{sqlite.close()}
 await pg.initialise();await pg.start();started=true;nativeRows();
 const url=user=>'postgresql://'+user+':'+password+'@127.0.0.1:'+port+'/postgres';
 owner=connection(url('postgres'));await owner.connect();
 await owner.query("CREATE ROLE nation_app LOGIN PASSWORD '"+password+"'");
 const archive=fromSqlite(copy,{requireComplete:true});
 const imported=await importArchive(owner,archive,'nation_app','postgres');
 runtime=connection(url('nation_app'));await runtime.connect();
 const actual=await fromPg(runtime);
 assert.deepEqual(actual.rows.worlds,archive.rows.worlds);
 assert.deepEqual(actual.rows.world_events,archive.rows.world_events);
 assert.ok(actual.rows.schema_migrations.some(r=>r.version===51));
 assert.equal((await runtime.query('SELECT count(*) AS n FROM citizen_sessions')).rows[0].n,0);
 assert.equal((await runtime.query('SELECT count(*) AS n FROM play_tickets')).rows[0].n,0);
 await assert.rejects(()=>importArchive(owner,archive,'nation_app','postgres'),/already exists/);
 assert.deepEqual(auditSqlite(source).signatures,before.signatures);
 console.log(JSON.stringify({status:'PASS',source,seedOnly:before.seedOnly,postgres:(await owner.query('SHOW server_version')).rows[0].server_version,imported,worldAndHistoryMatch:true,runtimeRoleReadVerified:true,existingTargetRejected:true,sourceUnchanged:true,cloud:false},null,2));
}finally{
 await runtime?.end().catch(()=>{});await owner?.end().catch(()=>{});
 if(started)await pg.stop();
 // Only the exact directory returned by mkdtemp is removed.
 assert.ok(resolve(dir).startsWith(resolve(tmpdir())+ (process.platform==='win32'?'\\':'/')));
 rmSync(dir,{recursive:true,force:true,maxRetries:4,retryDelay:300});
}
