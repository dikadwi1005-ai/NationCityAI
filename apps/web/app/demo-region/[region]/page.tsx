import{notFound}from'next/navigation';import NationRegionGame from'../../../components/NationRegionGame';import{SCENES,getScene}from'../../../../../packages/nation-sim/atlas';
export function generateStaticParams(){return SCENES.map(s=>({region:s.id}))}
export default async function RegionPage({params}:{params:Promise<{region:string}>}){const{region}=await params,s=getScene(region);if(!s)notFound();return <NationRegionGame id={s.id}/>}
