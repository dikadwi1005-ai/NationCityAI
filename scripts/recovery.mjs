import {config,snapshot,history,writeMeta,restore,retain,due} from '../packages/recovery/local.mjs';
import {upload,restoreRemote} from '../packages/recovery/remote.mjs';
import {existsSync,appendFileSync} from 'node:fs';import {join} from 'node:path';
const {dir,source}=config();const action=process.argv[2]??'backup';
async function run(reason){const meta=snapshot(source,reason);try{meta.remote=await upload(dir,meta)}catch{meta.remote='gagal';writeMeta(dir,meta);appendFileSync(join(dir,'recovery.log'),JSON.stringify({at:Date.now(),action:'remote',ok:false,id:meta.id})+'\n');throw Error('Backup lokal tersimpan; verifikasi remote gagal.')}writeMeta(dir,meta);if(meta.remote==='terverifikasi')appendFileSync(join(dir,'recovery.log'),JSON.stringify({at:Date.now(),action:'remote',ok:true,id:meta.id})+'\n');retain(dir);console.log(JSON.stringify({id:meta.id,remote:meta.remote}))}
if(action==='restore'||action==='restore-remote'){if(process.argv[5]!=='--confirm-new-file')throw Error('Wajib --confirm-new-file');if(action==='restore-remote')await restoreRemote(source,process.argv[3],process.argv[4]);else restore(source,process.argv[3],process.argv[4])}
else if(action==='watch'||action==='tick'){const poll=Number(process.env.BACKUP_POLL_SECONDS??60);if(!Number.isFinite(poll)||poll<1||poll>3600)throw Error('Interval pemeriksaan tidak valid.');async function tick(){if(existsSync(source)&&due(dir))await run('scheduled');else if(existsSync(dir))retain(dir)}
 do{try{await tick()}catch(e){console.error(e.message);if(action==='tick')process.exitCode=1}if(action==='watch')await new Promise(r=>setTimeout(r,poll*1000))}while(action==='watch')}
else if(action==='backup')await run('manual');else throw Error('Operasi tidak dikenal.');
