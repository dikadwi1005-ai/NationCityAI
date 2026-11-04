import {workerData} from 'node:worker_threads';
import {connection,nativeRows} from './connection.mjs';
nativeRows();const port=workerData.port;let db;
port.on('message',async({sql,args,flag})=>{
 try{if(!db){const next=connection();const clear=()=>{if(db===next)db=undefined};next.on('error',clear);next.on('end',clear);await next.connect();db=next}
 const result=await db.query(sql,args),last=Array.isArray(result)?result.at(-1):result;
 port.postMessage({rows:last?.rows??[],changes:last?.rowCount??0});
 }catch(e){port.postMessage({error:'PostgreSQL '+(e.code??'connection')+' '+(e.constraint??'')})}
 finally{Atomics.store(flag,0,1);Atomics.notify(flag,0)}
});
