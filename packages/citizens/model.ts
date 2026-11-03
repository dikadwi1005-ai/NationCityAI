export const defaults={name:'Warga',hair:'poni',face:'bulat',eyes:'cerah',hairColor:'#493128',outfit:'jaket',color:'#327b70',accessory:'syal',showName:true};
export type Look=typeof defaults;
export function appearance(raw:unknown):Look{
 if(!raw||typeof raw!=='object')throw Error('Karakter tidak valid.');
 const a=raw as Look;
 const choices={hair:['poni','kuncir','ikal'],face:['bulat','oval'],eyes:['cerah','senyum'],outfit:['jaket','tunik'],accessory:['syal','baret','tanpa']};
 for(const [k,values] of Object.entries(choices))if(!values.includes(a[k as keyof typeof choices]))throw Error('Pilihan karakter tidak valid.');
 if(typeof a.name!=='string'||!a.name.trim()||a.name.trim().length>32||![a.color,a.hairColor].every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))||typeof a.showName!=='boolean')throw Error('Nama, warna atau privasi tidak valid.');
 return Object.fromEntries(Object.keys(defaults).map(k=>[k,k==='name'?a.name.trim():a[k as keyof Look]])) as Look;
}
export type Position={x:number;z:number;island:string};
export type Avatar=Position&{id:string;look:Look;motion:string;y:number;angle:number};
export type Profile={id:string;joined:string;home:string;look:Look|null;version:number;location:Position|null};
