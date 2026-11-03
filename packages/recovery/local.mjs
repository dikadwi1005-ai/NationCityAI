import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,createHash,createCipheriv,createDecipheriv} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync,existsSync,readdirSync,unlinkSync,statSync,appendFileSync,renameSync,copyFileSync,constants,realpathSync} from 'node:fs';
import {resolve,dirname,join,basename,relative,sep,isAbsolute} from 'node:path';
import {homedir,tmpdir} from 'node:os';
const day=86400000;
const hash=b=>createHash('sha256').update(b).digest('hex');
const inside=(parent,p)=>{const r=relative(parent,p);return !r||(!r.startsWith('..'+sep)&&r!=='..'&&!isAbsolute(r))};
export function config(source=join(process.env.WORLD_DATA_DIR||'data','nation.sqlite')){
 source=resolve(/*turbopackIgnore: true*/ source);const data=dirname(source),fallback=inside(tmpdir(),data)?join(dirname(data),basename(data)+'-recovery'):join(homedir(),'.nation-private',hash(Buffer.from(data)).slice(0,16));
 const dir=resolve(process.env.BACKUP_DIR||fallback);
 const privateBase=process.env.NATION_PROJECT_ROOT||([process.cwd(),resolve(process.cwd(),'../..')].find(p=>existsSync(join(p,'PROJECT_MASTER.md'))));
 if(privateBase&&inside(resolve(privateBase),dir))throw Error('Simpan backup di luar checkout source.');
 
 if(inside(data,dir)||inside(dir,data)||/(^|[\\/])(?:public|\.git|\.next)([\\/]|$)/i.test(dir))throw Error('Direktori backup harus privat dan terpisah dari data aktif.');
 return {source,dir}
}
export function audit(dir,action,ok,id){appendFileSync(join(dir,'recovery.log'),JSON.stringify({at:new Date().toISOString(),action,ok,id})+'\n',{mode:0o600})}
function key(dir,create=false){
 if(process.env.BACKUP_KEY){const k=Buffer.from(process.env.BACKUP_KEY,'base64');if(k.length!==32)throw Error('BACKUP_KEY tidak valid.');return k}
 const f=dir+'.recovery.key';if(create&&!existsSync(f)){try{writeFileSync(f,randomBytes(32),{mode:0o600,flag:'wx'})}catch(e){if(e.code!=='EEXIST')throw e}}
 const k=readFileSync(f);if(k.length!==32)throw Error('Kunci lokal tidak valid.');return k
}
export function history(dir){if(!existsSync(dir))return [];return readdirSync(dir).filter(f=>/^[0-9a-f-]{36}\.json$/.test(f)).map(f=>{const m=JSON.parse(readFileSync(join(dir,f),'utf8'));if(m.id+'.json'!==f||!Number.isSafeInteger(m.at)||!Number.isSafeInteger(m.expires))throw Error('Manifest backup tidak valid.');return m}).sort((a,b)=>b.at-a.at)}
function check(db){if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||db.prepare('PRAGMA foreign_key_check').get())throw Error('Integrity check gagal.')}
function tables(db){return new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name))}
export function snapshot(source,reason='manual'){
 const {dir}=config(source);mkdirSync(dir,{recursive:true,mode:0o700});
 const id=randomUUID(),temp=join(dir,id+'.partial'),dest=join(dir,id+'.enc'),at=Date.now();let db;
 try{db=new DatabaseSync(source,{readOnly:true});db.prepare('VACUUM INTO ?').run(temp);db.close();db=new DatabaseSync(temp);const ts=tables(db);
 // Exclude live sessions and records approaching deletion. Remote lifecycle is capped at one day.
 for(const t of ['play_tickets','citizen_sessions'])if(ts.has(t))db.exec('DELETE FROM '+t);
 let expires=Number.MAX_SAFE_INTEGER;
 for(const [t,days] of [['chat_reports',30],['moderation_audit',90]])if(ts.has(t)){
 db.prepare('DELETE FROM '+t+' WHERE created<=?').run(at-(days-3)*day);const oldest=db.prepare('SELECT MIN(created) AS t FROM '+t).get().t;if(oldest)expires=Math.min(expires,Number(oldest)+days*day)}
 db.exec('VACUUM');check(db);const schema=ts.has('schema_migrations')?db.prepare('SELECT max(version) AS n FROM schema_migrations').get().n:0;
 db.close();db=null;const plain=readFileSync(temp),iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key(dir,true),iv);c.setAAD(Buffer.from(id));const body=Buffer.concat([c.update(plain),c.final()]);const blob=Buffer.concat([iv,c.getAuthTag(),body]);
 writeFileSync(dest,blob,{mode:0o600,flag:'wx'});if(hash(readFileSync(dest))!==hash(blob))throw Error('Penulisan backup gagal.');
 const meta={id,at,reason,schema,bytes:blob.length,sha256:hash(blob),integrity:'ok',expires,remote:'belum aktif'};
 writeMeta(dir,meta);audit(dir,reason,true,id);return meta
 }catch(e){audit(dir,reason,false,id);throw e}finally{if(db?.isOpen)db.close();if(existsSync(temp))unlinkSync(temp)}
}
export function writeMeta(dir,m){const tmp=join(dir,m.id+'.'+randomUUID()+'.tmp');writeFileSync(tmp,JSON.stringify(m),{mode:0o600});renameSync(tmp,join(dir,m.id+'.json'))}
export function restore(source,id,target){const {dir}=config(source);if(!/^[0-9a-f-]{36}$/.test(id)||existsSync(target)||inside(dirname(source),resolve(target)))throw Error('Pulihkan hanya ke file baru di luar direktori aktif.');
 if(existsSync(dirname(source))&&inside(realpathSync(dirname(source)),realpathSync(dirname(target))))throw Error('Tujuan restore berada di direktori aktif.');
 const temp=resolve(dirname(target),randomUUID()+'.partial');
 try{const m=JSON.parse(readFileSync(join(dir,id+'.json'),'utf8'));if(Date.now()>=m.expires)throw Error('Backup telah kedaluwarsa.');const b=readFileSync(join(dir,id+'.enc'));if(hash(b)!==m.sha256)throw Error('Checksum tidak cocok.');
 const d=createDecipheriv('aes-256-gcm',key(dir),b.subarray(0,12));d.setAAD(Buffer.from(id));d.setAuthTag(b.subarray(12,28));
 writeFileSync(temp,Buffer.concat([d.update(b.subarray(28)),d.final()]),{flag:'wx',mode:0o600});const db=new DatabaseSync(temp,{readOnly:true});try{check(db)}finally{db.close()}copyFileSync(temp,target,constants.COPYFILE_EXCL);audit(dir,'restore',true,id)
 }catch(e){audit(dir,'restore',false,id);throw e}finally{if(existsSync(temp))unlinkSync(temp)}}
