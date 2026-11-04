import type {World,WorldObject} from '../nation-core/world.ts';
import type {FixtureAsset} from './asset-registry';
export type FixtureBuilding={id:string;kind:FixtureAsset;name:string;x:number;z:number;rotation:number;w:number;d:number};
export type District={id:string;name:string;x:number;z:number;span:number};
export type DemoPresentation={kind:'visual-fixture';buildings:FixtureBuilding[];districts:District[]};
export type DemoWorld=World&{presentation:DemoPresentation};
export function demoPresentation(world:World):DemoPresentation|null {const p=(world as Partial<DemoWorld>).presentation;return p?.kind==='visual-fixture'?p:null}
export function avenue(world:World,o:WorldObject){return !!demoPresentation(world)&&o.asset==='road'&&(o.z===6||o.x===24)}
export function fixturePlacementConflict(world:World,o:WorldObject){return demoPresentation(world)?.buildings.some(b=>Math.abs(o.x-b.x)<b.w/2+1&&Math.abs(o.z-b.z)<b.d/2+1)??false}
