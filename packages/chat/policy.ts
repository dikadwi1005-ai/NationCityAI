export type LocalMessage={id:string;sender:string;name:string;color:string;hairColor?:string;text:string;time:number};
export type Neighbor={id:string;name:string};
export type Preference={target:string;kind:string};
export const reasons=['Pelecehan','Informasi pribadi','Spam','Ancaman','Lainnya'] as const;
const protectedContent=/https?:|www\.|[-+]?\d{1,2}\.\d{3,}\s*[,;]\s*[-+]?\d{1,3}\.\d{3,}|[\w.+-]+\s*@\s*[\w.-]+\.[a-z]{2,}|(?:\d[\s().+-]*){7,}|\b(?:alamat rumah|nomor wa|nomor hp|whatsapp|kirim foto pribadi|kirim foto telanjang|nomor telepon|share lokasi|anjing lu|bangsat|kontol|memek|bunuh diri sana)\b/i;
export function parseMessage(raw:unknown){
 if(!raw||typeof raw!=='object'||Object.keys(raw).sort().join(',')!=='requestId,text')throw Error('Format pesan ditolak.');
 const {text,requestId}=raw as Record<string,unknown>;
 if(typeof requestId!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(requestId)||typeof text!=='string'||text.length>280)throw Error('Pesan maksimal 280 karakter.');
 const clean=text.normalize('NFKC').replace(/[\p{Cf}]/gu,'').trim();
 if(!clean||clean.length>280||/[\p{Cc}]/u.test(clean)||protectedContent.test(clean)||/(.)\1{11}/u.test(clean))throw Error('Pesan ditolak. Hindari spam, hinaan, kontak pribadi, dan tautan.');
 return {text:clean,requestId};
}
export class ChatLimits{
 entries=new Map<string,{id:string;text:string;time:number}[]>();
 accept(id:string,request:string,text:string,now:number){
 const recent=(this.entries.get(id)??[]).filter(r=>now-r.time<60000);
 const normal=text.toLowerCase().replace(/\s+/g,' ');
 if(recent.some(r=>r.id===request||r.text===normal))throw Error('Pesan duplikat.');
 if(recent.filter(r=>now-r.time<10000).length>=4||recent.length>=15)throw Error('Terlalu cepat. Tunggu sebelum mengirim lagi.');
 recent.push({id:request,text:normal,time:now});this.entries.set(id,recent);
 }
 prune(now:number){for(const [id,rows] of this.entries)if(now-rows[rows.length-1].time>=60000)this.entries.delete(id)}
}
export function within<T extends {id:string;x:number;z:number;island:string}>(index:{near:(x:number,z:number,r:number)=>T[]},sender:T,radius:number){
 return index.near(sender.x,sender.z,radius).filter(p=>p.id!==sender.id&&p.island===sender.island&&Math.hypot(p.x-sender.x,p.z-sender.z)<=radius);
}
