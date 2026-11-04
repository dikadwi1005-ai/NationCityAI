import {definitions,indexes} from '../packages/government/schema.mjs';
﻿import {DatabaseSync} from 'node:sqlite';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
// Destination schema must be new. The source is opened read-only and live tokens never leave SQLite.
export const tables={
 schema_migrations:'version integer PRIMARY KEY',
 worlds:'id text PRIMARY KEY, revision bigint NOT NULL, state jsonb NOT NULL',
 world_events:'request_id text PRIMARY KEY, revision bigint UNIQUE NOT NULL, actor text NOT NULL, command jsonb NOT NULL, snapshot jsonb NOT NULL, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
 terrain_chunks:'id text PRIMARY KEY, cx integer NOT NULL, cz integer NOT NULL, version bigint NOT NULL, generator text NOT NULL, UNIQUE(cx,cz)',
 citizens:"id text PRIMARY KEY, login text UNIQUE NOT NULL, secret text NOT NULL, joined timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, home text NOT NULL DEFAULT 'island-001', location jsonb",
 chat_preferences:'owner text REFERENCES nation_import.citizens(id), target text REFERENCES nation_import.citizens(id), kind text NOT NULL, PRIMARY KEY(owner,target)',
 chat_reports:'id text PRIMARY KEY, reporter text NOT NULL, sender text NOT NULL, message_id text NOT NULL, reason text NOT NULL, evidence jsonb NOT NULL, created bigint NOT NULL, resolved integer NOT NULL DEFAULT 0, UNIQUE(reporter,message_id)',
 chat_sanctions:'target text NOT NULL, kind text NOT NULL, until bigint NOT NULL, PRIMARY KEY(target,kind)',
 moderation_audit:'id text PRIMARY KEY, report text NOT NULL, target text NOT NULL, action text NOT NULL, actor text NOT NULL, created bigint NOT NULL',
 appearances:'id text REFERENCES nation_import.citizens(id), version integer, look jsonb NOT NULL, PRIMARY KEY(id,version)'
};
Object.assign(tables,definitions);
export function exportSql(path){const db=new DatabaseSync(path,{readOnly:true}),lines=['BEGIN;','CREATE SCHEMA nation_import;','REVOKE ALL ON SCHEMA nation_import FROM PUBLIC;'];
 try{db.exec('BEGIN');for(const [table,ddl] of Object.entries(tables)){
 lines.push('CREATE TABLE nation_import.'+table+' ('+ddl.replace(/REFERENCES (gov_regions|offices|elections|candidates|eligibility|citizens|office_terms)\(/g,'REFERENCES nation_import.$1(')+');','ALTER TABLE nation_import.'+table+' ENABLE ROW LEVEL SECURITY;');
 const exists=db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table);
 if(!exists){if(['worlds','world_events','terrain_chunks','schema_migrations'].includes(table))throw Error('Schema sumber tidak lengkap: '+table);continue}
 const cutoff=table==='chat_reports'?30:table==='moderation_audit'?90:0;const rows=cutoff?db.prepare('SELECT * FROM '+table+' WHERE created>?').all(Date.now()-cutoff*86400000):db.prepare('SELECT * FROM '+table).all();for(const row of rows){const keys=Object.keys(row);if(keys.some(k=>!/^\w+$/.test(k)))throw Error('Invalid column');
 const values=Object.values(row).map(v=>v===null?'NULL':" '"+String(v).replaceAll("'","''")+"'");lines.push('INSERT INTO nation_import.'+table+' ('+keys.join(',')+') VALUES ('+values.join(',')+');')}
 }db.exec('COMMIT');for(const sql of indexes)lines.push(sql.replace(/ ON (\w+)\(/,' ON nation_import.$1(')+';');lines.push('COMMIT;');return lines.join('\n');
 }finally{db.close()}}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const [source,out]=process.argv.slice(2);if(!source||!out)throw Error('Gunakan: node scripts/postgres-export.mjs <nation.sqlite> <tujuan.sql>');writeFileSync(out,exportSql(source),{flag:'wx',mode:0o600})}
