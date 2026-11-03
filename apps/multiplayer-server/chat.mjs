import {randomUUID} from 'node:crypto';
import {database,sessionId} from '../../packages/citizens/db.ts';
import {Spatial} from '../../packages/multiplayer/spatial.ts';
import {ChatLimits,parseMessage,within} from '../../packages/chat/policy.ts';
import {preferences,preference,report,restricted,permitted} from '../../packages/chat/storage.ts';

const limits=new ChatLimits();
const configured=Number(process.env.CHAT_RADIUS??120);
if(!Number.isFinite(configured)||configured<=0||configured>1000)throw Error('CHAT_RADIUS harus dalam (0,1000].');
const name=p=>p.look.showName?p.look.name:'Warga';
export class LocalChat{
 constructor(room,active){
 this.room=room;this.active=active;this.index=new Spatial();this.db=database();this.lastSweep=0;this.lastRoster=0;
 for(const [event,handler] of [['chatSend',this.send],['chatPreference',this.pref],['chatReport',this.report]]){
 room.onMessage(event,(c,data)=>{const p=room.people.get(c.sessionId);
 if(!p||active.get(p.id)!==p||!room.allow(p))return;
 try{if(sessionId(p.session)!==p.id||restricted(this.db,p.id,'account'))throw Error('Sesi warga tidak berlaku.');
 handler.call(this,p,data)}catch(e){c.send('chatNotice',e instanceof Error&&!/SQLITE|constraint/i.test(e.message)?e.message:'Permintaan chat gagal.')}})}
 }
 join(p){p.receipts=new Map();this.loadPrefs(p);p.chatContext=null}
 loadPrefs(p){p.prefs=new Map(preferences(this.db,p.id).map(r=>[r.target,r.kind]));p.client.send('chatPrefs',[...p.prefs].map(([target,kind])=>({target,kind})))}
 rebuild(){const index=new Spatial();for(const p of this.room.people.values())if(this.active.get(p.id)===p)index.add(p);this.index=index}
 peers(p){return within(this.index,p,configured).filter(q=>this.active.get(q.id)===q&&p.prefs.get(q.id)!=='block'&&q.prefs.get(p.id)!=='block')}
 update(p){const peers=this.peers(p).map(q=>({id:q.id,name:name(q)})).sort((a,b)=>a.id.localeCompare(b.id));
 const anchor=p.chatAnchor,reset=!anchor||anchor.island!==p.island||Math.hypot(p.x-anchor.x,p.z-anchor.z)>configured;
 const signature=JSON.stringify(peers);
 if(reset||p.chatContext!==signature){p.chatContext=signature;p.chatAnchor={x:p.x,z:p.z,island:p.island};p.client.send('chatContext',{peers,reset,scope:p.island})}}
 tick(index,now){this.index=index;if(now-this.lastSweep>=60000){limits.prune(now);for(const p of this.room.people.values())for(const [id,m] of p.receipts)if(now-m.time>=300000)p.receipts.delete(id);this.lastSweep=now}
 if(now-this.lastRoster>=250){this.lastRoster=now;for(const p of this.room.people.values())if(this.active.get(p.id)===p)this.update(p)}}
 transfer(p){p.chatAnchor=null;this.rebuild();for(const q of this.room.people.values())this.update(q)}
 send(p,data){
 const {text,requestId}=parseMessage(data);
 if(restricted(this.db,p.id,'chat')||!this.room.land.valid(p))throw Error('Chat sementara dibatasi.');
 const targets=this.peers(p).filter(q=>sessionId(q.session)===q.id&&this.room.land.valid(q)&&permitted(this.db,p.id,q.id));
 if(!targets.length)throw Error('Tidak ada penerima yang tersedia.');
 const now=Date.now();limits.accept(p.id,requestId,text,now);
 const m={id:randomUUID(),sender:p.id,name:name(p),color:p.look.color,hairColor:p.look.hairColor,time:now,text};
 for(const q of [p,...targets]){this.update(q);q.client.send('chatMessage',m);
 if(q!==p){q.receipts.set(m.id,m);if(q.receipts.size>64)q.receipts.delete(q.receipts.keys().next().value)}}
 }
 pref(p,data){if(!data||typeof data.target!=='string'||typeof data.kind!=='string')throw Error('Preferensi tidak valid.');
 if(!p.prefs.has(data.target)&&!this.peers(p).some(q=>q.id===data.target))throw Error('Warga tidak berada di sekitar.');
 preference(this.db,p.id,data.target,data.kind);this.loadPrefs(p);for(const q of this.room.people.values())this.update(q)}
 report(p,data){const m=p.receipts.get(data?.id);if(!m||Date.now()-m.time>=300000)throw Error('Bukti tidak tersedia.');
 report(this.db,p.id,m,data.reason);p.client.send('chatNotice','Laporan dikirim kepada moderator.')}
}
