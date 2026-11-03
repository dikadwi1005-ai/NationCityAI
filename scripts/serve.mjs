import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
try{process.loadEnvFile(resolve(root,'apps/web/.env.local'))}catch(e){if(e.code!=='ENOENT')throw e}
const env={...process.env,WORLD_DATA_DIR:process.env.WORLD_DATA_DIR||resolve(root,'data')};
const services=[['apps/multiplayer-server/server.mjs'],['node_modules/next/dist/bin/next',process.argv[2]||'dev','apps/web','--hostname','0.0.0.0',...process.argv.slice(3)]].map(args=>spawn(process.execPath,args,{cwd:root,env,stdio:'inherit'}));
let ending=false;function end(code){if(ending)return;ending=true;for(const p of services)p.kill();process.exitCode=code}
for(const p of services)p.on('exit',code=>end(code??0));process.on('SIGINT',()=>end(0));process.on('SIGTERM',()=>end(0));
