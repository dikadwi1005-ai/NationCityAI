export type AdminKind='country'|'province'|'regency'|'city'|'subdistrict'|'village'|'district';
export type SceneId='capital'|'province'|'metropolis'|'city'|'regency'|'subdistrict'|'village'|'coast';
export type Bounds={x:number;z:number;w:number;d:number};
export type AdminRegion={id:string;name:string;kind:AdminKind;level:number;parent:string|null;bounds:Bounds;center:{x:number;z:number};island:string;development:number;scene?:SceneId};
export type SceneDefinition={id:SceneId;name:string;region:string;style:'national'|'provincial'|'metropolitan'|'municipal'|'regency'|'local'|'rural'|'coastal';extent:number;origin:{x:number;z:number};seed:number;overview:number;description:string};
export const ADMIN_LEVEL:Record<AdminKind,number>={country:0,province:1,regency:2,city:2,subdistrict:3,village:4,district:5};
const node=(id:string,name:string,kind:AdminKind,parent:string|null,x:number,z:number,w:number,d:number,island='aruna',scene?:SceneId,development=3):AdminRegion=>({id,name,kind,level:ADMIN_LEVEL[kind],parent,bounds:{x,z,w,d},center:{x,z},island,scene,development});
export const ADMIN_REGIONS:AdminRegion[]=[
 node('demo-nation','Republik Nusantara · sandbox','country',null,0,0,60000,40000,'archipelago'),
 node('demo-aruna','Provinsi Aruna','province','demo-nation',-12000,-1500,26000,18000,'aruna','province',4),
 node('demo-selatan','Provinsi Selatan','province','demo-nation',14000,4000,20000,18000,'selatan',undefined,2),
 node('demo-capital','Kota Ibu Negara','city','demo-aruna',-15000,-2500,1400,1400,'aruna','capital',5),
 node('demo-metro','Kota Surya Metropolitan','city','demo-aruna',-11000,2000,2400,2000,'aruna','metropolis',5),
 node('demo-city','Kota Madya','city','demo-aruna',-7000,-1000,2200,2000,'aruna','city',3),
 node('demo-regency','Kabupaten Banyusari','regency','demo-selatan',15000,4000,6000,5000,'selatan','regency',2),
 node('demo-capital-sub','Kecamatan Pusat Negara','subdistrict','demo-capital',-15000,-2500,1000,1000),
 node('demo-metro-sub','Kecamatan Niaga Surya','subdistrict','demo-metro',-11000,2000,1200,1000),
 node('demo-city-sub','Kecamatan Madya Pesisir','subdistrict','demo-city',-6800,-800,900,900),
 node('demo-subdistrict','Kecamatan Sentana','subdistrict','demo-regency',16200,4500,1100,1100,'selatan','subdistrict',2),
 node('demo-capital-ward','Kelurahan Merdeka','village','demo-capital-sub',-15000,-2500,600,600),
 node('demo-metro-ward','Kelurahan Pusat Bisnis','village','demo-metro-sub',-11000,2000,700,600),
 node('demo-city-ward','Kelurahan Tanjung','village','demo-city-sub',-6700,-700,600,600),
 node('demo-village','Desa Banyuwangi','village','demo-subdistrict',16500,4700,420,420,'selatan','village',1),
 node('demo-cbd','Distrik Pemerintahan Nasional','district','demo-capital-ward',-15000,-2500,350,350),
 node('demo-business','Distrik Bisnis Surya','district','demo-metro-ward',-11000,2000,400,350),
 node('demo-coast','Distrik Pesisir Tanjung','district','demo-city-ward',-6600,-600,300,300,'aruna','coast',2),
 node('demo-farm','Kawasan Sawah Banyuwangi','district','demo-village',16500,4700,240,240,'selatan',undefined,1),
];
export const SCENES:SceneDefinition[]=[
 {id:'capital',name:'National Capital',region:'demo-capital',style:'national',extent:220,origin:{x:-15000,z:-2500},seed:101,overview:220,description:'Pusat negara: kompleks nasional, kementerian, skyline dan plaza.'},
 {id:'province',name:'Provincial Capital',region:'demo-aruna',style:'provincial',extent:170,origin:{x:-14000,z:-1000},seed:203,overview:170,description:'Pusat provinsi: kantor gubernur, kolektor dan kawasan layanan.'},
 {id:'metropolis',name:'Large City · Surya',region:'demo-metro',style:'metropolitan',extent:230,origin:{x:-11000,z:2000},seed:307,overview:230,description:'Kota besar: pusat bisnis vertikal, apartemen dan perkantoran.'},
 {id:'city',name:'Kota Madya',region:'demo-city',style:'municipal',extent:150,origin:{x:-7000,z:-1000},seed:409,overview:150,description:'Kota menengah: balai wali kota, niaga dan hunian campuran.'},
 {id:'regency',name:'Regency Center · Banyusari',region:'demo-regency',style:'regency',extent:150,origin:{x:15000,z:4000},seed:503,overview:150,description:'Pusat kabupaten: kantor bupati, pasar dan alun-alun.'},
 {id:'subdistrict',name:'Kecamatan Sentana',region:'demo-subdistrict',style:'local',extent:120,origin:{x:16200,z:4500},seed:601,overview:120,description:'Layanan kecamatan dengan permukiman lokal dan jalan penghubung.'},
 {id:'village',name:'Rural Village · Banyuwangi',region:'demo-village',style:'rural',extent:140,origin:{x:16500,z:4700},seed:709,overview:140,description:'Desa pertanian: balai desa, kebun, sawah dan peternakan kecil.'},
 {id:'coast',name:'Coastal District · Tanjung',region:'demo-coast',style:'coastal',extent:150,origin:{x:-6600,z:-600},seed:809,overview:150,description:'Wilayah pesisir: teluk, promenade, layanan pelabuhan dan rekreasi.'},
];
export const getScene=(id:string)=>SCENES.find(s=>s.id===id);
export const getAdmin=(id:string)=>ADMIN_REGIONS.find(r=>r.id===id);
export function adminPath(id:string):AdminRegion[]{const out:AdminRegion[]=[],seen=new Set<string>();let r=getAdmin(id);while(r){if(seen.has(r.id))throw Error('Siklus administrasi.');seen.add(r.id);out.unshift(r);r=r.parent?getAdmin(r.parent):undefined}return out}
export function sceneForRegion(id:string):SceneDefinition|undefined {const path=adminPath(id).reverse();for(const r of path){const s=SCENES.find(s=>s.region===r.id||s.id===r.scene);if(s)return s}return SCENES.find(s=>adminPath(s.region).some(r=>r.id===id))}
export function contains(a:Bounds,b:Bounds){return Math.abs(a.x-b.x)+b.w/2<=a.w/2&&Math.abs(a.z-b.z)+b.d/2<=a.d/2}
/** Same zero-based administrative levels as government, without granting any platform permission. */
export function governanceAddress(regionId:string){const r=getAdmin(regionId);if(!r)throw Error('Wilayah tidak dikenal.');return {regionId:r.id,level:r.level,parent:r.parent,platformAdmin:false as const}}
