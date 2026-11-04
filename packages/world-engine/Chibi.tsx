'use client';
import {createContext,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {SphereGeometry,CylinderGeometry,MeshStandardMaterial,Vector3,type Group} from 'three';
import type {Look} from '../citizens/model';
type Vec=[number,number,number];
const sphere=new SphereGeometry(1,12,9),jack=new CylinderGeometry(.30,.37,.67,10),tunic=new CylinderGeometry(.30,.49,.67,10);
const Palette=createContext<Map<string,MeshStandardMaterial>>(new Map());
const fixedColors=['#e7aa83','#283532','#354953','#654c40','#f4d992','#fff5d6','#d98274','#955448','#965248','#e3a64e'];
const material=(color:string)=>new MeshStandardMaterial({color,roughness:.87,metalness:0,envMapIntensity:.13});
// A bounded immutable palette is shared; only user-selected colors belong to an avatar.
const fixedPalette=new Map(fixedColors.map(color=>[color,material(color)]));
function Ball({p,size,color}:{p:Vec;size:Vec;color:string}){const palette=useContext(Palette);return <mesh position={p} scale={size} castShadow geometry={sphere} material={palette.get(color)} dispose={null}/>}
export function Chibi({look,motion:baseMotion='idle',motionSource,paused=false,phase=0}:{look:Look;motion?:string;motionSource?:{current:string};paused?:boolean;phase?:number}){
 const customPalette=useMemo(()=>new Map([...new Set([look.color,look.hairColor])].filter(color=>!fixedPalette.has(color)).map(color=>[color,material(color)])),[look.color,look.hairColor]);
 const palette=useMemo(()=>new Map([...fixedPalette,...customPalette]),[customPalette]);
 useEffect(()=>()=>{for(const material of customPalette.values())material.dispose()},[customPalette]);
 const body=useRef<Group>(null),left=useRef<Group>(null),right=useRef<Group>(null),legA=useRef<Group>(null),legB=useRef<Group>(null);
 const strideState=useRef(0),animTime=useRef(0),lod=useRef(0),position=useRef(new Vector3());
 const [detailed,setDetailed]=useState(true),detailRef=useRef(true);
 useFrame(({camera},dt)=>{body.current?.getWorldPosition(position.current);const distance=camera.position.distanceTo(position.current),detail=detailRef.current?distance<40:distance<30;if(detail!==detailRef.current){detailRef.current=detail;setDetailed(detail)}if(paused)return;animTime.current+=Math.min(dt,.1);lod.current+=dt;const far=distance>75;if(far&&lod.current<.12)return;lod.current=0;const t=animTime.current+phase,motion=motionSource?.current??baseMotion,walk=motion==='walk'||motion==='run',targetStride=walk?Math.sin(t*(motion==='run'?14:9))*.56:0;strideState.current+=(targetStride-strideState.current)*(1-Math.exp(-18*Math.min(dt,.1)));const stride=strideState.current;
 if(!body.current||!left.current||!right.current||!legA.current||!legB.current)return;
 body.current.position.y=(motion==='celebrate'?Math.abs(Math.sin(t*7))*.25:walk?Math.abs(Math.sin(t*9))*.035:Math.sin(t*2)*.018);
 left.current.rotation.set(-stride,0,motion==='celebrate'?-2.3:-.13);
 right.current.rotation.set(motion==='speech'?-.8+.25*Math.sin(t*5):motion==='ceremony'?-1.1:motion==='announcement'?-1.2+.4*Math.sin(t*3):motion==='point'?-1.5:stride,0,motion==='wave'?2.2+.35*Math.sin(t*10):motion==='celebrate'?2.3:.13);
 legA.current.rotation.x=motion==='sit'?-Math.PI/2:stride;legB.current.rotation.x=motion==='sit'?-Math.PI/2:-stride});
 const skin='#e7aa83',dark='#283532';
 return <Palette.Provider value={palette}><group ref={body}>
 {[-1,1].map((v,i)=><group key={v} ref={i?legB:legA} position={[v*.18,.57,0]}><Ball p={[0,-.22,0]} size={[.15,.27,.16]} color="#354953"/><Ball p={[0,-.45,.06]} size={[.18,.12,.23]} color="#654c40"/></group>)}
 <mesh position={[0,.83,0]} castShadow geometry={look.outfit==='tunik'?tunic:jack} material={palette.get(look.color)} dispose={null}/>
 {detailed&&[.76,.93].map(y=><Ball key={y} p={[0,y,.34]} size={[.035,.035,.025]} color="#f4d992"/>)}
 {[-1,1].map((v,i)=><group key={v} ref={i?left:right} position={[v*.32,1.08,0]}><Ball p={[0,-.15,0]} size={[.14,.21,.16]} color={look.color}/><Ball p={[0,-.37,.03]} size={[.12,.13,.12]} color={skin}/></group>)}
 <group position={[0,1.67,0]} scale={[1,look.face==='oval'?1.12:1,1]}>
 <Ball p={[0,0,0]} size={[.55,.53,.47]} color={skin}/>
 {detailed&&[-1,1].map(v=><group key={v}><Ball p={[v*.52,-.02,0]} size={[.10,.14,.12]} color={skin}/><Ball p={[v*.19,.02,.445]} size={[.065,look.eyes==='senyum'?.033:.095,.034]} color={dark}/><Ball p={[v*.19+.018,.052,.477]} size={[.021,.023,.012]} color="#fff5d6"/><Ball p={[v*.31,-.11,.37]} size={[.083,.045,.027]} color="#d98274"/></group>)}
 {detailed&&<Ball p={[0,-.15,.453]} size={[.072,.034,.014]} color="#955448"/>}
 <Ball p={[0,.24,-.04]} size={[.565,.36,.48]} color={look.hairColor}/>
 {detailed&&[-2,-1,0,1,2].map(v=><Ball key={v} p={[v*.18,.25-Math.abs(v)*.045,.36-Math.abs(v)*.05]} size={[.16,look.hair==='ikal'?.16:.21,.15]} color={look.hairColor}/>)}
 {look.hair==='kuncir'&&[-1,1].map(v=><Ball key={v} p={[v*.53,.12,-.14]} size={[.23,.31,.23]} color={look.hairColor}/>)}
 {look.accessory==='baret'&&<Ball p={[.04,.51,-.02]} size={[.46,.16,.43]} color="#965248"/>}</group>
 {look.accessory==='syal'&&<><Ball p={[0,1.17,0]} size={[.34,.11,.30]} color="#e3a64e"/><Ball p={[.19,1.03,.28]} size={[.10,.20,.055]} color="#e3a64e"/></>}
 </group></Palette.Provider>
}
