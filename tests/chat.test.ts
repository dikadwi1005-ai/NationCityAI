import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {Spatial} from '../packages/multiplayer/spatial.ts';
import {ChatLimits,parseMessage,within} from '../packages/chat/policy.ts';
import {initSafety,moderate,permitted,preference,purge,report,restricted} from '../packages/chat/storage.ts';
test('routing crosses cells and administrative regions but excludes beyond radius',()=>{
 const s=new Spatial<{x:number;z:number;id:string;island:string;region:string}>();
 const a={x:-1,z:0,id:'A',island:'i',region:'west'},b={...a,x:119,id:'B',region:'east'},c={...a,x:119.01,id:'C'};[a,b,c].forEach(p=>s.add(p));assert.deepEqual(within(s,a,120),[b]);b.x=120;assert.deepEqual(within(s,a,120),[])
});
test('only text and request ID; personal information and repeated abuse rejected',()=>{
 const valid={requestId:randomUUID(),text:'Halo!'};
 for(const extra of [{sender:'fake'},{x:30},{to:'B'},{text:'x'.repeat(281)},{text:'hubungi 0812-3456-7890'},{text:'alamat rumah saya'},{text:'mail@example.com'}])assert.throws(()=>parseMessage({...valid,...extra}));
 assert.equal(parseMessage({...valid,text:'<script>test</script>'}).text,'<script>test</script>');
 const l=new ChatLimits();l.accept('a','1','Hi',0);assert.throws(()=>l.accept('a','2','hi',2));assert.throws(()=>l.accept('a','1','other',3));for(let i=2;i<=4;i++)l.accept('a',String(i),String(i),50);assert.throws(()=>l.accept('a','5','5',100));l.accept('a','5','5',10001)
});
test('mute is directional, block mutual, report retained once, moderation atomic and expiring',()=>{
 const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE citizens(id TEXT PRIMARY KEY); INSERT INTO citizens VALUES('A'),('B');CREATE TABLE citizen_sessions(id TEXT); INSERT INTO citizen_sessions VALUES('A')");initSafety(db);
 preference(db,'B','A','mute');assert.ok(!permitted(db,'A','B'));assert.ok(permitted(db,'B','A'));preference(db,'B','A','block');assert.ok(!permitted(db,'B','A'));preference(db,'B','A','clear');assert.ok(permitted(db,'A','B'));
 const m={id:'1',sender:'A',name:'Aruna',color:'#ddd',text:'test',time:Date.now()};report(db,'B',m,'Spam');report(db,'B',m,'Spam');
 const rows=db.prepare('SELECT id FROM chat_reports').all();assert.equal(rows.length,1);moderate(db,String(rows[0].id),'account');assert.ok(restricted(db,'A','account'));assert.throws(()=>moderate(db,String(rows[0].id),'chat'));assert.equal(db.prepare('SELECT * FROM citizen_sessions').all().length,0);
 db.exec('UPDATE chat_reports SET created=0; UPDATE moderation_audit SET created=0; UPDATE chat_sanctions SET until=0');purge(db);for(const table of ['chat_reports','moderation_audit','chat_sanctions'])assert.equal(db.prepare('SELECT * FROM '+table).all().length,0);db.close()
});
