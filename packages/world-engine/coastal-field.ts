import {chunks,type Geo} from '../nation-core/geography.ts';
import {visualHeight} from './visual-terrain.ts';
/** Bounded render-only depth/coast-distance field. No geography mutation. */
export function coastalField(geo:Geo,cap=384){
 const keys=[...chunks(geo).keys()].map(k=>k.split(':').map(Number));
 const minX=Math.min(...keys.map(k=>k[0]*16))-8,minZ=Math.min(...keys.map(k=>k[1]*16))-8;
 const width=Math.max(...keys.map(k=>k[0]*16))+24-minX,height=Math.max(...keys.map(k=>k[1]*16))+24-minZ;
 const step=Math.max(.25,Math.max(width,height)/(cap-1)),w=Math.ceil(width/step)+1,h=Math.ceil(height/step)+1,data=new Uint8Array(w*h*4),dist=new Float32Array(w*h);
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const i=z*w+x,land=visualHeight(geo,minX+x/(w-1)*width,minZ+z/(h-1)*height),depth=Math.max(0,-.25-land);data[i*4]=Math.min(255,depth/2*255);data[i*4+3]=255;dist[i]=land>=-.25?0:10000}
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const i=z*w+x;if(x)dist[i]=Math.min(dist[i],dist[i-1]+step);if(z)dist[i]=Math.min(dist[i],dist[i-w]+step);if(x&&z)dist[i]=Math.min(dist[i],dist[i-w-1]+step*1.414)}
 for(let z=h-1;z>=0;z--)for(let x=w-1;x>=0;x--){const i=z*w+x;if(x<w-1)dist[i]=Math.min(dist[i],dist[i+1]+step);if(z<h-1)dist[i]=Math.min(dist[i],dist[i+w]+step);if(x<w-1&&z<h-1)dist[i]=Math.min(dist[i],dist[i+w+1]+step*1.414);data[i*4+1]=Math.min(255,dist[i]/12*255)}
 return {data,w,h,minX,minZ,width,height};
}
