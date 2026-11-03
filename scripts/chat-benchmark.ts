import {Spatial} from '../packages/multiplayer/spatial.ts';
import {within} from '../packages/chat/policy.ts';
const people=Array.from({length:20000},(_,i)=>({id:String(i),x:(i%200)*12,z:Math.floor(i/200)*12,island:'main'})),s=new Spatial<typeof people[number]>();
const start=performance.now();people.forEach(p=>s.add(p));const indexed=performance.now()-start;
const timing=[];let count=0;for(let i=0;i<2000;i++){const t=performance.now();count+=within(s,people[(i*7919)%people.length],120).length;timing.push(performance.now()-t)}
timing.sort((a,b)=>a-b);console.log({players:people.length,queries:timing.length,buildMs:indexed,p50Ms:timing[1000],p95Ms:timing[1900],avgRecipients:count/timing.length});
