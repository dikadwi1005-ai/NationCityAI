import {w} from './benchmark.ts';
import {Land} from '../packages/multiplayer/spatial.ts';
import {chromium} from 'playwright-core';
import {readFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
const start=performance.now(),land=new Land(w),area=land.area({x:0,z:0,island:'island-001'});
console.log('Index and area query (ms)',performance.now()-start);
const browser=await chromium.launch({channel:'msedge',args:['--enable-unsafe-swiftshader','--enable-precise-memory-info']});
try{const page=await browser.newPage({viewport:{width:960,height:640}});
 await page.route('http://benchmark.local/**',async route=>{const path=new URL(route.request().url()).pathname;
 if(['/three.module.js','/three.core.js'].includes(path))await route.fulfill({contentType:'application/javascript',body:await readFile('node_modules/three/build'+path)});
 else await route.fulfill({contentType:'text/html',body:'<canvas></canvas>'})});await page.goto('http://benchmark.local/');
 for(const [label,scene] of [['full',w],['area',area]]){
 const input=JSON.stringify(scene),measure=await page.evaluate(async input=>{
 const T=await import('/three.module.js');const heap=performance.memory?.usedJSHeapSize??0,start=performance.now(),snapshot=JSON.parse(input),scene=new T.Scene();
 const geom=new T.BoxGeometry(1,2,1),mat=new T.MeshBasicMaterial({color:0x579980});
 for(const o of snapshot.objects){const mesh=new T.Mesh(geom,mat);mesh.position.set(o.x,0,o.z);scene.add(mesh)}
 const load=performance.now()-start,delta=(performance.memory?.usedJSHeapSize??0)-heap;
 const r=new T.WebGLRenderer({canvas:document.querySelector('canvas')});r.setSize(640,400);const camera=new T.OrthographicCamera(-45,45,30,-30,.1,500);camera.position.set(40,40,40);camera.lookAt(0,0,0);
 const durations=[];for(let i=0;i<15;i++){await new Promise(requestAnimationFrame);const t=performance.now();r.render(scene,camera);r.getContext().finish();if(i>=3)durations.push(performance.now()-t)}
 const draws=r.info.render.calls;r.dispose();geom.dispose();mat.dispose();return {loadMs:load,heapDelta:delta,medianRenderMs:durations.sort((a,b)=>a-b)[6],draws}
 },input);console.log(label,{objects:scene.objects.length,bytes:Buffer.byteLength(input),...measure});}
}finally{await browser.close()}
