import {initSafety,restricted} from '../chat/storage.ts';
﻿import {randomBytes,randomUUID,scrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {store} from '../persistence/store.ts';
import {appearance,type Profile,type Position} from './model.ts';
const derive=promisify(scrypt);
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
let initialized=false;
export function database(){const db=store().db;if(!initialized){
 db.exec(`CREATE TABLE IF NOT EXISTS citizens(id TEXT PRIMARY KEY,login TEXT UNIQUE NOT NULL,secret TEXT NOT NULL,joined TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,home TEXT NOT NULL DEFAULT 'island-001',location TEXT);
 CREATE TABLE IF NOT EXISTS appearances(id TEXT REFERENCES citizens(id),version INTEGER,look TEXT NOT NULL,PRIMARY KEY(id,version));
 CREATE TABLE IF NOT EXISTS citizen_sessions(token TEXT PRIMARY KEY,id TEXT NOT NULL REFERENCES citizens(id),expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS play_tickets(ticket TEXT PRIMARY KEY,session TEXT NOT NULL REFERENCES citizen_sessions(token) ON DELETE CASCADE,expires INTEGER NOT NULL);`);initSafety(db);initialized=true}return db}
export async function authenticate(login:unknown,password:unknown,register:boolean){
 if(typeof login!=='string'||!/^\w{3,32}$/.test(login)||typeof password!=='string'||password.length<10||password.length>128)throw Error('Gunakan username 3–32 karakter dan sandi 10–128 karakter.');
 const db=database();login=login.toLowerCase();const row=db.prepare('SELECT id,secret FROM citizens WHERE login=?').get(String(login));
 const salt=register||!row?randomBytes(16).toString('hex'):String(row.secret).split(':')[0];
 const hash=await derive(password,salt,64) as Buffer;let id=String(row?.id);
 if(register){id=randomUUID();try{db.prepare('INSERT INTO citizens(id,login,secret) VALUES(?,?,?)').run(id,String(login),salt+':'+hash.toString('hex'))}catch{throw Error('Username tidak tersedia.')}}
 else if(!row||!timingSafeEqual(hash,Buffer.from(String(row.secret).split(':')[1],'hex')))throw Error('Login gagal.');
 if(restricted(db,id,'account'))throw Error('Akun sementara dibatasi.');
 const token=randomBytes(32).toString('hex');
 db.prepare('DELETE FROM citizen_sessions WHERE expires<=?').run(Date.now());
 db.prepare('INSERT INTO citizen_sessions VALUES(?,?,?)').run(digest(token),id,Date.now()+8*3600000);return token;
}
export function identify(token:string){return database().prepare('SELECT id FROM citizen_sessions WHERE token=? AND expires>?').get(digest(token),Date.now())?.id as string|undefined}
export function logout(token:string){database().prepare('DELETE FROM citizen_sessions WHERE token=?').run(digest(token))}
export function profile(id:string):Profile{const r=database().prepare('SELECT id,joined,home,location FROM citizens WHERE id=?').get(id)!;
 const a=database().prepare('SELECT version,look FROM appearances WHERE id=? ORDER BY version DESC LIMIT 1').get(id);
 const gov=database().prepare("SELECT 1 FROM sqlite_master WHERE name='office_terms'").get();
 const title=gov?database().prepare('SELECT title FROM offices JOIN office_terms ON office_terms.office=offices.id WHERE citizen=? AND archived IS NULL AND ends>?').get(id,Date.now())?.title:undefined;
 const residence=gov?database().prepare('SELECT name FROM gov_regions JOIN residency ON residency.region=gov_regions.id WHERE citizen=? AND ended IS NULL').get(id)?.name:undefined;
 return {id,title:title?String(title):undefined,residence:residence?String(residence):undefined,joined:String(r.joined),home:String(r.home),location:r.location?JSON.parse(String(r.location)):null,version:Number(a?.version??0),look:a?JSON.parse(String(a.look)):null}}
export function saveLook(id:string,raw:unknown){const look=appearance(raw);database().prepare('INSERT INTO appearances SELECT ?,COALESCE(MAX(version),0)+1,? FROM appearances WHERE id=?').run(id,JSON.stringify(look),id)}
export function savePosition(id:string,p:Position){database().prepare('UPDATE citizens SET location=? WHERE id=?').run(JSON.stringify({x:p.x,z:p.z,island:p.island}),id)}
export function ticket(token:string){const value=randomBytes(32).toString('hex'),db=database();db.prepare('DELETE FROM play_tickets WHERE expires<=?').run(Date.now());db.prepare('INSERT INTO play_tickets VALUES(?,?,?)').run(digest(value),digest(token),Date.now()+30000);return value}
export function sessionId(hash:string){return database().prepare('SELECT id FROM citizen_sessions WHERE token=? AND expires>?').get(hash,Date.now())?.id as string|undefined}
export function redeem(value:unknown){if(typeof value!=='string'||value.length!==64)throw Error('Tiket tidak valid.');
 const r=database().prepare('DELETE FROM play_tickets WHERE ticket=? AND expires>? RETURNING session').get(digest(value),Date.now());
 if(!r||!sessionId(String(r.session)))throw Error('Sesi kedaluwarsa.');return String(r.session)}

