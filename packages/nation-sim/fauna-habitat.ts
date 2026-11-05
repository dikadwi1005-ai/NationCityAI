import type{World}from'../nation-core/world.ts';import{sample,emptyGeo}from'../nation-core/geography.ts';import{traversable}from'../world-engine/living-world.ts';import{dimensions}from'./catalog.ts';import{roadEnvelope}from'./spatial.ts';import type{NationWorld}from'./regions.ts';
export type FaunaModel='Goat'|'Shiba'|'Chicken'|'Pigeon'|'Seagull';
export type FaunaAgent={id:string;model:FaunaModel;x:number;z:number;flying:boolean;phase:number};
export const FAUNA_HEIGHT:Record<FaunaModel,number>={Goat:.95/3,Shiba:.45/3,Chicken:.5/3,Pigeon:.3/3,Seagull:.4/3};
export function faunaHabitat(world:World,cap:number):FaunaAgent[]{
 const nation=(world as Partial<NationWorld>).nation,rural=nation?.scene==='village',coastal=nation?.scene==='coast',result:FaunaAgent[]=[],geo=world.geo??emptyGeo;
 const add=(model:FaunaModel,x:number,z:number,flying=false)=>{if(result.length>=cap)return;for(const[dx,dz]of[[0,0],[2,0],[-2,0],[0,2],[0,-2],[4,4],[-4,4],[-12,-4],[12,-4],[0,-12]]){const xx=x+dx,zz=z+dz;if(!traversable(world,xx,zz,.2)||nation?.buildings.some(b=>{const d=dimensions(b);return Math.abs(b.x-xx)<d.w/2+.8&&Math.abs(b.z-zz)<d.d/2+.8})||nation?.segments.some(r=>{const d=roadEnvelope(r);return Math.abs(d.x-xx)<d.w/2+.2&&Math.abs(d.z-zz)<d.d/2+.2}))continue;result.push({id:'fauna-'+result.length,model,x:xx,z:zz,flying,phase:result.length*1.7});return}};
 if(rural){add('Goat',-10,48);add('Goat',-13,48);add('Chicken',-24,46);add('Chicken',-22,47)}
 else if(coastal){add('Seagull',38,24);add('Seagull',40,26);add('Shiba',-8,8)}
 else{const homes=nation?.buildings.filter(b=>['house-two','cottage','townhouse'].includes(b.asset)).map(b=>({x:b.x,z:b.z+9}))??world.objects.filter(o=>o.asset==='house').map(b=>({x:b.x,z:b.z+2}));for(const h of homes.slice(0,2))add('Shiba',h.x,h.z);add('Pigeon',5,5);add('Pigeon',7,5)}
 add(coastal?'Seagull':'Pigeon',coastal?40:12,coastal?25:6,true);
 if(cap>5)add(coastal?'Seagull':'Pigeon',coastal?44:15,coastal?28:8,true);
 return result;
}
