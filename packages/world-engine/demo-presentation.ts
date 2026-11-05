import type {World,WorldObject} from '../nation-core/world.ts';
import type {FixtureAsset} from './asset-registry';
export type FixtureBuilding={id:string;kind:FixtureAsset;name:string;x:number;z:number;rotation:number;w:number;d:number};
export type District={id:string;name:string;x:number;z:number;span:number;role?:'capital'|'province'|'city'|'village'|'coastal'|'green';parentId?:string;level?:'national'|'province'|'city'|'village'|'landscape'};
export type DemoPresentation={kind:'visual-fixture';buildings:FixtureBuilding[];districts:District[];scenario?:'construction';avenues?:{axis:'x'|'z';value:number}[];reservedSites?:{x:number;z:number;w:number;d:number}[]};
export type DemoWorld=World&{presentation:DemoPresentation};
export function demoPresentation(world:World):DemoPresentation|null {const p=(world as Partial<DemoWorld>).presentation;return p?.kind==='visual-fixture'?p:null}
export function avenue(world:World,o:WorldObject){const p=demoPresentation(world);return !!p&&o.asset==='road'&&(p.avenues?p.avenues.some(a=>o[a.axis]===a.value):o.z===6||o.x===24)}
export function fixturePlacementConflict(world:World,o:WorldObject){return demoPresentation(world)?.buildings.some(b=>Math.abs(o.x-b.x)<b.w/2+1&&Math.abs(o.z-b.z)<b.d/2+1)??false}
