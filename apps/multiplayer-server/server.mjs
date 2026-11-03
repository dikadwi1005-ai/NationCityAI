import {currentRole,maintain} from '../../packages/government/service.mjs';
import {purge} from '../../packages/chat/storage.ts';
import {database} from '../../packages/citizens/db.ts';
import {LocalChat} from './chat.mjs';
﻿import {Room,Server} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {store} from '../../packages/persistence/store.ts';
import {profile,redeem,savePosition,sessionId} from '../../packages/citizens/db.ts';
import {Land,Spatial,cell} from '../../packages/multiplayer/spatial.ts';
import {islands,emptyGeo} from '../../packages/nation-core/geography.ts';
const active=new Map();
purge(database());
setInterval(()=>{purge(database());maintain(database())},60000).unref();
class Nation extends Room{
 onCreate(){
 this.people=new Map();this.land=new Land(store().read());this.lastCheck=0;this.chat=new LocalChat(this,active);
 this.onMessage('input',(c,m)=>{const p=this.people.get(c.sessionId);if(!p||!this.allow(p)||!m||![m.x,m.z].every(v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=1))return;
 p.input={x:m.x,z:m.z,run:m.run===true};p.lastInput=Date.now()});
 this.onMessage('gesture',(c,m)=>{const p=this.people.get(c.sessionId);if(p&&this.allow(p)&&(['wave','point','celebrate'].includes(m)||p.role&&['ceremony','speech','announcement'].includes(m))){p.gesture=m;p.until=Date.now()+1600}});
 this.onMessage('travel',(c,id)=>{const p=this.people.get(c.sessionId);if(!p||!this.allow(p))return;if(Date.now()-p.travel<1200){c.send('notice','Tunggu sebentar sebelum bepergian lagi.');return}
 p.travel=Date.now();try{const next=this.land.spawn(id);savePosition(p.id,next);Object.assign(p,next);p.input={x:0,z:0};p.area='';this.chat.transfer(p);c.send('transition',next.island)}catch{c.send('notice','Tujuan tidak tersedia.')}});
 this.setSimulationInterval(dt=>this.tick(Math.min(dt,100)/1000),100);
 }
 allow(p){const t=Date.now();if(t-p.window>=1000){p.window=t;p.count=0}if(++p.count>100){p.client.leave(4008);return false}return p.count<=30}
 onAuth(c,opts){const session=redeem(opts.ticket),id=sessionId(session),citizen=profile(id);if(!citizen.look)throw Error('Buat karakter terlebih dahulu.');return {session,citizen}}
 onJoin(c,opts,auth){const {citizen:a,session}=auth;
 const old=active.get(a.id);if(old){savePosition(old.id,old);old.client.leave(4001)}
 const saved=old??a.location;const pos=saved&&this.land.valid(saved)?{x:saved.x,z:saved.z,island:saved.island}:this.land.spawn('island-001');
 const p={...pos,id:a.id,client:c,session,look:a.look,angle:0,input:{x:0,z:0},lastInput:0,until:0,gesture:'',window:0,count:0,area:'',travel:0,lastSave:Date.now()};
 active.set(a.id,p);this.people.set(c.sessionId,p);this.chat.join(p);this.chat.rebuild();c.send('identity',a.id);
 }
 tick(dt){const now=Date.now();if(now-this.lastCheck>1000){this.lastCheck=now;
 this.officials=database().prepare("SELECT 1 FROM sqlite_master WHERE name='office_terms'").get()?database().prepare('SELECT o.title,o.building,t.citizen,t.uniform,a.look FROM office_terms t JOIN offices o ON o.id=t.office JOIN appearances a ON a.id=t.citizen AND a.version=(SELECT max(version) FROM appearances WHERE id=t.citizen) WHERE t.archived IS NULL AND t.ends>? AND o.building IS NOT NULL').all(now):[];
 if(store().db.prepare('SELECT revision FROM worlds LIMIT 1').get().revision!==this.land.world.revision)this.land=new Land(store().read());
 for(const p of this.people.values()){if(!sessionId(p.session)){p.client.leave(4003);continue}p.look=profile(p.id).look??p.look;p.role=currentRole(database(),p.id);if(!this.land.valid(p)){try{Object.assign(p,this.land.spawn(p.island))}catch{try{Object.assign(p,this.land.spawn('island-001'))}catch{p.client.leave(4004)}}}if(now-p.lastSave>5000){savePosition(p.id,p);p.lastSave=now}}
 }
 const index=new Spatial();for(const p of this.people.values()){if(active.get(p.id)!==p)continue;
 const {x,z,run}=p.input,len=Math.hypot(x,z);let moved=false;if(len&&now-p.lastInput<450){const step=(run?7:4)*dt/Math.max(1,len);
 const dest={x:p.x+x*step,z:p.z+z*step,island:p.island};if(this.land.valid(dest)&&Math.abs(this.land.sample(dest.x,dest.z).h-this.land.sample(p.x,p.z).h)<.9){Object.assign(p,dest);p.angle=Math.atan2(x,z);moved=true}}
 p.motion=moved?(run?'run':'walk'):p.until>now?p.gesture:'idle';index.add(p)}
 this.chat.tick(index,now);
 for(const p of this.people.values()){if(active.get(p.id)!==p)continue;const area=[cell(p.x),cell(p.z),p.island,this.land.world.revision].join('/');
 if(p.area!==area){p.client.send('area',{world:this.land.area(p),islands:islands(this.land.world.geo??emptyGeo).map(({id,name})=>({id,name}))});p.area=area}
 const visible=index.near(p.x,p.z,Number(process.env.VISIBILITY_RADIUS)||180).map(q=>({id:q.id,x:q.x,z:q.z,island:q.island,y:this.land.sample(q.x,q.z).h,angle:q.angle,motion:q.motion,title:q.role?.title,office:q.role?.building,look:{...q.look,...(q.role?.uniform?{color:'#354b70',outfit:'jaket'}:{}),name:q.look.showName?q.look.name:''}}));
 const officials=(this.officials??[]).flatMap(t=>{const hall=this.land.world.objects.find(o=>o.id===t.building);if(!hall||Math.hypot(p.x-hall.x,p.z-hall.z)>100)return [];const look=JSON.parse(t.look);return [{id:'office-'+t.citizen,x:hall.x+2.5,z:hall.z,y:this.land.sample(hall.x+2.5,hall.z).h,island:p.island,angle:0,motion:'ceremony',title:t.title,look:{...look,...(t.uniform?{color:'#354b70'}:{}),name:'Kantor ? '+t.title}}]});const key=JSON.stringify(officials);if(p.officials!==key){p.officials=key;p.client.send('officials',officials)}
 p.client.send('players',visible)}
 }
 onLeave(c){const p=this.people.get(c.sessionId);if(!p)return;if(active.get(p.id)===p){savePosition(p.id,p);active.delete(p.id)}this.people.delete(c.sessionId)}
}
const server=new Server({transport:new WebSocketTransport({maxPayload:4096}),greet:false});
server.define('nation',Nation);
await server.listen(Number(process.env.MULTIPLAYER_PORT)||2567,process.env.MULTIPLAYER_HOST||'127.0.0.1');
console.log('Nation multiplayer ready');
