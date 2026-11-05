import type {SceneId} from './atlas.ts';
export type Zone='residential'|'business'|'civic'|'rural'|'waterfront';
export type BuildingKind='cottage'|'house-two'|'townhouse'|'shophouse'|'apartment-low'|'apartment-mid'|'apartment-high'|'office'|'tower'|'hotel'|'mall'|'clinic'|'school'|'market'|'palace'|'ministry'|'governor'|'regent'|'mayor'|'camat'|'village-hall'|'community'|'landmark';
export type CatalogAsset={id:BuildingKind;name:string;lot:[number,number];body:[number,number];height:number;floors:number;setback:number;zones:Zone[];governmentLevel?:number};
const asset=(id:BuildingKind,name:string,lot:[number,number],body:[number,number],floors:number,zones:Zone[],height=floors*1.1+1,governmentLevel?:number):CatalogAsset=>({id,name,lot,body,height,floors,setback:2,zones,governmentLevel});
/** Domain units are 3 m. Lots reserve yards, pedestrian access and service space. */
export const BUILDINGS:Record<BuildingKind,CatalogAsset>=Object.fromEntries([
 asset('cottage','Rumah kebun',[10,12],[4,4],1,['residential','rural','waterfront'],2.2),
 asset('house-two','Rumah dua lantai',[10,12],[4.8,5.2],2,['residential','waterfront'],3.4),
 asset('townhouse','Townhouse',[10,12],[6,5],3,['residential'],4.2),
 asset('shophouse','Ruko beranda',[10,12],[6,6],3,['business','waterfront'],4),
 asset('apartment-low','Apartemen taman',[14,16],[8,8],5,['residential'],6.4),
 asset('apartment-mid','Apartemen teras',[16,18],[9,10],12,['residential','business'],14),
 asset('apartment-high','Menara hunian',[18,20],[9,10],28,['residential','business'],33),
 asset('office','Kantor beratrium',[16,18],[10,10],9,['business'],11.5),
 asset('tower','Menara pusat bisnis',[22,22],[12,12],38,['business'],44),
 asset('hotel','Hotel sayap taman',[18,20],[10,12],18,['business','waterfront'],22),
 asset('mall','Pusat belanja',[26,24],[18,14],4,['business'],6),
 asset('clinic','Klinik lingkungan',[16,18],[9,8],2,['civic','rural','waterfront'],3.5),
 asset('school','Sekolah berhalaman',[24,22],[16,12],3,['civic','rural'],4.8),
 asset('market','Pasar terbuka',[22,20],[14,10],1,['business','rural','waterfront'],3.2),
 asset('palace','Istana Republik',[36,30],[26,16],4,['civic'],9,0),
 asset('ministry','Kementerian',[24,24],[16,14],8,['civic'],10,0),
 asset('governor','Kantor Gubernur',[32,26],[22,14],5,['civic'],8,1),
 asset('regent','Pendopo Kabupaten',[28,24],[18,12],2,['civic'],6.5,2),
 asset('mayor','Balai Kota',[26,26],[16,14],5,['civic'],8.5,2),
 asset('camat','Kantor Kecamatan',[22,20],[14,10],2,['civic'],4,3),
 asset('village-hall','Kantor Desa',[18,18],[10,8],1,['civic','rural'],3.2,4),
 asset('community','Balai Warga',[16,16],[9,7],1,['civic','rural','residential'],3),
 asset('landmark','Tugu Persatuan',[12,12],[3,3],1,['civic','business'],12),
].map(a=>[a.id,a])) as Record<BuildingKind,CatalogAsset>;
export const HEIGHT_LIMIT:Record<SceneId,number>={capital:48,province:26,metropolis:55,city:18,regency:12,subdistrict:7,village:4,coast:24};
export type NationBuilding={id:string;asset:BuildingKind;version:1;x:number;z:number;rotation:0|1|2|3;zone:Zone;region:string;variant:number};
export function dimensions(b:NationBuilding,part:'lot'|'body'='lot'){const a=BUILDINGS[b.asset],s=a[part];return b.rotation%2?{w:s[1],d:s[0]}:{w:s[0],d:s[1]}}
