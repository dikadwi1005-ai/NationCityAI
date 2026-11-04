import {DatabaseSync} from 'node:sqlite';
import {existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {createHash} from 'node:crypto';
import {starterWorld} from '../packages/nation-core/world.ts';
import {tables as archiveTables} from './postgres-export.mjs';

// No WorldStore: opening an audit must never initialize or migrate its source.
export function auditSqlite(file){
 file=resolve(file);if(!existsSync(file))throw Error('Database sumber tidak ditemukan; audit menolak membuat database.');
 const db=new DatabaseSync(file,{readOnly:true});
 try{
  db.exec('BEGIN');
  const names=db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(r=>r.name);
  const counts={},signatures={};
  for(const t of names){
   const rows=db.prepare('SELECT * FROM "'+t.replaceAll('"','""')+'"').all();
   counts[t]=rows.length;
   signatures[t]=createHash('sha256').update(rows.map(r=>JSON.stringify(r)).sort().join('\n')).digest('hex');
  }
  const missingTables=[...Object.keys(archiveTables),'citizen_sessions','play_tickets'].filter(t=>!names.includes(t));
  const versions=names.includes('schema_migrations')?db.prepare('SELECT version FROM schema_migrations ORDER BY version').all().map(r=>r.version):[];
  const worlds=names.includes('worlds')?db.prepare('SELECT revision,state FROM worlds').all().map(r=>{
   const state=JSON.parse(r.state);
   const seed={...starterWorld(),geo:{strokes:[]}};
   return {revision:r.revision,objects:state.objects?.length,strokes:state.geo?.strokes?.length,terrainVersion:state.terrainVersion,matchesStarter:isDeepStrictEqual({...state,geo:state.geo??{strokes:[]}},seed)};
  }):[];
  const integrity=db.prepare('PRAGMA integrity_check').all().map(r=>r.integrity_check);
  const foreignKeyViolations=db.prepare('PRAGMA foreign_key_check').all().length;
  const schemaObjects=db.prepare("SELECT type,name FROM sqlite_master WHERE type IN ('view','index') AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  db.exec('COMMIT');
  const s=statSync(file);
  return {file,auditedAt:new Date().toISOString(),created:s.birthtime.toISOString(),mainFileBytes:s.size,walBytes:existsSync(file+'-wal')?statSync(file+'-wal').size:0,integrity,foreignKeyViolations,versions,missingTables,missingVersions:[1,2,5].filter(v=>!versions.includes(v)),schemaObjects,counts,signatures,worlds,seedOnly:worlds.length===1&&worlds[0].matchesStarter&&counts.world_events===0&&counts.citizens===0&&counts.gov_events===0};
 }finally{db.close()}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 if(!process.argv[2])throw Error('Gunakan: node scripts/audit-sqlite.mjs <database-yang-sudah-ada>');
 console.log(JSON.stringify(auditSqlite(process.argv[2]),null,2));
}
