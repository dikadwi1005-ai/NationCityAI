'use client';
import type {Asset} from '../nation-core/world';
import type {RoadConnections} from './asset-registry';
import Residential from './assets/Residential';
import {Government,Healthcare} from './assets/Civic';
import {Road,Tree,Park} from './assets/Environment';
export {Box} from './assets/primitives';
export type {RoadConnections} from './asset-registry';
export function Model({asset,variant=0,connections}:{asset:Asset;variant?:number;connections?:RoadConnections}){
 if(asset==='house')return <Residential variant={variant}/>;
 if(asset==='hall')return <Government/>;
 if(asset==='clinic')return <Healthcare/>;
 if(asset==='road')return <Road connections={connections}/>;
 if(asset==='tree')return <Tree variant={variant}/>;
 return <Park/>;
}
