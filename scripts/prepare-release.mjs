import {readdirSync,readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync,lstatSync} from 'node:fs';
import {resolve,join,relative,sep,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {parseEnv} from 'node:util';
const root=process.cwd(),target=resolve('.release/NationCityAI');
if(!existsSync(join(target,'.git')))throw Error('Checkout Git tujuan belum tersedia.');
const privateDocs=new Set(['phase5b-runtime-audit.json','phase5b-live-smoke.json','s3-live-verification.json']);
const disallowed=name=>['node_modules','.next','.git','.release','data'].includes(name)||name.endsWith('.tsbuildinfo')||/\.(?:sqlite.*|enc|key|partial|log|dump|private\.(?:sql|json))$/i.test(name)||(name.startsWith('.env')&&!name.endsWith('.example'))||privateDocs.has(name);
const paths=[];
function walk(dir){for(const entry of readdirSync(join(root,dir),{withFileTypes:true})){if(disallowed(entry.name)||(dir==='docs'&&entry.name.endsWith('.png')))continue;const p=join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Symlink sumber perlu review: '+p);if(entry.isDirectory())walk(p);else if(entry.isFile())paths.push(p)}}
for(const dir of ['apps','packages','scripts','tests','deploy','docs','.github'])if(existsSync(dir))walk(dir);
for(const f of ['.gitignore','.gitattributes','.dockerignore','.env.example','package.json','package-lock.json','README.md','PROJECT_MASTER.md','1-AI_NATION_BUILDER_MASTER_PROMPT.txt','CONTINUE_PHASE_1.md'])if(existsSync(f))paths.push(f);
const env=existsSync('apps/web/.env.local')?parseEnv(readFileSync('apps/web/.env.local','utf8')):{};
const secrets=Object.entries(env).filter(([k,v])=>/KEY|TOKEN|SECRET|PASSWORD|DATABASE_URL|AWS_ACCESS/i.test(k)&&v.length>=16).map(([,v])=>v);
const manifest=[];
for(const path of paths){const input=join(root,path),dest=join(target,path),bytes=readFileSync(input);
 if(secrets.some(v=>bytes.includes(Buffer.from(v))))throw Error('Nilai privat terdeteksi di '+path);
 if(/\.(?:mjs|ts|tsx|js|jsx|json|md|txt|toml|yml|yaml|example)$/.test(path)&&/AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(bytes.toString('utf8')))throw Error('Pola credential terdeteksi di '+path);
 if(lstatSync(input).isSymbolicLink())throw Error('Symlink ditolak.');
 const relation=relative(target,dest);if(relation.startsWith('..'+sep)||relation==='..')throw Error('Path di luar checkout.');
 mkdirSync(dirname(dest),{recursive:true});copyFileSync(input,dest);
 manifest.push({path:path.replaceAll('\\','/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
// Overlay only: any remote-only files remain present for explicit review.
writeFileSync('data/release-manifest.private.json',JSON.stringify({at:new Date().toISOString(),target,files:manifest},null,2));
console.log(JSON.stringify({target,files:manifest.length,policy:'Explicit source allowlist; no deletions; private state excluded; exact configured local secrets and token patterns checked.'}));
