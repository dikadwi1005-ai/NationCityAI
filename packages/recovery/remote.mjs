import {S3Client,GetPublicAccessBlockCommand,GetBucketOwnershipControlsCommand,GetBucketPolicyStatusCommand,GetBucketPolicyCommand,GetBucketVersioningCommand,GetBucketLifecycleConfigurationCommand,PutObjectCommand,GetObjectCommand} from '@aws-sdk/client-s3';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';import {restore,config,writeMeta,audit} from './local.mjs';import {join} from 'node:path';import {createHash} from 'node:crypto';
export async function upload(dir,m,client){
 const Bucket=process.env.BACKUP_S3_BUCKET;if(!Bucket)return 'belum aktif';
 if(!process.env.BACKUP_KEY||!process.env.AWS_REGION||process.env.AWS_ENDPOINT_URL||process.env.AWS_ENDPOINT_URL_S3)throw Error('Konfigurasi remote tidak valid.');
 const s=client??new S3Client({region:process.env.AWS_REGION,ignoreConfiguredEndpointUrls:true});try{
 const call=C=>s.send(new C({Bucket}));const block=(await call(GetPublicAccessBlockCommand)).PublicAccessBlockConfiguration;
 if(!block||!['BlockPublicAcls','IgnorePublicAcls','BlockPublicPolicy','RestrictPublicBuckets'].every(k=>block[k]===true))throw Error('Bucket tidak privat.');
 const owners=(await call(GetBucketOwnershipControlsCommand)).OwnershipControls?.Rules;
 if(!owners?.some(r=>r.ObjectOwnership==='BucketOwnerEnforced'))throw Error('ACL bucket harus dinonaktifkan.');
 try{if((await call(GetBucketPolicyStatusCommand)).PolicyStatus?.IsPublic!==false)throw Error('Bucket publik.');const policy=JSON.parse((await call(GetBucketPolicyCommand)).Policy);for(const statement of policy.Statement??[])if(statement.Effect==='Allow'&&(statement.NotPrincipal||JSON.stringify(statement.Principal).includes('\"*\"')))throw Error('Izin bucket terlalu terbuka.')}catch(e){if(e.name!=='NoSuchBucketPolicy')throw e}
 if((await call(GetBucketVersioningCommand)).Status)throw Error('Gunakan bucket backup khusus tanpa versioning.');
 const rules=(await call(GetBucketLifecycleConfigurationCommand)).Rules??[];
 if(!rules.some(r=>r.Status==='Enabled'&&r.Expiration?.Days===1&&(!r.Filter||Object.keys(r.Filter).every(k=>k==='Prefix'))&&'nation-backups/'.startsWith(r.Filter?.Prefix??r.Prefix??'')))throw Error('Lifecycle satu hari diperlukan.');
 const Key='nation-backups/'+m.id+'.enc',body=readFileSync(join(dir,m.id+'.enc'));
 await s.send(new PutObjectCommand({Bucket,Key,Body:body,ChecksumSHA256:Buffer.from(m.sha256,'hex').toString('base64'),Metadata:{id:m.id,sha256:m.sha256,expires:String(m.expires),schema:String(m.schema),at:String(m.at)},IfNoneMatch:'*'}));
 const obj=await s.send(new GetObjectCommand({Bucket,Key}));const hash=createHash('sha256');for await(const part of obj.Body)hash.update(part);if(hash.digest('hex')!==m.sha256)throw Error('Checksum remote gagal.');
 return 'terverifikasi'
 }finally{s.destroy()}}


export async function restoreRemote(source,id,target,client){
 if(!/^[0-9a-f-]{36}$/.test(id)||!process.env.BACKUP_S3_BUCKET||!process.env.AWS_REGION||!process.env.BACKUP_KEY)throw Error('Konfigurasi restore remote tidak lengkap.');
 const s=client??new S3Client({region:process.env.AWS_REGION,ignoreConfiguredEndpointUrls:true});const {dir}=config(source);mkdirSync(dir,{recursive:true,mode:0o700});let created=false;
 try{const obj=await s.send(new GetObjectCommand({Bucket:process.env.BACKUP_S3_BUCKET,Key:'nation-backups/'+id+'.enc'}));const meta=obj.Metadata;
 if(meta?.id!==id||!Number.isSafeInteger(Number(meta.expires))||Number(meta.expires)<=Date.now())throw Error('Manifest remote tidak valid.');
 const bytes=Buffer.from(await obj.Body.transformToByteArray());if(createHash('sha256').update(bytes).digest('hex')!==meta.sha256)throw Error('Checksum remote tidak cocok.');
 try{writeFileSync(join(dir,id+'.enc'),bytes,{mode:0o600,flag:'wx'});created=true}catch(e){if(e.code!=='EEXIST'||createHash('sha256').update(readFileSync(join(dir,id+'.enc'))).digest('hex')!==meta.sha256)throw e}
 if(created)writeMeta(dir,{id,at:Number(meta.at),expires:Number(meta.expires),reason:'remote-recovery',schema:Number(meta.schema),bytes:bytes.length,sha256:meta.sha256,remote:'terverifikasi',integrity:'checksum'});
 restore(source,id,target);audit(dir,'remote-restore',true,id);
 }catch(e){audit(dir,'remote-restore',false,id);throw e}finally{s.destroy()}
}
