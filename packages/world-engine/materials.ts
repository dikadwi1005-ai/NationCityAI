import {DataTexture,RepeatWrapping,SRGBColorSpace,RGBAFormat,MeshStandardMaterial,Vector2,Float32BufferAttribute,type BufferGeometry} from 'three';
import {QUALITY,type Quality} from './visual-config';

export type Surface='plaster'|'concrete'|'asphalt'|'glass'|'timber'|'tile'|'metal'|'soil'|'grass'|'sand'|'stone';
const cache=new Map<string,MeshStandardMaterial>();
const textures=new Map<Surface,{color:DataTexture;rough:DataTexture;normal:DataTexture;ao:DataTexture}>();
/** Original deterministic procedural surface maps: no third-party image assets. */
function maps(kind:Surface){
 let set=textures.get(kind);if(set)return set;
 const n=128,color=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4),normal=new Uint8Array(n*n*4),ao=new Uint8Array(n*n*4);
 function height(x:number,y:number){
  const noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
  const grain=Math.abs(noise);
  if(kind==='tile')return (y%16<1||x%32<1)?.15:.65+grain*.15;
  if(kind==='timber')return .45+.12*Math.sin(x*.7+Math.sin(y*.06)*2)+grain*.08;
  if(kind==='concrete'||kind==='stone')return .5+grain*.16+(x%64<1||y%64<1?-.15:0);
  return .5+grain*(kind==='asphalt'?.3:.08);
 }
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,h=height(x,y),v=Math.round(205+h*45),r=kind==='metal'?100:kind==='glass'?35:210+h*35;
  color.set([v,v,v,255],i);rough.set([r,r,r,255],i);
  normal.set([128+(h-height((x+1)%n,y))*65,128+(h-height(x,(y+1)%n))*65,252,255],i);
  const dirt=Math.round(225+h*30);ao.set([dirt,dirt,dirt,255],i);
 }
 function texture(bytes:Uint8Array,srgb=false){const t=new DataTexture(bytes,n,n,RGBAFormat);t.wrapS=t.wrapT=RepeatWrapping;t.generateMipmaps=true;t.anisotropy=4;if(srgb)t.colorSpace=SRGBColorSpace;t.needsUpdate=true;return t}
 set={color:texture(color,true),rough:texture(rough),normal:texture(normal),ao:texture(ao)};textures.set(kind,set);return set;
}
export function surface(color:string,kind:Surface='plaster',quality:Quality='medium'){
 const key=[color,kind,quality].join('/');let material=cache.get(key);if(material)return material;
 const preset=QUALITY[quality],glass=kind==='glass',metal=kind==='metal',m=preset.texture?maps(kind):null;
 material=new MeshStandardMaterial({color,roughness:glass?.16:metal?.36:kind==='tile'?.76:.93,metalness:glass?.12:metal?.68:0,
  map:m&&!glass?m.color:null,roughnessMap:m&&!glass?m.rough:null,normalMap:m&&preset.normal&&!glass?m.normal:null,
  normalScale:new Vector2(.22,.22),aoMap:m&&preset.normal&&!glass?m.ao:null,aoMapIntensity:.3,envMapIntensity:glass?.75:metal?.5:.12});
 cache.set(key,material);return material;
}
/** World-space UVs keep scale consistent across material batches and custom meshes. */
export function planarUV(geometry:BufferGeometry){
 const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal'),uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));uv[i*2]=(ny>.65?x:nx>nz?z:x)*2;uv[i*2+1]=(ny>.65?z:y)*2}
 geometry.setAttribute('uv',new Float32BufferAttribute(uv,2));geometry.setAttribute('uv1',new Float32BufferAttribute(uv,2));return geometry;
}
export function materialResourceCounts(){return {materials:cache.size,surfaceSets:textures.size,textures:textures.size*4}}
