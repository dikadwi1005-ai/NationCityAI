'use client';
import {useEffect,useRef,useState} from 'react';
import Scene,{type CameraAction} from './Scene';
import GameView from './GameView';
import {useEditor} from './editor';
import {REGION_ID,inverseCommand,placementError,type Command,type World,type WorldObject} from '../../../packages/nation-core/world';
type History={forward:Command;backward:Command};
async function json(res:Response){const data=await res.json();if(!res.ok)throw Error(data.error??'Permintaan gagal.');return data}
export default function Game(){
 const [world,setWorld]=useState<World|null>(null),[admin,setAdmin]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState('Memuat dunia…'),[error,setError]=useState(''),[hover,setHover]=useState({x:4,z:8}),[action,setAction]=useState<CameraAction>({kind:'home',serial:0}),[undo,setUndo]=useState<History[]>([]),[redo,setRedo]=useState<History[]>([]);
 const [atlas,setAtlas]=useState(false),[preview,setPreview]=useState<World|null>(null),[brushRadius,setBrushRadius]=useState(12),[point,setPoint]=useState({x:72,z:0});
 const previewId=useRef('');
 useEffect(()=>{previewId.current=crypto.randomUUID()},[]);
 const lock=useRef(false);const editor=useEditor();
 async function load(){try{const [w,s]=await Promise.all([fetch('/api/world',{cache:'no-store'}).then(json),fetch('/api/session',{cache:'no-store'}).then(json)]);setPreview(null);setWorld(w);setAdmin(s.admin);setStatus('Dunia tersimpan');setError('');setUndo([]);setRedo([])}catch(e){setError(String(e));setStatus('Gagal memuat')}}
 useEffect(()=>{void load()},[]);
 const chosen=world?.objects.find(o=>o.id===editor.selected);
 const draft:WorldObject|null=admin&&editor.tool!=='select'?editor.tool==='move'&&chosen?{...chosen,...hover,rotation:editor.rotation}:{id:previewId.current,asset:editor.asset,...hover,rotation:editor.rotation,regionId:REGION_ID,ownerId:'administrator',assetVersion:1}:null;
 async function send(command:Command,mode:'normal'|'undo'|'redo'='normal'){
 if(!world||lock.current||!admin)return false;lock.current=true;setBusy(true);setError('');setStatus('Menyimpan…');
 try{const backward=inverseCommand(world,command);const next:World=await fetch('/api/world',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),expectedRevision:world.revision,command})}).then(json);setWorld(next);setStatus('Tersimpan di server');
 if(mode==='normal'){setUndo(h=>[...h,{forward:command,backward}].slice(-50));setRedo([])}
 if(mode==='undo'){setUndo(h=>h.slice(0,-1));setRedo(h=>[...h,undo.at(-1)!])}
 if(mode==='redo'){setRedo(h=>h.slice(0,-1));setUndo(h=>[...h,redo.at(-1)!])}
 if(command.type==='remove')editor.set({selected:null,tool:'select'});
 return true;
 }catch(e){setError(e instanceof Error?e.message:String(e));setStatus('Belum tersimpan — coba lagi');return false}finally{lock.current=false;setBusy(false)}
 }
 function place(x:number,z:number){if(!draft||!world)return;const object={...draft,x,z};const issue=placementError(object,world.objects,world.geo);if(issue){setError(issue);return}if(editor.tool==='move'){void send({type:'transform',id:object.id,x,z,rotation:object.rotation});editor.set({tool:'select'})}else void send({type:'place',object:{...object,id:previewId.current}}).then(ok=>{if(ok){previewId.current=crypto.randomUUID();setHover(v=>({...v}))}})}
 useEffect(()=>{const handle=(e:KeyboardEvent)=>{if((e.target as HTMLElement).matches('input,textarea'))return;if(e.key==='Escape')editor.set({tool:'select'});if(e.key.toLowerCase()==='r')editor.set({rotation:(useEditor.getState().rotation+1)%4})};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle)},[editor.set]);
 return <GameView world={world} admin={admin} busy={busy} status={status} error={error} clearError={()=>setError('')} setAdmin={setAdmin} reload={load} editor={editor} chosen={chosen} draft={draft} hover={hover} place={place} send={send} undo={undo} redo={redo} action={action} setAction={setAction} atlas={atlas} setAtlas={setAtlas} preview={preview} setPreview={setPreview} point={point} setPoint={setPoint} brushRadius={brushRadius} setBrushRadius={setBrushRadius} beginMove={()=>{if(chosen){setHover({x:chosen.x,z:chosen.z});editor.set({tool:'move',rotation:chosen.rotation})}}}>
 {world?<Scene brush={atlas&&admin?{...point,radius:brushRadius}:undefined} world={preview??world} draft={draft} selected={editor.selected} grid={editor.grid&&admin} layers={editor.layers} low={editor.low} action={action} onGround={atlas?(x,z)=>{if(!preview)setPoint({x,z})}:place} onHover={(x,z)=>{if(!atlas)setHover({x,z})}} onSelect={id=>{if(atlas){const o=world.objects.find(o=>o.id===id);if(o&&!preview)setPoint({x:o.x,z:o.z})}else editor.set({selected:id,tool:'select'})}}/>:<div className="loading">Memuat kepulauan…</div>}
 </GameView>;
}
