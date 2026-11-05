'use client';
import{useMemo,useEffect}from'react';import*as T from'three';import{BUILDINGS,dimensions}from'../../../packages/nation-sim/catalog';import{sample}from'../../../packages/nation-core/geography';import type{NationConstruction}from'../../../packages/ai-builder/nation-planning';
const box=new T.BoxGeometry(1,1,1);
export default function NationConstructionSites({sim,blueprint,tick}:{sim:NationConstruction;blueprint:boolean;tick:number}){
 const resources=useMemo(()=>{const parts:{p:number[];s:number[];color:string}[]=[],lines:number[]=[],colors:number[]=[],c=new T.Color();const add=(x:number,y:number,z:number,w:number,h:number,d:number,color:string)=>parts.push({p:[x,y,z],s:[w,h,d],color});
  const outline=(x:number,z:number,w:number,d:number,y:number,color:string)=>{const p=[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];for(let i=0;i<4;i++){lines.push(p[i][0],y,p[i][1],p[(i+1)%4][0],y,p[(i+1)%4][1]);c.set(color);colors.push(c.r,c.g,c.b,c.r,c.g,c.b)}};
  for(const job of sim.plan.jobs){const state=sim.states.get(job.id)!;if(state.stage==='complete')continue;if(job.road){if(!blueprint&&state.stage==='queued')continue;const r=job.road;lines.push(r.x1,sample(sim.plan.base.geo!,r.x1,r.z1).h+.18,r.z1,r.x2,sample(sim.plan.base.geo!,r.x2,r.z2).h+.18,r.z2);c.set(state.stage==='queued'?'#9eae9b':'#dbba6f');colors.push(c.r,c.g,c.b,c.r,c.g,c.b);continue}
   const b=job.building!,a=BUILDINGS[b.asset],lot=dimensions(b),body=dimensions(b,'body'),y=sample(sim.plan.base.geo!,b.x,b.z).h;
   if(blueprint||state.stage!=='queued')outline(b.x,b.z,lot.w,lot.d,y+.14,state.stage==='queued'?'#c2c8aa':'#d4b66b');
   if(state.stage==='queued')continue;
   for(const x of[-1,1])for(const z of[-1,1])add(b.x+x*lot.w/2,y+.3,b.z+z*lot.d/2,.06,.6,.06,'#c8a869');
   if(['foundation','frame','finish'].includes(state.stage)){add(b.x,y+.12,b.z,body.w+.5,.24,body.d+.5,'#a9aaa0');for(const x of[-.4,.4])for(const z of[-.4,.4])add(b.x+x*body.w,y+.25,b.z+z*body.d,.65,.45,.65,'#93988e')}
   if(state.stage==='frame'||state.stage==='finish'){
    const fraction=state.stage==='finish'?1:Math.max(.08,(state.progress-.4)/.4),floors=Math.max(1,Math.ceil(a.floors*fraction)),floorHeight=(a.height-.7)/Math.max(1,a.floors);
    for(let f=0;f<floors;f++){const level=y+.3+(f+1)*floorHeight;add(b.x,level,b.z,body.w,.14,body.d,'#aeb2a8');for(const x of[-.42,0,.42])for(const z of[-.42,.42])add(b.x+x*body.w,level-floorHeight/2,b.z+z*body.d,.18,floorHeight,.18,'#b9b9ab')}
    const builtH=floors*floorHeight;for(const side of[-1,1])for(let f=0;f<Math.ceil(builtH/2);f++)add(b.x+side*(body.w/2+.4),y+f*2+1,b.z,.045,2,.045,'#986e49');
    if(a.height>10){const x=b.x+body.w/2+1.5,top=y+Math.min(a.height+3,builtH+4);add(x,(top+y)/2,b.z,.22,top-y,.22,'#b5a266');add(x-body.w/3,top,b.z,body.w*1.5,.18,.22,'#b5a266');add(x-body.w*.8,top-1,b.z,.04,2,.04,'#5e6a61')}
   }
  }
  const mesh=new T.InstancedMesh(box,new T.MeshStandardMaterial({color:'#ffffff',roughness:.85}),parts.length),dummy=new T.Object3D();parts.forEach((p,i)=>{dummy.position.set(p.p[0],p.p[1],p.p[2]);dummy.scale.set(p.s[0],p.s[1],p.s[2]);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,c.set(p.color))});mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;mesh.raycast=()=>{};
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(lines,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));return{mesh,geometry};
 },[sim,blueprint,tick]);useEffect(()=>()=>{resources.mesh.dispose();(resources.mesh.material as T.Material).dispose();resources.geometry.dispose()},[resources]);return <group name="regional-construction-stages"><primitive object={resources.mesh}/><lineSegments geometry={resources.geometry} raycast={()=>null}><lineBasicMaterial vertexColors/></lineSegments></group>;
}
