import {BUILDINGS,type NationBuilding} from './catalog.ts';
export type ArchitecturalPart={p:[number,number,number];s:[number,number,number];color:string;material:'stone'|'glass'|'roof'|'land'|'light';shape?:'box'|'cylinder'|'roof';angle?:number};
/** Original architectural kit. Dimensions follow the same catalog used by collision and storage. */
export function architecture(b:NationBuilding,detailed=true):ArchitecturalPart[]{
 const a=BUILDINGS[b.asset],out:ArchitecturalPart[]=[],[w,d]=a.body,[lw,ld]=a.lot,h=a.height;
 const add=(p:ArchitecturalPart['p'],s:ArchitecturalPart['s'],color:string,material:ArchitecturalPart['material']='stone',shape:ArchitecturalPart['shape']='box',angle=0)=>{out.push({p,s,color,material,shape,angle});if(material==='glass'&&(out.length+b.variant)%3!==0)out.push({p,s:[s[0]*.98,s[1]*.98,s[2]*1.06],color:'#d7c294',material:'light',shape,angle})};
 const wall=['#d8d3c2','#c5bda6','#e2ddcc','#c4cbc2','#d4c3b0','#c9d2cb','#e5d9c6','#b8c4bd'][b.variant%8],dark='#385454',roof=['#7e6554','#686d65','#916f55','#577171'][b.variant%4];
 add([0,.025,0],[lw,.05,ld],'#9ba98a','land');add([0,.09,0],[w+.8,.16,d+.8],'#b0ac9b');
 // A front path is real geometry inside the reserved lot; planted side strips remain permeable.
 add([0,.07,(d+ld)/4],[Math.min(2,w*.35),.08,(ld-d)/2],'#c6c1ae');
 add([-lw/2+.4,.35,0],[.45,.65,ld-.7],'#79896b','land');add([lw/2-.4,.35,0],[.45,.65,ld-.7],'#79896b','land');
 const government=a.governmentLevel!==undefined;
 if(b.asset==='landmark'){
  for(let i=0;i<4;i++)add([0,.2+i*.25,0],[4-i*.6,.25,4-i*.6],'#b8b3a4');
  add([0,h/2,0],[1.3,h-1,1.3],'#dfd2a8');add([0,h-.1,0],[.8,1.1,.8],'#b39958','roof','cylinder');return out;
 }
 if(government){
  const tier=a.governmentLevel!,national=b.asset==='palace',governor=b.asset==='governor',regent=b.asset==='regent',mayor=b.asset==='mayor',ministry=b.asset==='ministry';
  const wingH=national?h*.58:governor?h*.7:regent?h*.45:h*.8,coreW=national?w*.38:regent?w*.55:w*.5;
  add([0,wingH/2,-d*.12],[w,wingH,d*.7],wall);
  add([0,h*.45,0],[coreW,h*.9,d*.85],national?'#e0dcc8':mayor?'#aabdb6':wall);
  for(const side of [-1,1])add([side*w*.4,wingH/2,d*.15],[w*.2,wingH,d*.65],wall);
  if(national){
   add([0,h-.35,0],[coreW+1.2,1.3,d*.9],roof,'roof','roof');
   add([0,h+.45,0],[1.4,1.5,1.4],'#a79051','roof','cylinder');
   add([0,h*.62,d*.5],[coreW+1,.3,2.4],'#d0c4a1');
  }else if(regent||tier>=3){
   add([0,wingH+1.0,0],[w+1.2,1.8,d+1.2],roof,'roof','roof');
   if(regent)add([0,wingH+2.3,0],[w*.5,1.3,d*.6],roof,'roof','roof');
  }else if(governor){
   add([0,h-.1,0],[coreW+1,1.4,d*.9],roof,'roof','roof');
   add([0,h+.8,0],[coreW*.5,.8,d*.55],roof,'roof','roof');
  }else if(mayor){
   add([-w*.3,h*.65,0],[w*.18,h*.8,d*.65],'#9aa79f');add([-w*.3,h+1.3,d*.34],[1.2,1.2,.12],'#e9dfbc');
  }else if(ministry)add([0,h-.2,0],[coreW+.8,.8,d*.92],'#a9b7b2');
  const columns=national?8:governor?6:4;
  for(let i=0;i<columns;i++)add([(-.5+i/(columns-1))*coreW*.9,wingH*.4,d*.47],[.22,wingH*.8,.22],'#e4deca','stone','cylinder');
  for(let floor=0;floor<Math.max(1,a.floors-1);floor++)for(let i=0;i<(detailed?8:3);i++){
   const x=(-.44+i/((detailed?8:3)-1)*.88)*w;if(Math.abs(x)<coreW*.45&&floor<2)continue;
   add([x,.8+floor*.95,d*.36],[detailed?.55:w*.16,.55,.04],dark,'glass');
  }
  add([0,.7,d*.48],[1.3,1.4,.12],dark,'glass');add([0,.18,d*.58],[coreW+1,.28,1.5],'#b5b3a6');
  add([w*.42,h*.3,d*.7],[.06,h*.6,.06],'#b8b9af');add([w*.42+.5,h*.53,d*.7],[1,.55,.035],'#a44e40','roof');
  return out;
 }
 if(['cottage','house-two','townhouse','shophouse'].includes(b.asset)){
  const bodyH=h-.9;add([0,bodyH/2,0],[w,bodyH,d],wall);add([0,bodyH,0],[w+.7,1.2,d+.8],roof,'roof','roof');
  if(b.asset==='cottage'){add([w*.22,bodyH*.5,d*.58],[w*.45,bodyH,.9],'#b8a689');add([w*.22,bodyH+.05,d*.58],[w*.55,.7,1.3],roof,'roof','roof')}
  if(b.asset==='townhouse')add([-w*.32,h*.65,d*.5],[w*.25,.7,1.1],'#b5c3bd');
  for(let f=0;f<a.floors;f++)for(const x of [-w*.3,w*.3]){add([x,.65+f*.95,d/2+.025],[.75,.65,.04],dark,'glass');if(detailed)add([x,.28+f*.95,d/2+.12],[.95,.08,.3],'#c4bca4')}
  add([0,.53,d/2+.04],[.65,1.06,.08],'#76604c');add([0,1.3,d/2+.4],[1.3,.09,.9],roof,'roof');
  if(b.asset==='shophouse'){add([0,.6,d/2+.07],[w*.9,1.15,.05],dark,'glass');add([0,1.4,d/2+.5],[w+.2,.15,1.2],'#94755c','roof')}
  if(detailed){for(const x of [-lw/2+.1,lw/2-.1])add([x,.38,ld*.25],[.08,.75,ld*.48],'#b4ab96');add([-lw*.28,.4,ld/2-.3],[lw*.4,.8,.15],'#b4ab96');add([lw*.3,.14,ld*.3],[2,.12,2.8],'#a7ada0')}
  return out;
 }
 if(['market','mall','clinic','school','community'].includes(b.asset)){
  const open=b.asset==='market';add([0,h*.36,0],[w,h*.72,d],wall);
  if(b.asset==='school'){add([0,h*.35,d*.32],[w*.5,h*.7,d*.6],'#9caeab');add([0,h-.5,0],[w+.8,.8,d+.8],roof,'roof','roof')}
  if(open){add([0,h-.5,0],[w+1,1,d+1],roof,'roof','roof');for(let i=0;i<6;i++)add([(-.43+i*.17)*w,1,d*.51],[w*.13,1.6,.12],['#a87a54','#809079','#bba06d'][i%3],'roof')}
  else{add([0,h*.74,0],[w+.5,.25,d+.5],'#94a5a2');for(let i=0;i<(detailed?10:4);i++)add([(-.45+i/((detailed?10:4)-1)*.9)*w,h*.45,d*.505],[w/((detailed?10:4)+2),h*.5,.04],dark,'glass')}
  if(b.asset==='mall'){add([0,h*.9,0],[w*.5,h*.35,d*.6],dark,'glass');add([0,1.3,d*.65],[w*.5,.18,3],'#a3a99f')}
  if(b.asset==='clinic'){add([w*.3,h*.7,d*.52],[.25,1,.08],'#9f594a','roof');add([w*.3,h*.7,d*.53],[.8,.25,.08],'#9f594a','roof')}
  return out;
 }
 // Towers combine a grounded podium, recessed lobby, articulated vertical core and rooftop plant.
 const residential=b.asset.startsWith('apartment'),hotel=b.asset==='hotel',tower=b.asset==='tower',podiumH=tower?3.5:2.1,shaftW=w*(tower?.72:hotel?.78:.86),shaftD=d*(tower?.72:.85);
 add([0,podiumH/2,0],[w,podiumH,d],wall);add([0,podiumH*.45,d*.505],[w*.7,podiumH*.72,.06],dark,'glass');
 add([0,podiumH+.1,0],[w+1,.25,d+1],'#829487','land');
 add([0,(h+podiumH)/2,-d*.035],[shaftW,h-podiumH,shaftD],residential?wall:'#627b7e');
 if(tower){add([w*.32,h*.43,-d*.12],[w*.35,h*.66,d*.62],'#96a5a0');add([-w*.3,h*.4,-d*.15],[w*.18,h*.7,d*.56],'#a7ada4');add([0,h+.8,0],[.1,2.8,.1],'#a1aaa5')}
 const floors=detailed?a.floors:Math.min(18,a.floors),columns=detailed?Math.max(3,Math.round(shaftW/1.3)):Math.max(3,Math.round(shaftW/1.6)),dy=(h-podiumH-.5)/floors;
 for(let f=0;f<floors;f++){
  const y=podiumH+.5+f*dy;
  if(residential){add([0,y-.3,shaftD/2-d*.035+.25],[shaftW+.6,.12,.7],'#bdc7be');if(detailed)add([0,y+.15,shaftD/2-d*.035+.45],[shaftW,.5,.04],'#819794','glass')}
  for(let i=0;i<columns;i++){
   const x=(-.43+i/(columns-1)*.86)*shaftW;
   for(const side of [-1,1])add([x,y,side*shaftD/2-d*.035],[shaftW/columns*.62,detailed?.6:dy*.58,.045],(f+i+b.variant)%4===0?'#456568':'#6f9194','glass');
   if(detailed&&(f+i+b.variant)%3!==0)add([x,y,shaftD/2-d*.035+.03],[shaftW/columns*.55,.47,.015],(f+i)%2?'#d6c391':'#b4c3b4','light');
  }
  for(const side of [-1,1]){add([side*shaftW/2,y,-d*.035],[.045,detailed?.65:dy*.6,shaftD*.7],dark,'glass');if(detailed)for(let j=-2;j<=2;j++)add([side*(shaftW/2+.03),y,j*shaftD*.14-d*.035],[.035,.7,.055],'#a1afa7')}
 }
 for(const side of [-1,1])add([side*(shaftW/2+.1),(h+podiumH)/2,-d*.035],[.18,h-podiumH,shaftD+.12],wall);
 add([0,h+.15,-d*.035],[shaftW+.5,.3,shaftD+.5],'#a4b2ad');add([0,h+.6,-d*.15],[shaftW*.35,.85,shaftD*.4],'#7a8984');
 add([0,1.6,d*.62],[w*.7,.2,2.5],'#b7bcb1');
 if(hotel)add([w*.4,h*.48,shaftD*.4],[.45,h*.7,.35],'#bd9671','roof');
 return out;
}
