// Requires an existing private bucket and operator-supplied secrets. Never provisions cloud resources.
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {config,snapshot,restore,writeMeta} from '../packages/recovery/local.mjs';
import {upload,restoreRemote} from '../packages/recovery/remote.mjs';
import {auditSqlite} from './audit-sqlite.mjs';

if(!process.argv.includes('--confirm-upload')||!process.argv[2]||process.argv[2].startsWith('--'))throw Error('Gunakan: node scripts/verify-s3-backup.mjs <sumber.sqlite> --confirm-upload [--report <hasil.json>]. Upload memerlukan izin biaya cloud.');
if(!process.env.BACKUP_S3_BUCKET||!process.env.AWS_REGION||Buffer.from(process.env.BACKUP_KEY??'','base64').length!==32)throw Error('S3, region dan kunci backup operator belum lengkap.');
const source=resolve(process.argv[2]);auditSqlite(source);
const {dir}=config(source),temp=mkdtempSync(join(tmpdir(),'nation-s3-drill-'));
const previousDir=process.env.BACKUP_DIR;
try{
 const meta=snapshot(source,'pre-migration-s3-drill');
 const expected=join(temp,'expected.sqlite');restore(source,meta.id,expected);
 meta.remote=await upload(dir,meta);writeMeta(dir,meta);
 if(meta.remote!=='terverifikasi')throw Error('Upload belum diverifikasi.');
 // A fresh vault forces GET and authenticated decryption from the cloud copy.
 process.env.BACKUP_DIR=join(temp,'fresh-vault');mkdirSync(process.env.BACKUP_DIR);
 const target=join(temp,'restored.sqlite');await restoreRemote(source,meta.id,target);
 const baseline=auditSqlite(expected),actual=auditSqlite(target);
 assert.deepEqual(actual.counts,baseline.counts);assert.deepEqual(actual.signatures,baseline.signatures);
 const report={at:new Date().toISOString(),id:meta.id,sha256:meta.sha256,encryptedPut:true,remoteGetChecksum:true,freshVaultRestore:true,allTableSignaturesMatch:true,sourceModified:false,provider:'AWS S3'};
 const i=process.argv.indexOf('--report');if(i>=0){if(!process.argv[i+1])throw Error('Path laporan wajib.');writeFileSync(resolve(process.argv[i+1]),JSON.stringify(report,null,2)+'\n',{flag:'wx'})}
 console.log(JSON.stringify(report));
}finally{
 if(previousDir===undefined)delete process.env.BACKUP_DIR;else process.env.BACKUP_DIR=previousDir;
 assert.ok(resolve(temp).startsWith(resolve(tmpdir())+(process.platform==='win32'?'\\':'/')));
 rmSync(temp,{recursive:true,force:true,maxRetries:4,retryDelay:300});
}
