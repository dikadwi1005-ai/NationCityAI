import {randomUUID} from 'node:crypto';
import {regions,emptyGeo} from '../nation-core/geography.ts';
import {restricted} from '../chat/storage.ts';
import {migrate} from './schema.mjs';
const day=86400000,nation='nation-001';
export const titles=[['Presiden','Wakil Presiden','Menteri'],['Gubernur','Wakil Gubernur'],['Bupati/Wali Kota','Wakil Bupati/Wali Kota'],['Camat'],['Kepala Desa/Lurah'],['Ketua RW'],['Ketua RT']];
function fail(s){throw Error(s)}
function text(v,max=500){if(typeof v!=='string'||!v.trim()||v.length>max)fail('Teks tidak valid.');return v.trim()}
function int(v,min,max){if(!Number.isSafeInteger(v)||v<min||v>max)fail('Angka tidak valid.');return v}
function one(v,values){if(!values.includes(v))fail('Pilihan tidak valid.');return v}
function event(db,kind,region,citizen,at,meta){db.prepare('INSERT INTO gov_events VALUES(?,?,?,?,?,?)').run(randomUUID(),kind,region,citizen,at,JSON.stringify(meta))}
function expire(db,now){for(const t of db.prepare('SELECT t.*,o.region FROM office_terms t JOIN offices o ON o.id=t.office WHERE archived IS NULL AND ends<=?').all(now)){db.prepare('UPDATE office_terms SET archived=ends WHERE id=?').run(t.id);event(db,'TERM_ENDED',t.region,t.citizen,t.ends,{term:t.id})}}
function sync(db,world,now){
 db.exec("INSERT INTO residency SELECT 'home-'||c.id,c.id,'nation-001',unixepoch(c.joined)*1000,NULL FROM citizens c WHERE NOT EXISTS(SELECT 1 FROM residency r WHERE r.citizen=c.id)");
 for(const r of regions(world.geo??emptyGeo).sort((a,b)=>a.level-b.level)){
 const prior=db.prepare('SELECT id FROM gov_regions WHERE id=?').get(r.id);
 db.prepare('INSERT INTO gov_regions VALUES(?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET name=excluded.name,parent=excluded.parent,active=1').run(r.id,r.name,r.parent,r.level);
 if(!prior)event(db,'REGION_ESTABLISHED',r.id,null,now,{name:r.name})
 }
 const ids=new Set([nation,...regions(world.geo??emptyGeo).map(r=>r.id)]);for(const r of db.prepare('SELECT id FROM gov_regions WHERE active=1').all())if(!ids.has(r.id))db.prepare('UPDATE gov_regions SET active=0 WHERE id=?').run(r.id);
 deadlines(db,now);
}
function deadlines(db,now){
 expire(db,now);
 for(const e of db.prepare("SELECT e.id,o.region FROM elections e JOIN offices o ON o.id=e.office WHERE state='VOTING' AND closes<=?").all(now)){db.prepare("UPDATE elections SET state='CLOSED' WHERE id=?").run(e.id);event(db,'ELECTION_CLOSED',e.region,null,now,{election:e.id})}
}
function local(db,region,target){while(region){if(region===target)return true;region=db.prepare('SELECT parent FROM gov_regions WHERE id=? AND active=1').get(region)?.parent}return false}
function inhabitants(db){return db.prepare("SELECT c.id,c.joined,COALESCE(r.region,'nation-001') region FROM citizens c LEFT JOIN residency r ON r.citizen=c.id AND r.ended IS NULL WHERE EXISTS(SELECT 1 FROM appearances a WHERE a.id=c.id)").all()}
function install(db,o,citizen,election,now){if(restricted(db,citizen,'account')||!db.prepare('SELECT 1 FROM appearances WHERE id=?').get(citizen))fail('Warga tidak aktif.');
 if(db.prepare('SELECT 1 FROM office_terms WHERE citizen=? AND office<>? AND archived IS NULL').get(citizen,o.id))fail('Jabatan warga bertentangan.');
 const prior=db.prepare('SELECT * FROM office_terms WHERE office=? AND archived IS NULL').get(o.id);if(prior){db.prepare('UPDATE office_terms SET archived=? WHERE id=?').run(now,prior.id);event(db,'TERM_ENDED',o.region,prior.citizen,now,{term:prior.id})}
 const id=randomUUID();db.prepare('INSERT INTO office_terms(id,office,citizen,election,starts,ends) VALUES(?,?,?,?,?,?)').run(id,o.id,citizen,election,now,now+o.days*day);event(db,'INAUGURATION',o.region,citizen,now,{term:id,office:o.id,election})}
