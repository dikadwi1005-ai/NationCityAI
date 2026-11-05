import {getAdmin,adminPath,type SceneId,getScene} from './atlas.ts';
import {BUILDINGS,type NationBuilding} from './catalog.ts';
/** Adapter to the existing zero-based office hierarchy. A building never grants a platform session. */
export function governmentBinding(b:NationBuilding,scene:SceneId){
 const level=BUILDINGS[b.asset].governmentLevel;if(level===undefined)return null;
 const definition=getScene(scene);if(!definition)return null;
 const region=adminPath(definition.region).find(r=>r.level===level);if(!region)return null;
 const office=b.asset==='palace'?'president':b.asset==='ministry'?'ministry':b.asset==='governor'?'governor':b.asset==='regent'?'regent':b.asset==='mayor'?'mayor':b.asset==='camat'?'camat':'village-head';
 if(office==='regent'&&getAdmin(region.id)?.kind!=='regency'||office==='mayor'&&getAdmin(region.id)?.kind!=='city')return null;
 return {buildingId:b.id,regionId:region.id,level,office,platformAdmin:false as const,assignmentRequiresElectionOrAdmin:true};
}
