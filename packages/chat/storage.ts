import type {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {reasons,type LocalMessage,type Preference} from './policy.ts';
export function initSafety(db:DatabaseSync){db.exec(`
 CREATE TABLE IF NOT EXISTS chat_preferences(owner TEXT REFERENCES citizens(id),target TEXT REFERENCES citizens(id),kind TEXT CHECK(kind IN ('mute','block')),PRIMARY KEY(owner,target));
 CREATE INDEX IF NOT EXISTS chat_pref_target ON chat_preferences(target,owner);
 CREATE TABLE IF NOT EXISTS chat_reports(id TEXT PRIMARY KEY,reporter TEXT NOT NULL,sender TEXT NOT NULL,message_id TEXT NOT NULL,reason TEXT NOT NULL,evidence TEXT NOT NULL,created INTEGER NOT NULL,resolved INTEGER NOT NULL DEFAULT 0,UNIQUE(reporter,message_id));
 CREATE TABLE IF NOT EXISTS chat_sanctions(target TEXT NOT NULL,kind TEXT NOT NULL,until INTEGER NOT NULL,PRIMARY KEY(target,kind));
 CREATE TABLE IF NOT EXISTS moderation_audit(id TEXT PRIMARY KEY,report TEXT NOT NULL,target TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,created INTEGER NOT NULL);
 `)}
export function preferences(db:DatabaseSync,id:string){return db.prepare('SELECT target,kind FROM chat_preferences WHERE owner=?').all(id) as unknown as Preference[]}
export function preference(db:DatabaseSync,owner:string,target:string,kind:string){
 if(owner===target||!['mute','block','clear'].includes(kind))throw Error('Pilihan tidak valid.');
 if(kind==='clear')db.prepare('DELETE FROM chat_preferences WHERE owner=? AND target=?').run(owner,target);
 else db.prepare('INSERT INTO chat_preferences VALUES(?,?,?) ON CONFLICT(owner,target) DO UPDATE SET kind=excluded.kind').run(owner,target,kind);
}
export function restricted(db:DatabaseSync,target:string,kind:string){return !!db.prepare('SELECT 1 FROM chat_sanctions WHERE target=? AND kind=? AND until>?').get(target,kind,Date.now())}
export function permitted(db:DatabaseSync,from:string,to:string){
 return !db.prepare("SELECT 1 FROM chat_preferences WHERE (owner=? AND target=?) OR (owner=? AND target=? AND kind='block') LIMIT 1").get(to,from,from,to)
}
export function report(db:DatabaseSync,reporter:string,m:LocalMessage,reason:string){
 if(reporter===m.sender||!reasons.some(s=>s===reason))throw Error('Laporan tidak valid.');
 db.prepare('INSERT OR IGNORE INTO chat_reports(id,reporter,sender,message_id,reason,evidence,created) VALUES(?,?,?,?,?,?,?)').run(randomUUID(),reporter,m.sender,m.id,reason,JSON.stringify(m),Date.now());
}
export function purge(db:DatabaseSync){const day=86400000,now=Date.now();db.prepare('DELETE FROM chat_reports WHERE created<=?').run(now-30*day);db.prepare('DELETE FROM moderation_audit WHERE created<=?').run(now-90*day);db.prepare('DELETE FROM chat_sanctions WHERE until<=?').run(now)}
export function moderate(db:DatabaseSync,id:string,action:string){
 if(!['dismiss','chat','account'].includes(action))throw Error('Tindakan tidak valid.');
 db.exec('BEGIN IMMEDIATE');try{const row=db.prepare('SELECT sender FROM chat_reports WHERE id=? AND resolved=0 AND created>?').get(id,Date.now()-30*86400000);if(!row)throw Error('Laporan sudah ditangani atau kedaluwarsa.');
 const target=String(row.sender),now=Date.now();
 if(action!=='dismiss')db.prepare('INSERT INTO chat_sanctions VALUES(?,?,?) ON CONFLICT(target,kind) DO UPDATE SET until=max(until,excluded.until)').run(target,action,now+(action==='chat'?3600000:86400000));
 if(action==='account')db.prepare('DELETE FROM citizen_sessions WHERE id=?').run(target);
 db.prepare('UPDATE chat_reports SET resolved=1 WHERE id=?').run(id);
 db.prepare('INSERT INTO moderation_audit VALUES(?,?,?,?,?,?)').run(randomUUID(),id,target,action,'administrator',now);
 db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
}