const fields={reside:['region'],office:['region','title','days','minAge','method','building','permission'],appoint:['office','citizen'],election:['office','opens','closes','tie'],stage:['id','next'],apply:['id','program'],review:['id','status'],vote:['id','candidate'],proposal:['region','kind','description'],decision:['id','status'],schedule:['id','opens','closes'],announce:['office','description'],uniform:['office','enabled']};
const adminActions=new Set(['office','appoint','election','stage','review','decision','schedule']);
export function change(db,world,user,admin,b,now=Date.now()){
 if(!b||!Object.hasOwn(fields,b.action)||Object.keys(b).length!==fields[b.action].length+1||fields[b.action].some(k=>!Object.hasOwn(b,k)))fail('Format perintah tidak valid.');
 if(adminActions.has(b.action)?!admin:(!user||restricted(db,user,'account')))fail('Akses ditolak.');
 migrate(db);db.exec('BEGIN IMMEDIATE');try{const stored=db.prepare('SELECT state FROM worlds WHERE revision<>?').get(world.revision);if(stored)world=JSON.parse(stored.state);sync(db,world,now);
 const get=(sql,...args)=>db.prepare(sql).get(...args),run=(sql,...args)=>db.prepare(sql).run(...args);
 const region=id=>get('SELECT * FROM gov_regions WHERE id=? AND active=1',id)??fail('Wilayah tidak aktif.');
 const office=id=>get('SELECT * FROM offices WHERE id=?',id)??fail('Jabatan tidak ditemukan.');
 const race=id=>get('SELECT * FROM elections WHERE id=?',id)??fail('Pemilihan tidak ditemukan.');
 const home=id=>get('SELECT region FROM residency WHERE citizen=? AND ended IS NULL',id)?.region??nation;
 const candidateOK=(id,o)=>local(db,home(id),o.region)&&!restricted(db,id,'account')&&!!get("SELECT 1 FROM citizens WHERE id=? AND (unixepoch(joined)*1000)<=? AND EXISTS(SELECT 1 FROM appearances WHERE id=?)",id,now-o.min_age*day,id);
 let result=b.id??randomUUID();
 switch(b.action){
 case 'reside':{region(b.region);if(!get('SELECT 1 FROM appearances WHERE id=?',user))fail('Buat karakter dahulu.');
 const old=get('SELECT * FROM residency WHERE citizen=? AND ended IS NULL',user);if(old?.region===b.region||old&&!old.id.startsWith('home-')&&now-old.since<7*day)fail('Pindah domisili tersedia setelah tujuh hari.');
 for(const e of db.prepare("SELECT region FROM elections JOIN offices ON offices.id=elections.office WHERE state IN ('NOMINATION','REVIEW','VOTING')").all())if(local(db,home(user),e.region)||local(db,b.region,e.region))fail('Domisili terkunci selama pemilihan terkait.');
 if(old)run('UPDATE residency SET ended=? WHERE id=?',now,old.id);run('INSERT INTO residency VALUES(?,?,?,?,NULL)',result,user,b.region,now);break}
 case 'office':{region(b.region);if(b.building&&!world.objects.some(o=>o.id===b.building&&o.asset==='hall'))fail('Pilih balai dari dunia.');
 run('INSERT INTO offices VALUES(?,?,?,?,?,?,?,?)',result,text(b.title,70),b.region,one(b.method,['elected','appointed','custom']),int(b.days,1,3650),int(b.minAge,0,365),b.building||null,one(b.permission,['announce','none']));break}
 case 'appoint':{const o=office(b.office);if(o.method==='elected'||!candidateOK(b.citizen,o))fail('Pengangkatan tidak tersedia.');install(db,o,b.citizen,null,now);break}
 case 'election':{const o=office(b.office);region(o.region);if(o.method!=='elected')fail('Jabatan melalui pengangkatan.');int(b.opens,0,now+365*day);int(b.closes,Math.max(now,b.opens)+1,now+730*day);
 run("INSERT INTO elections VALUES(?,?,'DRAFT',?,?,?,?)",result,o.id,b.opens,b.closes,one(b.tie,['vacant','earliest']),now);break}
 case 'schedule':{const e=race(b.id);if(!['DRAFT','NOMINATION','REVIEW'].includes(e.state))fail('Jadwal sudah terkunci.');int(b.opens,0,now+365*day);int(b.closes,Math.max(b.opens,now)+1,now+730*day);run('UPDATE elections SET opens=?,closes=? WHERE id=?',b.opens,b.closes,e.id);break}
 case 'apply':{const e=race(b.id),o=office(e.office);if(e.state!=='NOMINATION'||!candidateOK(user,o))fail('Tidak memenuhi syarat pencalonan.');
 if(get("SELECT 1 FROM candidates c JOIN elections e ON e.id=c.election WHERE c.citizen=? AND c.status<>'REJECTED' AND e.state NOT IN ('CANCELLED','FINALIZED')",user)||get('SELECT 1 FROM office_terms WHERE citizen=? AND office<>? AND archived IS NULL',user,o.id))fail('Pencalonan bertentangan.');
 result=randomUUID();run("INSERT INTO candidates SELECT ?,?,?,?,'PENDING',coalesce(max(ordinal),0)+1 FROM candidates WHERE election=?",result,e.id,user,text(b.program),e.id);break}
 case 'review':{if(!get("SELECT 1 FROM candidates c JOIN elections e ON e.id=c.election WHERE c.id=? AND e.state='REVIEW'",b.id))fail('Bukan tahap seleksi.');run('UPDATE candidates SET status=? WHERE id=?',one(b.status,['APPROVED','REJECTED']),b.id);break}
 case 'stage':{const e=race(b.id),o=office(e.office),next=b.next;if(e.state==='FINALIZED'&&next==='FINALIZED'){db.exec('COMMIT');return e.id}
 const chain=['DRAFT','NOMINATION','REVIEW','VOTING','CLOSED','FINALIZED'];
 if(!chain.includes(e.state)||e.state==='FINALIZED'||(next!=='CANCELLED'&&next!==chain[chain.indexOf(e.state)+1]))fail('Transisi tahap tidak sah.');
 if(next==='VOTING'){region(o.region);if(now<e.opens||now>=e.closes||!get("SELECT 1 FROM candidates WHERE election=? AND status='APPROVED'",e.id))fail('Jadwal atau kandidat belum memenuhi syarat.');
 const minimumHours=Number(process.env.VOTER_MIN_AGE_HOURS??0);if(!Number.isFinite(minimumHours)||minimumHours<0)fail('Konfigurasi umur pemilih tidak valid.');
 for(const c of inhabitants(db))if(Date.parse(c.joined.replace(' ','T')+'Z')<=now-minimumHours*3600000&&local(db,c.region,o.region)&&!restricted(db,c.id,'account'))run('INSERT INTO eligibility VALUES(?,?,?)',e.id,c.id,c.region)}
 if(next==='FINALIZED'){
 run("INSERT INTO election_results SELECT c.election,c.id,count(b.nonce) FROM candidates c LEFT JOIN ballots b ON b.election=c.election AND b.candidate=c.id WHERE c.election=? AND c.status='APPROVED' GROUP BY c.election,c.id",e.id);
 const ranking=db.prepare('SELECT r.votes,c.citizen FROM election_results r JOIN candidates c ON c.id=r.candidate WHERE r.election=? ORDER BY r.votes DESC,c.ordinal').all(e.id);
 if(ranking[0]?.votes>0&&(ranking[0].votes!==ranking[1]?.votes||e.tie_rule==='earliest'))install(db,o,ranking[0].citizen,e.id,now)}
 run('UPDATE elections SET state=? WHERE id=?',next,e.id);event(db,'ELECTION_'+next,o.region,null,now,{election:e.id});break}
 case 'vote':{const e=race(b.id);if(e.state!=='VOTING'||now<e.opens||now>=e.closes||!get('SELECT 1 FROM eligibility WHERE election=? AND citizen=?',e.id,user))fail('Tidak berhak memilih pada waktu ini.');
 if(!get("SELECT 1 FROM candidates WHERE id=? AND election=? AND status='APPROVED'",b.candidate,e.id))fail('Kandidat tidak sah.');
 if(!run('INSERT OR IGNORE INTO participation VALUES(?,?)',e.id,user).changes)fail('Suara sudah tercatat.');
 run('INSERT INTO ballots VALUES(?,?,?)',randomUUID(),e.id,b.candidate);break}
 case 'proposal':{region(b.region);if(!candidateOK(user,{region:b.region,min_age:0}))fail('Usulan harus sesuai domisili.');
 run("INSERT INTO proposals VALUES(?,?,?,?,?,'SUBMITTED',?)",result,user,b.region,one(b.kind,['Jalan','Rumah sakit','Sekolah','Pelabuhan','Bandara','Taman','Lainnya']),text(b.description),now);event(db,'PROPOSAL_SUBMITTED',b.region,user,now,{proposal:result});break}
 case 'decision':{const p=get('SELECT * FROM proposals WHERE id=?',b.id);if(!p||!(p.status==='SUBMITTED'&&b.status==='REVIEWED'||p.status==='REVIEWED'&&['APPROVED','REJECTED'].includes(b.status)))fail('Transisi usulan tidak sah.');run('UPDATE proposals SET status=? WHERE id=?',b.status,b.id);event(db,'PROPOSAL_'+b.status,p.region,p.citizen,now,{proposal:p.id});break}
 case 'uniform':case 'announce':{const o=office(b.office),t=get('SELECT id FROM office_terms WHERE office=? AND citizen=? AND archived IS NULL',o.id,user);if(!t)fail('Bukan pejabat aktif.');
 if(b.action==='uniform'){if(typeof b.enabled!=='boolean')fail('Pilihan tidak valid.');run('UPDATE office_terms SET uniform=? WHERE id=?',Number(b.enabled),t.id)}else{if(o.permission!=='announce')fail('Izin pengumuman tidak tersedia.');event(db,'ANNOUNCEMENT',o.region,user,now,{text:text(b.description)})}break}
 }
 if(adminActions.has(b.action))run('INSERT INTO gov_audit VALUES(?,?,?,?,?)',randomUUID(),b.action+':'+(b.next??b.status??''),result,now,'administrator');
 db.exec('COMMIT');return result
 }catch(e){db.exec('ROLLBACK');throw e}}
