import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname,resolve,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {getScene,type SceneId} from './atlas.ts';
import type {NationBuilding} from './catalog.ts';
import {buildingError,roadNetworkError,type RoadSegment,type SpatialContext} from './spatial.ts';
export type SandboxState={scene:SceneId;revision:number;extent:number;roads:RoadSegment[];buildings:NationBuilding[]};
export type SandboxRequest={requestId:string;expectedRevision:number;target:'sandbox';scene:SceneId;action:'apply'|'undo';buildings?:NationBuilding[];roads?:RoadSegment[];extent?:number;approved:boolean};
export class SandboxConflict extends Error{}
/** Separate database only. No import, open or fallback to the permanent world store. */
export class NationSandboxStore{
 db:DatabaseSync;readonly context:(id:SceneId)=>SpatialContext;
 constructor(path:string,context:(id:SceneId)=>SpatialContext){
  this.context=context;
  if(basename(path)!=='nation-sandbox.sqlite')throw Error('Sandbox requires its own explicit database filename.');
  mkdirSync(dirname(resolve(path)),{recursive:true});this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
   CREATE TABLE IF NOT EXISTS sandbox_regions(scene TEXT PRIMARY KEY,revision INTEGER NOT NULL,state TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS sandbox_audit(scene TEXT NOT NULL,revision INTEGER NOT NULL,request_id TEXT NOT NULL UNIQUE,hash TEXT NOT NULL,before_state TEXT NOT NULL,after_state TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,at TEXT NOT NULL,PRIMARY KEY(scene,revision));`);
 }
 read(scene:SceneId):SandboxState{if(!getScene(scene))throw Error('Unknown region.');const row=this.db.prepare('SELECT state FROM sandbox_regions WHERE scene=?').get(scene) as{state:string}|undefined;return row?JSON.parse(row.state):{scene,revision:0,extent:getScene(scene)!.extent,roads:this.context(scene).roads,buildings:this.context(scene).buildings}}
 execute(raw:SandboxRequest,platformAdmin:boolean):SandboxState{
  if(!platformAdmin||!raw.approved)throw Error('Explicit platform administrator approval required.');
  if(raw.target!=='sandbox'||!getScene(raw.scene)||!['apply','undo'].includes(raw.action)||!Number.isSafeInteger(raw.expectedRevision)||!/^[0-9a-f-]{36}$/i.test(raw.requestId))throw Error('Invalid sandbox request. Permanent mutations are not supported.');
  const hash=createHash('sha256').update(JSON.stringify(raw)).digest('hex');this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT hash,after_state FROM sandbox_audit WHERE request_id=?').get(raw.requestId) as{hash:string;after_state:string}|undefined;
   if(old){if(old.hash!==hash)throw new SandboxConflict('Idempotency key reused.');this.db.exec('COMMIT');return JSON.parse(old.after_state)}
   const before=this.read(raw.scene);if(before.revision!==raw.expectedRevision)throw new SandboxConflict('Sandbox revision changed. Reload before approval.');
   let buildings=raw.buildings,roads=raw.roads??before.roads,extent=raw.extent??before.extent;
   if(raw.action==='undo'){const previous=this.db.prepare('SELECT before_state FROM sandbox_audit WHERE scene=? AND revision=?').get(raw.scene,before.revision) as{before_state:string}|undefined;if(!previous)throw Error('No sandbox operation to undo.');const restored=JSON.parse(previous.before_state) as SandboxState;buildings=restored.buildings;roads=restored.roads;extent=restored.extent}
   if(!Array.isArray(buildings)||buildings.length>400||new Set(buildings.map(b=>b.id)).size!==buildings.length)throw Error('Invalid building list.');
   const context=this.context(raw.scene),definition=getScene(raw.scene)!;if(!Number.isSafeInteger(extent)||extent<definition.extent||extent>definition.extent*2)throw Error('Batas ekspansi sandbox tidak valid.');const roadIssue=roadNetworkError(roads,raw.scene,context.geo,extent);if(roadIssue)throw Error(roadIssue);
   for(const b of buildings){const issue=buildingError(b,{...context,extent,roads,buildings});if(issue)throw Error(issue)}
   const after:SandboxState={scene:raw.scene,revision:before.revision+1,extent,roads,buildings};
   this.db.prepare('INSERT INTO sandbox_regions VALUES(?,?,?) ON CONFLICT(scene) DO UPDATE SET revision=excluded.revision,state=excluded.state').run(raw.scene,after.revision,JSON.stringify(after));
   this.db.prepare('INSERT INTO sandbox_audit VALUES(?,?,?,?,?,?,?,?,?)').run(raw.scene,after.revision,raw.requestId,hash,JSON.stringify(before),JSON.stringify(after),raw.action,'platform-admin',new Date().toISOString());
   this.db.exec('COMMIT');return after;
  }catch(e){this.db.exec('ROLLBACK');throw e}
 }
 close(){this.db.close()}
}
