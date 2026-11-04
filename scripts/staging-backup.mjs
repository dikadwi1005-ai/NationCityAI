import {randomUUID} from 'node:crypto';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';import {seal,open,checksum} from '../packages/postgres/vault.mjs';
import {S3Client,GetObjectCommand} from '@aws-sdk/client-s3';
import {fromPg,importArchive} from '../packages/postgres/archive.mjs';import {connection,nativeRows} from '../packages/postgres/connection.mjs';import {upload} from '../packages/recovery/remote.mjs';
nativeRows();
async function backup(db,id){
 const dir=mkdtempSync(join(tmpdir(),'nation-pg-vault-'));
 try{if(!process.env.BACKUP_S3_BUCKET)throw Error('S3 belum dikonfigurasi.');const a=await fromPg(db),blob=seal(id,a);writeFileSync(join(dir,id+'.enc'),blob,{mode:0o600});
 const meta={id,at:a.at,expires:a.at+2*86400000,sha256:checksum(blob),schema:51};if(await upload(dir,meta)!=='terverifikasi')throw Error('Upload belum diverifikasi.');
 await db.query("UPDATE backup_runs SET status='verified',bytes=$1,sha256=$2 WHERE id=$3",[blob.length,meta.sha256,id]);console.log(JSON.stringify({event:'backup_verified',id,bytes:blob.length}))
 }catch(e){await db.query("UPDATE backup_runs SET status='failed' WHERE id=$1",[id]);console.error(JSON.stringify({event:'backup_failed',id}));throw e}finally{rmSync(dir,{recursive:true,force:true})}}
async function tick(db){if(!(await db.query('SELECT pg_try_advisory_lock(792614) AS ok')).rows[0].ok)return;
 try{await db.query("UPDATE backup_runs SET status='failed' WHERE status='running'");let job=(await db.query("SELECT id FROM backup_runs WHERE status='requested' ORDER BY at LIMIT 1")).rows[0];
 if(!job){const hours=Number(process.env.BACKUP_INTERVAL_HOURS??24);if(!Number.isFinite(hours)||hours<=0)throw Error('Interval tidak valid.');
 const last=(await db.query("SELECT max(at) AS at FROM backup_runs WHERE reason='scheduled' AND status='verified'")).rows[0].at;
 if(last&&Date.now()-last<hours*3600000)return;const failed=(await db.query("SELECT max(at) AS at FROM backup_runs WHERE status='failed'")).rows[0].at;if(failed&&Date.now()-failed<3600000)return;job={id:randomUUID()};await db.query("INSERT INTO backup_runs(id,at,reason,status) VALUES($1,$2,'scheduled','requested')",[job.id,Date.now()])}
 await db.query("UPDATE backup_runs SET status='running' WHERE id=$1",[job.id]);await backup(db,job.id)
 }finally{await db.query('SELECT pg_advisory_unlock(792614)')}}
async function drill(id){
 if(!/^[a-f0-9-]{36}$/.test(id??'')||!process.env.RESTORE_DATABASE_URL||!process.env.RESTORE_TARGET_DATABASE||!process.env.DATABASE_URL||new URL(process.env.RESTORE_DATABASE_URL).pathname===new URL(process.env.DATABASE_URL).pathname)throw Error('Gunakan database drill dengan nama berbeda dari staging.');
 const s=new S3Client({region:process.env.AWS_REGION,ignoreConfiguredEndpointUrls:true}),db=connection(process.env.RESTORE_DATABASE_URL);try{const o=await s.send(new GetObjectCommand({Bucket:process.env.BACKUP_S3_BUCKET,Key:'nation-backups/'+id+'.enc'}));const blob=Buffer.from(await o.Body.transformToByteArray());const a=open(id,blob,o.Metadata);await db.connect();const report=await importArchive(db,a,process.env.RUNTIME_DB_ROLE,process.env.RESTORE_TARGET_DATABASE);console.log(JSON.stringify(report));const primary=connection();try{await primary.connect();await primary.query('UPDATE backup_runs SET restored_at=$1 WHERE id=$2 AND sha256=$3',[Date.now(),id,o.Metadata.sha256])}finally{await primary.end()}
 }finally{await db.end().catch(()=>{});s.destroy()}}
const action=process.argv[2]??'tick';
if(action==='restore-drill'&&process.argv[4]==='--confirm-new-schema')await drill(process.argv[3]);
else if(['watch','tick'].includes(action)){do{const db=connection();try{await db.connect();await tick(db)}catch{if(action==='tick')throw Error('Backup staging gagal.');console.error('Backup tidak tersedia. Periksa konfigurasi server.')}finally{await db.end().catch(()=>{})}if(action==='watch')await new Promise(r=>setTimeout(r,60000))}while(action==='watch')}
else throw Error('Operasi tidak valid.');
