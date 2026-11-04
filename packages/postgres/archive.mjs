import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {tables} from '../../scripts/postgres-export.mjs';
import {indexes} from '../government/schema.mjs';
const day=86400000,asJson=new Set(['worlds.state','world_events.command','world_events.snapshot','appearances.look','citizens.location','chat_reports.evidence']);
function stable(x){if(Array.isArray(x))return x.map(stable);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])]));return x}
function normalized(t,row){return Object.fromEntries(Object.entries(row).map(([k,v])=>[k,v!==null&&asJson.has(t+'.'+k)&&typeof v==='string'?JSON.parse(v):v]))}
function signature(t,rows){const h=createHash('sha256');for(const r of rows.map(x=>JSON.stringify(stable(normalized(t,x)))).sort())h.update(r+'\n');return h.digest('hex')}
function retained(table,now){const age=table==='chat_reports'?27:table==='moderation_audit'?87:0;return age?' WHERE created>'+Math.trunc(now-age*day):''}
export function fromSqlite(file,{requireComplete=false}={}){
 const db=new DatabaseSync(file,{readOnly:true}),rows={},at=Date.now();try{db.exec('BEGIN');
 for(const t of Object.keys(tables)){const exists=db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t);if(requireComplete&&!exists)throw Error('Schema sumber belum lengkap: '+t);rows[t]=exists?db.prepare('SELECT * FROM '+t+retained(t,at)).all().map(r=>normalized(t,r)):[]}
 if(requireComplete){
  const versions=new Set(rows.schema_migrations.map(r=>r.version));
  if([1,2,5].some(v=>!versions.has(v))||[...versions].some(v=>![1,2,5].includes(v)))throw Error('Versi migrasi SQLite tidak sesuai Phase 1–5.');
  if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||db.prepare('PRAGMA foreign_key_check').get())throw Error('Integritas sumber tidak valid.');
  const omitted=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().filter(r=>!Object.hasOwn(tables,r.name)&&!['citizen_sessions','play_tickets'].includes(r.name));
  if(omitted.length)throw Error('Tabel sumber belum dipetakan: '+omitted.map(r=>r.name).join(', '));
 }
 if(rows.worlds.length!==1)throw Error('Sumber harus berisi satu dunia.');db.exec('COMMIT');return {format:1,at,rows}
 }finally{db.close()}}
export async function fromPg(db){
 const rows={},at=Date.now();await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of Object.keys(tables))rows[t]=(await db.query('SELECT * FROM nation_import.'+t+retained(t,at))).rows.map(r=>normalized(t,r));
 await db.query('COMMIT');return {format:1,at,rows}
 }catch(e){await db.query('ROLLBACK');throw e}}
function sqlValue(t,k,v){return v!==null&&asJson.has(t+'.'+k)?JSON.stringify(v):v}
export async function importArchive(db,archive,runtimeRole,expectedDb){
 if(archive.format!==1||!expectedDb||!/^[a-z_][a-z0-9_]{1,62}$/.test(runtimeRole??''))throw Error('Target atau role tidak valid.');
 const {rows:[target]}=await db.query('SELECT current_database() AS db,current_user AS owner');
 if(target.db!==expectedDb||target.owner===runtimeRole)throw Error('Database tujuan atau pemisahan role tidak sesuai.');
 const role=(await db.query('SELECT rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolreplication FROM pg_roles WHERE rolname=$1',[runtimeRole])).rows[0];if(!role||Object.values(role).some(Boolean))throw Error('Runtime harus memakai role biasa.');
 if((await db.query('SELECT pg_has_role($1,$2,\'MEMBER\') AS privileged',[runtimeRole,target.owner])).rows[0].privileged)throw Error('Runtime tidak boleh mewarisi peran pemilik.');
 const report={};await db.query('BEGIN');try{
 await db.query('CREATE SCHEMA nation_import; REVOKE ALL ON SCHEMA nation_import FROM PUBLIC; SET LOCAL search_path TO nation_import,pg_catalog');
 for(const [t,ddl] of Object.entries(tables)){
 const list=archive.rows[t];if(!Array.isArray(list))throw Error('Tabel sumber hilang: '+t);await db.query('CREATE TABLE '+t+' ('+ddl.replace('parent text REFERENCES gov_regions(id)','parent text REFERENCES gov_regions(id) DEFERRABLE INITIALLY DEFERRED')+')');
 const allowed=(await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='nation_import' AND table_name=$1",[t])).rows.map(c=>c.column_name);
 for(const row of list){const cols=Object.keys(row);if(!cols.length||cols.some(c=>!allowed.includes(c)))throw Error('Kolom arsip tidak sesuai.');
 await db.query('INSERT INTO '+t+' ('+cols.join(',')+') VALUES ('+cols.map((_,i)=>'$'+(i+1)).join(',')+')',cols.map(k=>sqlValue(t,k,row[k])))}
 const actual=(await db.query('SELECT * FROM '+t)).rows;
 if(actual.length!==list.length||signature(t,actual)!==signature(t,list))throw Error('Integritas tabel gagal: '+t);report[t]=actual.length;
 }
 await db.query("INSERT INTO gov_regions VALUES('nation-001','Nusantara Baru',NULL,0,1) ON CONFLICT DO NOTHING; INSERT INTO schema_migrations VALUES(5),(51) ON CONFLICT DO NOTHING");
 await db.query('SET CONSTRAINTS ALL IMMEDIATE');
 for(const idx of indexes)await db.query(idx);
 await db.query(`CREATE TABLE citizen_sessions(token text PRIMARY KEY,id text REFERENCES citizens(id),expires bigint NOT NULL);
 CREATE TABLE play_tickets(ticket text PRIMARY KEY,session text REFERENCES citizen_sessions(token) ON DELETE CASCADE,expires bigint NOT NULL);
 CREATE TABLE backup_runs(id text PRIMARY KEY,at bigint NOT NULL,reason text NOT NULL,status text NOT NULL,bytes bigint NOT NULL DEFAULT 0,sha256 text,restored_at bigint);
 CREATE VIEW construction_queue WITH (security_invoker=true) AS SELECT * FROM proposals WHERE status='APPROVED';
 CREATE VIEW official_assignments WITH (security_invoker=true) AS SELECT * FROM office_terms WHERE archived IS NULL;
 CREATE INDEX chat_pref_target ON chat_preferences(target,owner)`);
 const r='"'+runtimeRole+'"';await db.query('GRANT USAGE ON SCHEMA nation_import TO '+r);
 for(const t of [...Object.keys(tables),'citizen_sessions','play_tickets','backup_runs']){
 await db.query('ALTER TABLE '+t+' ENABLE ROW LEVEL SECURITY; REVOKE ALL ON '+t+' FROM PUBLIC; CREATE POLICY service_access ON '+t+' TO '+r+' USING(true) WITH CHECK(true); GRANT '+(t==='schema_migrations'?'SELECT':'SELECT,INSERT,UPDATE,DELETE')+' ON '+t+' TO '+r)}
 await db.query('COMMIT');return report
 }catch(e){await db.query('ROLLBACK');throw e}}
