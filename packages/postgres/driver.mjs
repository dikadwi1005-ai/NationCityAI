import {Worker,MessageChannel,receiveMessageOnPort} from 'node:worker_threads';
import {resolve} from 'node:path';
export function dialect(sql){
 if(sql==='BEGIN IMMEDIATE')return 'BEGIN; SELECT pg_advisory_xact_lock(792613)';
 if(sql.includes("FROM sqlite_master WHERE name='office_terms'"))return "SELECT 1 WHERE to_regclass('nation_import.office_terms') IS NOT NULL";
 let n=0;sql=sql.replace(/\?/g,()=>'$'+(++n)).replace(/unixepoch\((c\.)?joined\)/g,(_,p)=>'floor(extract(epoch from '+(p??'')+'joined))::bigint').replace(/max\(until,excluded.until\)/ig,'greatest(chat_sanctions.until,excluded.until)');
 if(sql.includes('INSERT OR IGNORE INTO'))sql=sql.replace('INSERT OR IGNORE INTO','INSERT INTO')+' ON CONFLICT DO NOTHING';
 return sql
}
// Keep the existing synchronous transaction boundary intact on a dedicated PG connection.
// No promise may be awaited between BEGIN and COMMIT in the domain executor.
export class PgDriver{
 constructor(){const {port1,port2}=new MessageChannel();this.port=port1;
 const path=resolve(/*turbopackIgnore: true*/ process.env.NATION_PROJECT_ROOT||process.cwd(),'packages/postgres/driver-worker.mjs');
 this.worker=new Worker(path,{execArgv:[],workerData:{port:port2},transferList:[port2]});this.worker.on('error',()=>{this.dead=true});this.worker.unref();port1.unref();this.kind='postgres'}
 query(sql,args=[]){if(this.dead)throw Error('PostgreSQL worker unavailable');const flag=new Int32Array(new SharedArrayBuffer(4));this.port.postMessage({sql:dialect(sql),args,flag});
 if(Atomics.wait(flag,0,0,30000)==='timed-out'){this.close();throw Error('PostgreSQL worker timeout')}
 const reply=receiveMessageOnPort(this.port)?.message;if(!reply||reply.error)throw Error(reply?.error||'PostgreSQL worker failed');return reply}
 exec(sql){this.query(sql)}prepare(sql){return {get:(...args)=>this.query(sql,args).rows[0],all:(...args)=>this.query(sql,args).rows,run:(...args)=>this.query(sql,args)}}
 close(){this.dead=true;this.port.close();void this.worker.terminate()}
}
