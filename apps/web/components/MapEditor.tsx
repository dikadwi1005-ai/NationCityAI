'use client';
import {useEffect,useMemo,useState} from 'react';
import {biomes,chunks,emptyGeo,islands,levels,regions,sample,tools,type Stroke} from '../../../packages/nation-core/geography';
import {applyCommand,type World} from '../../../packages/nation-core/world';
import type {CameraAction} from './Scene';
const labels=['Buat pulau','Perluas daratan','Hapus daratan','Naikkan terrain','Turunkan terrain','Haluskan terrain','Cat biome','Buat perairan','Wilayah administratif'];
type Props={brushSize:(n:number)=>void;world:World;admin:boolean;busy:boolean;point:{x:number;z:number};pick:(x:number,z:number)=>void;focus:(a:Omit<CameraAction,'serial'>)=>void;preview:(w:World|null)=>void;save:(s:Stroke)=>Promise<boolean>};
export default function MapEditor({brushSize,world,admin,busy,point,pick,focus,preview,save}:Props){
 const geo=world.geo??emptyGeo,list=islands(geo),areas=regions(geo);
 const [island,setIsland]=useState(list[0].id),[tool,setTool]=useState<Stroke['tool']>('island'),[name,setName]=useState('Pulau baru'),[radius,setRadius]=useState(12),[strength,setStrength]=useState(3),[biome,setBiome]=useState<Stroke['biome']>('grass'),[level,setLevel]=useState(1),[parent,setParent]=useState('nation-001'),[region,setRegion]=useState(''),[pending,setPending]=useState<Stroke|null>(null),[error,setError]=useState('');
 const area=useMemo(()=>{const totals=new Map<string,number>();for(const k of chunks(geo).keys()){const [cx,cz]=k.split(':').map(Number);for(let x=cx*16;x<cx*16+16;x++)for(let z=cz*16;z<cz*16+16;z++){const p=sample(geo,x+.5,z+.5);if(p.h>-.25&&p.island)totals.set(p.island,(totals.get(p.island)??0)+1)}}return totals},[geo]);
 useEffect(()=>{if(!islands(geo).some(i=>i.id===island))setIsland('island-001')},[geo,island]);
 const selected=list.find(i=>i.id===island)??list[0];
 function cancel(){setPending(null);preview(null);setError('')}
 function show(){try{const stroke:Stroke={type:'geo',tool,id:tool==='region'&&region?region:crypto.randomUUID(),island,x:point.x,z:point.z,radius,strength,biome,name,level,parent};const w=applyCommand(world,stroke);setPending(stroke);preview(w);setError('')}catch(e){cancel();setError(String(e))}}
 function overview(){let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const k of chunks(geo).keys()){const [x,z]=k.split(':').map(Number);minX=Math.min(minX,x*16);maxX=Math.max(maxX,(x+1)*16);minZ=Math.min(minZ,z*16);maxZ=Math.max(maxZ,(z+1)*16)}focus({kind:'focus',x:(minX+maxX)/2,z:(minZ+maxZ)/2,span:Math.max(maxX-minX,maxZ-minZ)})}
 return <section className="map-editor"><h2>Atlas negara</h2><button onClick={overview}>Ikhtisar nasional</button><label>Pulau<select aria-label="Pulau" value={island} onChange={e=>{cancel();setIsland(e.target.value);const i=list.find(i=>i.id===e.target.value)!;focus({kind:'focus',x:i.x,z:i.z});pick(i.x,i.z)}}>{list.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
 <small>{area.get(island)??0} m² · {geo.strokes.filter(s=>s.island===island||s.id===island).length} operasi aktif ? X {selected.x}, Z {selected.z}</small><details><summary>Identitas dan riwayat</summary><small>{selected.id}</small><ol>{geo.strokes.filter(s=>s.id===island||s.island===island&&s.tool!=='island').map((s,i)=><li key={i}>{labels[tools.indexOf(s.tool)]} ? ({s.x}, {s.z})</li>)}</ol></details>
 {admin&&<><fieldset disabled={!!pending||busy}><label>Operasi<select value={tool} onChange={e=>setTool(e.target.value as Stroke['tool'])}>{tools.map((t,i)=><option key={t} value={t}>{labels[i]}</option>)}</select></label>
 {tool==='region'&&<><label>Pilih wilayah<select value={region} onChange={e=>{setRegion(e.target.value);const r=areas.find(r=>r.id===e.target.value);if(r){setName(r.name);setLevel(r.level);setParent(r.parent);setRadius(r.radius);brushSize(r.radius);setIsland(r.island);pick(r.x,r.z);focus({kind:'focus',x:r.x,z:r.z})}}}><option value="">Wilayah baru</option>{areas.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label>Tingkat<select disabled={!!region} value={level} onChange={e=>{const n=+e.target.value;setLevel(n);setParent(n===1?'nation-001':areas.find(r=>r.level===n-1)?.id??'')}}>{levels.slice(1).map((l,i)=><option key={l} value={i+1}>{l}</option>)}</select></label>{level>1&&<label>Induk<select disabled={!!region} value={parent} onChange={e=>setParent(e.target.value)}>{areas.filter(r=>r.level===level-1).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>}</>}
 {(tool==='island'||tool==='region')&&<label>Nama<input value={name} maxLength={80} onChange={e=>setName(e.target.value)}/></label>}
 <p>Klik peta untuk memilih pusat brush, atau masukkan koordinat.</p><div className="map-coords">{(['x','z'] as const).map(k=><label key={k}>{k.toUpperCase()}<input type="number" value={point[k]} onChange={e=>pick(k==='x'?+e.target.value:point.x,k==='z'?+e.target.value:point.z)}/></label>)}</div>
 <label>Radius {radius} m<input type="range" min="2" max="40" value={radius} onChange={e=>{setRadius(+e.target.value);brushSize(+e.target.value)}}/></label>
 <label>Intensitas {strength}<input type="range" min="1" max="8" value={strength} onChange={e=>setStrength(+e.target.value)}/></label>
 <label>Biome<select value={biome} onChange={e=>setBiome(e.target.value as Stroke['biome'])}>{biomes.map(b=><option key={b}>{b}</option>)}</select></label>
 <button onClick={()=>{show();focus({kind:'focus',...point})}}>Pratinjau terrain</button></fieldset>
 {pending&&<div><strong>Pratinjau · belum disimpan</strong><button disabled={busy} onClick={async()=>{if(await save(pending)){cancel();if(pending.tool==='island')setIsland(pending.id)}}}>Simpan dunia</button><button disabled={busy} onClick={cancel}>Batalkan pratinjau</button></div>}
 {error&&<p role="alert">{error}</p>}</>}</section>
}