export function retain(dir,now=Date.now()){
 const rows=history(dir),keep=new Set();const beforeMigration=rows.find(r=>r.reason.startsWith('pre-migration')&&r.expires>now);if(beforeMigration)keep.add(beforeMigration.id);for(const [env,n,group] of [['BACKUP_DAILY',7,t=>Math.floor(t/day)],['BACKUP_WEEKLY',4,t=>Math.floor(t/(7*day))],['BACKUP_MONTHLY',3,t=>new Date(t).toISOString().slice(0,7)]]){
 const limit=Number(process.env[env]??n);if(!Number.isInteger(limit)||limit<1||limit>365)throw Error('Konfigurasi retensi tidak valid.');
 const buckets=new Set();for(const r of rows){if(r.expires<=now)continue;const bucket=group(r.at);if(buckets.size<limit&&!buckets.has(bucket)){buckets.add(bucket);keep.add(r.id)}}}
 for(const r of rows)if(!keep.has(r.id)){for(const ext of ['enc','json']){const f=join(/*turbopackIgnore: true*/ dir,r.id+'.'+ext);if(existsSync(/*turbopackIgnore: true*/ f))unlinkSync(/*turbopackIgnore: true*/ f)}}
}
export function due(dir,now=Date.now()){const hours=Number(process.env.BACKUP_INTERVAL_HOURS??24);if(!Number.isFinite(hours)||hours<=0)throw Error('Interval backup tidak valid.');return !history(dir).some(r=>r.reason==='scheduled'&&now-r.at<hours*3600000&&r.expires>now)}

