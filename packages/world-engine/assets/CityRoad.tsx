'use client';
import {QuadraticBezierCurve3,Vector3,TubeGeometry} from 'three';
import {surface} from '../materials';import{useQuality}from'../quality-context';
import type {RoadConnections} from '../asset-registry';
import {Part} from './primitives';
const arc=new TubeGeometry(new QuadraticBezierCurve3(new Vector3(0,.089,-.95),new Vector3(0,.089,0),new Vector3(.95,.089,0)),18,.012,4,false);
export default function CityRoad({connections,main=false}:{connections?:RoadConnections;main?:boolean}){
 const q=useQuality(),c=connections??{n:false,e:true,s:false,w:true},dirs=['n','e','s','w'] as const,count=dirs.filter(d=>c[d]).length;
 const corner=count===2?[[c.n,c.e],[c.e,c.s],[c.s,c.w],[c.w,c.n]].findIndex(v=>v.every(Boolean)):-1;
 return <>
 <Part p={[0,.025,0]} s={[2,.05,2]} c="#8b9187" kind="concrete"/>
 <Part p={[0,.055,0]} s={[2,.045,2]} c={main?'#464e51':'#555c5a'} kind="asphalt"/>
 {dirs.map((d,i)=>!c[d]&&<group key={d} rotation={[0,-i*Math.PI/2,0]}>
  {!main&&<Part p={[0,.082,-.88]} s={[2,.025,.2]} c="#878e84" kind="concrete"/>}
  <Part p={[0,.085,-.96]} s={[2,.06,.08]} c="#9fa497" kind="stone"/>
  <Part p={[0,.084,-.8]} s={[1.9,.009,.025]} c="#b8b9a5"/>
  <Part p={[.65,.088,-.88]} s={[.28,.012,.1]} c="#414e49" kind="metal" detail={1}/>
  {[-.1,0,.1].map(x=><Part key={x} p={[.65+x,.097,-.88]} s={[.012,.005,.09]} c="#737d71" kind="metal" detail={2}/>)}
 </group>)}
 {corner>=0?<mesh geometry={arc} material={surface('#c2b887','plaster',q)} rotation={[0,-corner*Math.PI/2,0]} dispose={null}/>:dirs.map((d,i)=>c[d]&&<group key={d} rotation={[0,-i*Math.PI/2,0]}>
  <Part p={[0,.085,-.62]} s={[.022,.006,.5]} c="#c5bc8b"/>
  {main&&<Part p={[.055,.085,-.62]} s={[.018,.006,.5]} c="#c5bc8b"/>}
  {count>=3&&<>{[-.62,-.44,-.26,-.08,.1,.28,.46,.64].map(x=><Part key={x} p={[x,.087,-.82]} s={[.085,.008,.3]} c="#cfceba"/>)}<Part p={[0,.087,-.55]} s={[1.48,.008,.025]} c="#cfceba"/></>}
 </group>)}
 </>;
}
