'use client';
import {useState} from 'react';
export default function TouchJoystick({change}:{change:(x:number,z:number)=>void}){
 const [point,setPoint]=useState({x:0,z:0});
 function release(){setPoint({x:0,z:0});change(0,0)}
 return <div className="touch-joystick" role="group" aria-label="Joystick gerak" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.x-r.width/2)/30,z=(e.clientY-r.y-r.height/2)/30,length=Math.max(1,Math.hypot(x,z));setPoint({x:x/length,z:z/length});change(x/length,z/length)}} onPointerMove={e=>{if(!e.currentTarget.hasPointerCapture(e.pointerId))return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.x-r.width/2)/30,z=(e.clientY-r.y-r.height/2)/30,length=Math.max(1,Math.hypot(x,z));setPoint({x:x/length,z:z/length});change(x/length,z/length)}} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><span style={{transform:`translate(${point.x*26}px,${point.z*26}px)`}}/><small>GERAK</small></div>
}
