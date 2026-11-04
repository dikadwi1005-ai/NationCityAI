import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';import {resolve} from 'node:path';
import {webOrigin} from '../packages/postgres/runtime.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),service=process.argv[2];
if(!['web','multiplayer','backup'].includes(service))throw Error('Pilih web, multiplayer atau backup.');
if(process.env.NATION_ENV!=='staging'||process.env.NATION_DB!=='postgres'||!process.env.DATABASE_URL)throw Error('Staging harus menggunakan PostgreSQL yang sudah dimigrasikan.');
if(service!=='backup'){
 if(!webOrigin()||process.env.CLOSED_BETA!=='true'||!process.env.BETA_USERNAMES?.trim()||(process.env.BETA_INVITE_KEY?.length??0)<32)throw Error('Origin dan kontrol beta belum lengkap.');
 if(service==='web'&&((process.env.ADMIN_KEY?.length??0)<32||!/^wss:\/\/[^/]+\/?$/.test(process.env.MULTIPLAYER_PUBLIC_URL??'')))throw Error('Sesi admin atau WSS belum siap.');
}else if(!process.env.BACKUP_S3_BUCKET||!process.env.AWS_REGION||Buffer.from(process.env.BACKUP_KEY??'','base64').length!==32)throw Error('Tujuan backup off-site belum siap.');
const port=process.env.PORT||'3000',args=service==='web'?['node_modules/next/dist/bin/next','start','apps/web','-H','0.0.0.0','-p',port]:service==='multiplayer'?['apps/multiplayer-server/server.mjs']:['scripts/staging-backup.mjs','watch'];
const child=spawn(process.execPath,args,{cwd:resolve(root),env:{...process.env,NATION_PROJECT_ROOT:root,NODE_ENV:'production',MULTIPLAYER_PORT:port,MULTIPLAYER_HOST:'::'},stdio:'inherit'});for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0)});
