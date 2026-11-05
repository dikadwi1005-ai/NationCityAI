import {getScene,type SceneId} from './atlas.ts';
import {BUILDINGS,type BuildingKind,type NationBuilding,type Zone} from './catalog.ts';
import {buildingError,fitRoadsToTerrain,type RoadSegment} from './spatial.ts';
import type {Geo} from '../nation-core/geography.ts';
const centerAsset:Record<SceneId,BuildingKind>={capital:'palace',province:'governor',metropolis:'mayor',city:'mayor',regency:'regent',subdistrict:'camat',village:'village-hall',coast:'community'};
export function regionalLayout(scene:SceneId,geo:Geo){
 const s=getScene(scene)!,urban=scene==='capital'||scene==='metropolis',rural=scene==='village',step=rural?36:48,radius=urban?96:rural?36:72;
 let roads:RoadSegment[]=[];const buildings:NationBuilding[]=[];
 const axis=rural?[-36,0,36]:urban?[-96,-48,0,48,96]:[-72,-24,24,72];
 for(const a of axis)for(const direction of [0,1])roads.push({id:`${scene}-road-${direction}-${a}`,x1:direction?a:-radius,z1:direction?-radius:a,x2:direction?a:radius,z2:direction?radius:a,class:rural?'village':a===0||Math.abs(a)===20?'arterial':Math.abs(a)===48?'collector':'local'});
 const add=(asset:BuildingKind,x:number,z:number,zone:Zone,rotation:0|1|2|3=0)=>{const b:NationBuilding={id:`${scene}-building-${buildings.length}`,asset,version:1,x,z,rotation,zone,region:s.region,variant:buildings.length%8};if(!buildingError(b,{scene,geo,roads,buildings})){buildings.push(b);return true}return false};
 roads=fitRoadsToTerrain(roads,geo);
 // Civic precinct faces a reserved public forecourt; each administrative tier uses its own asset.
 const centers=axis.slice(0,-1).map(a=>a+step/2),primary=urban?24:rural?18:0;
 add(centerAsset[scene],primary,-primary,'civic');
 if(scene==='capital'){add('ministry',-24,-24,'civic');add('ministry',72,-24,'civic')}
 let index=0;
 for(const z of centers)for(const x of centers){
  if(buildings.some(b=>b.x===x&&b.z===z))continue;
  const business=urban&&(z>=0||x<0)||scene==='province'&&z<0||scene==='coast'&&x<0;
  let asset:BuildingKind=business?(urban?(['tower','apartment-high','office','hotel','apartment-mid'] as BuildingKind[])[index%5]:scene==='province'?'office':'hotel'):'house-two';
  if(scene==='city')asset=index%3===0?'apartment-mid':index%3===1?'shophouse':'house-two';
  if(scene==='regency')asset=index%3===0?'market':index%3===1?'apartment-low':'house-two';
  if(scene==='subdistrict')asset=index%3===0?'market':'cottage';
  if(rural)asset=index%3===0?'market':'cottage';
  if(index===2)asset='clinic';if(index===5&&!rural)asset='school';
  const zone:Zone=BUILDINGS[asset].zones.includes('civic')?'civic':BUILDINGS[asset].zones.includes('business')?'business':rural?'rural':'residential';
  if(asset==='cottage'||asset==='house-two'){
   for(const dx of [-8,8])for(const dz of [-8,8])add(asset,x+dx,z+dz,zone);
  }else add(asset,x,z,zone);
  index++;
 }
 return {roads,buildings};
}
