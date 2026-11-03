import {chunks,emptyGeo} from '../nation-core/geography.ts';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {applyCommand,starterWorld,requestSchema,type World} from '../nation-core/world.ts';
export class Conflict extends Error {}
/** Single-node durable adapter. SQLite WAL transaction covers state, events and request deduplication. */
export class WorldStore {
 readonly db:DatabaseSync;
 constructor(path:string){if(path!==':memory:')mkdirSync(resolve(path,'..'),{recursive:true});this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY); INSERT OR IGNORE INTO schema_migrations VALUES(1);
 CREATE TABLE IF NOT EXISTS worlds(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,state TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS world_events(request_id TEXT PRIMARY KEY,revision INTEGER UNIQUE NOT NULL,actor TEXT NOT NULL,command TEXT NOT NULL,snapshot TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS terrain_chunks(id TEXT PRIMARY KEY,cx INTEGER NOT NULL,cz INTEGER NOT NULL,version INTEGER NOT NULL,generator TEXT NOT NULL,UNIQUE(cx,cz));`);
 const seed=starterWorld();this.db.prepare('INSERT OR IGNORE INTO worlds VALUES(?,?,?)').run(seed.id,0,JSON.stringify(seed));
 const chunk=this.db.prepare('INSERT OR IGNORE INTO terrain_chunks VALUES(?,?,?,?,?)');
 for(let x=-3;x<=2;x++)for(let z=-2;z<=1;z++)chunk.run(`${x}:${z}`,x,z,1,'island-v1');
 this.db.exec(`BEGIN IMMEDIATE; UPDATE worlds SET state=json_set(state,'$.geo',json_object('strokes',json_array())) WHERE json_type(state,'$.geo') IS NULL; INSERT OR IGNORE INTO schema_migrations VALUES(2); COMMIT;`);
 }
 read():World{return JSON.parse((this.db.prepare('SELECT state FROM worlds LIMIT 1').get() as {state:string}).state)}
 mutate(input:unknown):World {
 const req=requestSchema.parse(input);this.db.exec('BEGIN IMMEDIATE');
 try {
 const previous=this.db.prepare('SELECT command FROM world_events WHERE request_id=?').get(req.requestId) as {command:string}|undefined;
 if(previous){if(previous.command!==JSON.stringify(req.command))throw new Conflict('Request ID sudah digunakan untuk perintah berbeda.');const current=this.read();this.db.exec('COMMIT');return current;}
 const world=this.read();if(world.revision!==req.expectedRevision)throw new Conflict('Dunia berubah di sesi lain. Muat ulang sebelum mencoba kembali.');
 const next=applyCommand(world,req.command);const json=JSON.stringify(next);
 if(req.command.type==='geo'||req.command.type==='undoGeo'){
 const stroke=req.command.type==='geo'?req.command:world.geo!.strokes.at(-1)!;
 if(stroke.tool!=='region'){
 const update=this.db.prepare('INSERT INTO terrain_chunks VALUES(?,?,?,?,?) ON CONFLICT(cx,cz) DO UPDATE SET version=excluded.version');
 for(let cx=Math.floor((stroke.x-stroke.radius)/16);cx<=Math.floor((stroke.x+stroke.radius)/16);cx++)
 for(let cz=Math.floor((stroke.z-stroke.radius)/16);cz<=Math.floor((stroke.z+stroke.radius)/16);cz++){
 const id=cx+':'+cz;
 if(chunks(next.geo??emptyGeo).has(id))update.run(id,cx,cz,next.terrainVersion,'terrain-ops-v2');
 else this.db.prepare('DELETE FROM terrain_chunks WHERE id=?').run(id);
 }}
 }
 this.db.prepare('UPDATE worlds SET revision=?,state=? WHERE id=?').run(next.revision,json,next.id);
 this.db.prepare('INSERT INTO world_events(request_id,revision,actor,command,snapshot) VALUES(?,?,?,?,?)').run(req.requestId,next.revision,'administrator',JSON.stringify(req.command),json);
 this.db.exec('COMMIT');return next;
 }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 close(){this.db.close()}
}
const shared=globalThis as typeof globalThis & {nationStore?:WorldStore};
export function store(){return shared.nationStore??=new WorldStore(join(process.env.WORLD_DATA_DIR??join(process.cwd(),'data'),'nation.sqlite'))}
