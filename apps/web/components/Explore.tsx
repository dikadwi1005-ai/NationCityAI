'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Client,type Room} from 'colyseus.js';

import {useFrame,useThree} from '@react-three/fiber';
import {CanvasTexture,SRGBColorSpace,Vector3,type Group} from 'three';
import {Chibi} from '../../../packages/world-engine/Chibi';
import type {Avatar,Profile} from '../../../packages/citizens/model';
import type {World} from '../../../packages/nation-core/world';
import Scene from './Scene';
import LocalChat from './LocalChat';
import TouchJoystick from './TouchJoystick';
import QualityControls from './QualityControls';
import {useVisualSettings} from './visual-settings';
import {CITIZEN_SCALE} from '../../../packages/world-engine/visual-config';
import WorldActivityControls,{ActivityStatus} from './WorldActivityControls';
import type {Neighbor,LocalMessage,Preference} from '../../../packages/chat/policy';
const noop=()=>{},home={kind:'follow',serial:0};
function Nameplate({name}:{name:string}){
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=80;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#254b43';ctx.fillRect(0,0,512,80);ctx.font='bold 44px sans-serif';ctx.fillStyle='#fff8ea';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,256,40,488);const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;return t},[name]);
 useEffect(()=>()=>texture.dispose(),[texture]);return <sprite position={[0,.85,0]} scale={[2,.32,1]}><spriteMaterial map={texture} depthWrite={false}/></sprite>
}
function Person({a,follow}:{a:Avatar;follow:boolean}){
 const ref=useRef<Group>(null),prev=useRef(false),target=useRef(new Vector3());
 const controls=useThree(s=>s.controls) as unknown as {target:Vector3;update:()=>void}|null;
 useFrame(({camera},dt)=>{const g=ref.current;if(!g)return;target.current.set(a.x,a.y,a.z);
 if(!prev.current||g.position.distanceTo(target.current)>8){g.position.copy(target.current);prev.current=true}else g.position.lerp(target.current,1-Math.exp(-18*dt));
 g.rotation.y=a.angle;
 if(follow&&controls){target.current.copy(g.position);target.current.y+=.35;camera.position.add(target.current.clone().sub(controls.target));controls.target.copy(target.current);controls.update()}});
 return <group ref={ref}><group scale={CITIZEN_SCALE}><Chibi look={a.look} motion={a.motion}/></group>{a.look.name&&<Nameplate name={a.title&&!a.id.startsWith('office-')?a.title+' ? '+a.look.name:a.look.name}/>}</group>
}
export default function Explore({profile,onExit}:{profile:Profile;onExit?:()=>void}){
 const [world,setWorld]=useState<World|null>(null),[players,setPlayers]=useState<Avatar[]>([]),[dest,setDest]=useState<{id:string;name:string}[]>([]),[status,setStatus]=useState('Menghubungkan'),[notice,setNotice]=useState('');
 const [officials,setOfficials]=useState<Avatar[]>([]);
 const [low,setLow]=useState(()=>typeof window!=='undefined'&&window.innerWidth<650),[activity,setActivity]=useState(false);
 useEffect(()=>{useVisualSettings.getState().setQuality(low?'low':'medium')},[]);
 const joystick=useRef({x:0,z:0});
 const [peers,setPeers]=useState<Neighbor[]>([]),[messages,setMessages]=useState<LocalMessage[]>([]),[prefs,setPrefs]=useState<Preference[]>([]),[chatNotice,setChatNotice]=useState('');
 const socket=useRef<Room|null>(null),keys=useRef(new Set<string>());
 useEffect(()=>{let alive=true,timer:ReturnType<typeof setTimeout>;const down=(e:KeyboardEvent)=>{if((e.target as HTMLElement).matches('input,select'))return;if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','shift'].includes(e.key.toLowerCase())){e.preventDefault();keys.current.add(e.key.toLowerCase())}},up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase()),clear=()=>{keys.current.clear();joystick.current={x:0,z:0}};
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);
 async function connect(){try{
 const res=await fetch('/api/citizen',{method:'POST',body:JSON.stringify({action:'ticket'})});const b=await res.json();if(!alive)return;if(!res.ok){setStatus(b.error);return}
 const client=new Client(b.url||((location.protocol==='https:'?'wss://':'ws://')+location.hostname+':'+b.port));
 const room=await client.joinOrCreate('nation',{ticket:b.ticket});if(!alive){void room.leave();return}socket.current=room;setStatus('Terhubung');setNotice('');
 room.onMessage('chatContext',v=>{setPeers(v.peers);setMessages([]);setChatNotice('')});
 room.onMessage('chatMessage',(m:LocalMessage)=>setMessages(rows=>[...rows.filter(r=>r.id!==m.id).slice(-39),m]));
 room.onMessage('chatPrefs',v=>{setPrefs(v);setMessages([])});room.onMessage('chatNotice',setChatNotice);
 room.onMessage('officials',setOfficials);room.onMessage('identity',noop);room.onMessage('transition',noop);room.onMessage('notice',setNotice);
 room.onMessage('area',a=>{setWorld(a.world);setDest(a.islands)});room.onMessage('players',setPlayers);
 room.onLeave(code=>{if(!alive)return;socket.current=null;setPeers([]);setMessages([]);setPrefs([]);setChatNotice('');clear();setPlayers([]);setWorld(null);
 if(code===4001||code===4003){setStatus(code===4001?'Sesi dibuka di perangkat lain':'Sesi berakhir');return}
 setStatus('Menyambungkan kembali');timer=setTimeout(connect,800)});
 }catch{if(alive){setStatus('Menunggu server multiplayer');timer=setTimeout(connect,1500)}}}
 void connect();const send=setInterval(()=>{const k=keys.current;socket.current?.send('input',{x:Math.max(-1,Math.min(1,joystick.current.x+Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft')))),z:Math.max(-1,Math.min(1,joystick.current.z+Number(k.has('s')||k.has('arrowdown'))-Number(k.has('w')||k.has('arrowup')))),run:k.has('shift')})},100);
 return()=>{alive=false;clearTimeout(timer);clearInterval(send);clear();void socket.current?.leave();socket.current=null;window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear)}},[]);
 const me=players.find(p=>p.id===profile.id);
 return <div className="citizen-explore explorer-shell">
 <section className="world-canvas">{world&&<Scene activityIsland={me?.island} world={world} draft={null} selected={null} grid={false} low={low} action={home} onGround={noop} onHover={noop} onSelect={noop}>{[...players,...officials].map(a=><Person key={a.id} a={a} follow={a.id===profile.id}/>)}</Scene>}{status==='Terhubung'&&<LocalChat self={profile.id} peers={peers} messages={messages} prefs={prefs} notice={chatNotice} send={(t,v)=>socket.current?.send(t,v)}/>}</section>
 <header className="explore-top"><a href="/" className="game-brand">N<span>AI NATION<small>BUILDER</small></span></a><div><strong>{dest.find(i=>i.id===me?.island)?.name??'Jelajahi negara'}</strong><p role="status">{status}</p></div><label>Tujuan perjalanan<select aria-label="Tujuan perjalanan" value={me?.island??''} onChange={e=>socket.current?.send('travel',e.target.value)}>{dest.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label><button onClick={onExit}>Profil Warga</button></header>
 <ActivityStatus/><aside className="explore-peers"><small>WARGA TERLIHAT · {players.length}</small>{players.map(a=><div key={a.id} data-player={a.id} data-x={a.x} data-z={a.z}><i/>{a.look.name||'Warga'} {a.title} {a.id===profile.id?'(Anda)':''}</div>)}</aside>
 {notice&&<p className="travel-notice" role="status">{notice}</p>}
 <div className="explore-movement"><TouchJoystick change={(x,z)=>{joystick.current={x,z}}}/><div className="touch-directions">{['w','a','s','d'].map((k,i)=><button key={k} style={{touchAction:'none'}} aria-label={['↑','←','↓','→'][i]} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current.add(k)}} onLostPointerCapture={()=>keys.current.delete(k)}>{['↑','←','↓','→'][i]}</button>)}</div></div>
 <div className="explore-gestures">{['wave','point','celebrate'].map((v,i)=><button key={v} onClick={()=>socket.current?.send('gesture',v)}>{['Sapa','Tunjuk','Rayakan'][i]}</button>)}{me?.title&&<><strong>{me.title}</strong>{['ceremony','speech','announcement'].map((v,i)=><button key={v} onClick={()=>socket.current?.send('gesture',v)}>{['Upacara','Pidato','Pengumuman'][i]}</button>)}{world?.objects.some(o=>o.id===me.office&&Math.hypot(o.x-me.x,o.z-me.z)<8)&&<a href="/pemerintahan">Buka layanan kantor</a>}</>}</div>
 <details className="explore-activity" open={activity} onToggle={e=>setActivity(e.currentTarget.open)}><summary>World Activity · NPC simulasi</summary><QualityControls onChange={q=>setLow(q==='low')}/><WorldActivityControls/></details><footer className="explore-status"><span>WASD / panah · Shift untuk berlari</span><label><input type="checkbox" checked={low} onChange={e=>{setLow(e.target.checked);useVisualSettings.getState().setQuality(e.target.checked?'low':'medium')}}/> Grafis ringan</label></footer>
 </div>;
}