export function maintain(db,now=Date.now()){
 if(!db.prepare("SELECT 1 FROM sqlite_master WHERE name='office_terms'").get())return;
 db.exec('BEGIN IMMEDIATE');try{deadlines(db,now);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
}
export function currentRole(db,id,now=Date.now()){if(!db.prepare("SELECT 1 FROM sqlite_master WHERE name='office_terms'").get())return null;return db.prepare('SELECT o.id,o.title,o.region,o.building,t.uniform FROM office_terms t JOIN offices o ON o.id=t.office WHERE t.citizen=? AND t.archived IS NULL AND t.ends>?').get(id,now)??null}
export function overview(db,world,user,admin,now=Date.now()){
 migrate(db);db.exec('BEGIN IMMEDIATE');try{sync(db,world,now);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
 const rows=(sql,...p)=>db.prepare(sql).all(...p);
 const candidates=rows("SELECT c.*,a.look FROM candidates c JOIN appearances a ON a.id=c.citizen AND a.version=(SELECT max(version) FROM appearances WHERE id=c.citizen) WHERE c.status='APPROVED' OR c.citizen=? OR ?=1",user??'',Number(admin));
 return {admin,user,regions:rows('SELECT g.*,(SELECT count(*) FROM residency r WHERE ended IS NULL AND region=g.id) residents FROM gov_regions g WHERE active=1 ORDER BY level,name'),offices:rows('SELECT * FROM offices'),elections:rows('SELECT * FROM elections ORDER BY created DESC'),candidates,terms:rows('SELECT t.*,a.look FROM office_terms t JOIN appearances a ON a.id=t.citizen AND a.version=(SELECT max(version) FROM appearances WHERE id=t.citizen) ORDER BY starts DESC'),results:rows('SELECT * FROM election_results'),eligibility:user?rows('SELECT e.election,EXISTS(SELECT 1 FROM participation p WHERE p.election=e.election AND p.citizen=e.citizen) voted FROM eligibility e WHERE citizen=?',user):[],residency:user?rows('SELECT * FROM residency WHERE citizen=? ORDER BY since DESC',user):[],proposals:rows('SELECT * FROM proposals ORDER BY created DESC'),events:rows('SELECT * FROM gov_events ORDER BY at DESC LIMIT 100'),audit:admin?rows('SELECT * FROM gov_audit ORDER BY at DESC LIMIT 100'):[],halls:world.objects.filter(o=>o.asset==='hall').map(({id,x,z})=>({id,x,z})),titles}
}
