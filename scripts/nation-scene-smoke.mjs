import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:net';
import {chromium} from 'playwright-core';
const socket=createServer();await new Promise(r=>socket.listen(0,'127.0.0.1',r));const port=socket.address().port;await new Promise(r=>socket.close(r));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','apps/web','--hostname','127.0.0.1','--port',String(port)],{stdio:'ignore',windowsHide:true,env:{...process.env,NATION_PROJECT_ROOT:process.cwd()}});
let browser;const timer=setTimeout(()=>{console.error('Scene smoke exceeded 120 seconds');server.kill();browser?.close();process.exitCode=1},120000);
try{
 for(let i=0;i<100;i++){try{if((await fetch(`http://127.0.0.1:${port}/nation-atlas`)).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 browser=await chromium.launch({channel:'msedge',timeout:20000});const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
 await mkdir('docs/nation-scope',{recursive:true});
 await page.goto(`http://127.0.0.1:${port}/nation-atlas`);await page.screenshot({path:'docs/nation-scope/atlas.png'});
 const results=[];
 for(const id of process.argv.slice(2).length?process.argv.slice(2):['capital','village']){
  console.log('Loading',id);await page.goto(`http://127.0.0.1:${port}/demo-region/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(id=>window.__nationStreaming?.active===id&&window.__nationStreaming.renderedTerrainChunks>0,id,{timeout:45000});
  await page.waitForTimeout(2500);
  const result=await page.evaluate(()=>({stream:window.__nationStreaming,metrics:window.__nationMetrics}));
  if(result.stream.loadedRegions!==1||result.stream.renderedTerrainChunks>96)throw Error('Region/chunk budget violated');
  await page.screenshot({path:`docs/nation-scope/${id}-current.png`});results.push(result);console.log(JSON.stringify(result));
 }
 if(errors.length)throw Error(errors.join('\n'));await writeFile('docs/nation-scope/scene-smoke.json',JSON.stringify({results,errors},null,2));
}finally{clearTimeout(timer);await browser?.close();server.kill()}
