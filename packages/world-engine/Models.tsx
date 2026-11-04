'use client';
import type {Asset} from '../nation-core/world';
import type {RoadConnections} from './asset-registry';
import Residential from './assets/Residential';
import {Government,Healthcare} from './assets/Civic';
import CityRoad from './assets/CityRoad';
import {Plant,GardenPark} from './assets/Vegetation';
export {Box} from './assets/primitives';
export type {RoadConnections} from './asset-registry';
export function Model({asset,variant=0,connections,mainRoad=false}:{asset:Asset;variant?:number;connections?:RoadConnections;mainRoad?:boolean}){
 if(asset==='house')return <Residential variant={variant}/>;
 if(asset==='hall')return <Government/>;
 if(asset==='clinic')return <Healthcare/>;
 if(asset==='road')return <CityRoad connections={connections} main={mainRoad}/>;
 if(asset==='tree')return <Plant variant={variant}/>;
 return <GardenPark/>;
}
