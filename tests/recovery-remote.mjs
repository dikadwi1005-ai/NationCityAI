import assert from 'node:assert/strict';import {Readable} from 'node:stream';import {randomBytes} from 'node:crypto';import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {DatabaseSync} from 'node:sqlite';
import {config,snapshot} from '../packages/recovery/local.mjs';import {upload,restoreRemote} from '../packages/recovery/remote.mjs';
const root=mkdtempSync(join(tmpdir(),'nation-s3-contract-'));process.env.WORLD_DATA_DIR=join(root,'data');process.env.BACKUP_DIR=join(root,'vault');process.env.BACKUP_KEY=randomBytes(32).toString('base64');mkdirSync(process.env.WORLD_DATA_DIR);const {source,dir}=config();
let body,meta,isPublic=false,badRead=false;
const stub={destroy(){},async send(command){switch(command.constructor.name){
 case 'GetPublicAccessBlockCommand':return {PublicAccessBlockConfiguration:{BlockPublicAcls:true,IgnorePublicAcls:true,BlockPublicPolicy:true,RestrictPublicBuckets:true}};
 case 'GetBucketOwnershipControlsCommand':return {OwnershipControls:{Rules:[{ObjectOwnership:'BucketOwnerEnforced'}]}};
 case 'GetBucketPolicyStatusCommand':return {PolicyStatus:{IsPublic:isPublic}};
 case 'GetBucketPolicyCommand':return {Policy:'{"Statement":[]}'};
 case 'GetBucketVersioningCommand':return {};
 case 'GetBucketLifecycleConfigurationCommand':return {Rules:[{Status:'Enabled',Expiration:{Days:1},Filter:{Prefix:'nation-backups/'}}]};
 case 'PutObjectCommand':body=Buffer.from(command.input.Body);meta=command.input.Metadata;return {};
 case 'GetObjectCommand':{const b=badRead?Buffer.from('corrupt'):body;const s=Readable.from([b]);s.transformToByteArray=async()=>b;return {Metadata:meta,Body:s}}
 default:throw Error(command.constructor.name)
 }}};
try{const db=new DatabaseSync(source);db.exec("PRAGMA journal_mode=WAL; CREATE TABLE test (name text); INSERT INTO test VALUES('private fixture')");db.close();const m=snapshot(source);
 delete process.env.BACKUP_S3_BUCKET;assert.equal(await upload(dir,m,stub),'belum aktif');process.env.BACKUP_S3_BUCKET='test-private';process.env.AWS_REGION='test-region';
 isPublic=true;await assert.rejects(()=>upload(dir,m,stub));assert.equal(body,undefined);isPublic=false;
 badRead=true;await assert.rejects(()=>upload(dir,m,stub),/Checksum/);badRead=false;assert.equal(await upload(dir,m,stub),'terverifikasi');assert.ok(!body.includes(Buffer.from('private fixture')));
 process.env.BACKUP_DIR=join(root,'disaster-vault');const target=join(root,'restored.sqlite');await restoreRemote(source,m.id,target,stub);
 const copy=new DatabaseSync(target,{readOnly:true});assert.equal(copy.prepare('SELECT name FROM test').get().name,'private fixture');copy.close();
 console.log('PASS S3 protocol contract using a stub: public policy denied, encrypted PUT, corrupt GET rejected, valid read-back, fresh-vault restore. No network/cloud upload.');
}finally{rmSync(root,{recursive:true,force:true})}
