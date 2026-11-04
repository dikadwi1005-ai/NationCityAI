'use client';
import{Part,Window,Rail}from'./primitives';
export function Government(){return <>
 <Part p={[0,.08,0]} s={[3.96,.16,3.96]} c="#898f84" kind="stone"/>
 <Part p={[0,1.19,-.35]} s={[3.45,2.12,2.75]} c="#bcbcaf" kind="stone"/>
 <Part p={[0,2.3,-.32]} s={[3.83,.16,3.07]} c="#777f76" kind="concrete"/>
 <Part p={[0,2.48,-.35]} s={[3.55,.2,2.8]} c="#5e706a" kind="metal"/>
 <Part p={[0,2.94,-.55]} s={[.78,.8,.84]} c="#abb1a3" kind="stone"/>
 <Part p={[0,3.38,-.55]} s={[.91,.12,.97]} c="#556d65" kind="metal"/>
 <Part p={[0,1.05,1.06]} s={[1.03,1.7,.08]} c="#3c5359" kind="glass"/>
 <Part p={[0,1.05,1.12]} s={[.035,1.7,.03]} c="#727e78" kind="metal"/>
 {[-1.38,-.79,.79,1.38].map(x=><group key={x}>
  <Part p={[x,1.25,1.32]} s={[.14,2.15,.2]} c="#c4c4b5" kind="stone"/>
  <Part p={[x,.22,1.32]} s={[.26,.16,.3]} c="#969d90" kind="stone"/>
 </group>)}
 <Part p={[0,2.4,1.15]} s={[3.85,.18,1.25]} c="#babdaf" kind="concrete"/>
 {[0,1,2,3].map(i=><Part key={i} p={[0,.14+i*.045,1.87-i*.14]} s={[3.44-i*.12,.065,.32]} c="#b4b5a5" kind="stone"/>)}
 {[-1.1,1.1].map(x=><Window key={x} p={[x,1.35,1.044]} w={.4} h={.85}/>)}
 {[-1,1].map(side=><group key={side}>{[-1.03,-.2,.63].map(z=><Window key={z} p={[side*1.731,1.35,z]} r={side*Math.PI/2} w={.48} h={.85}/>)}</group>)}
 <Part p={[0,2.09,1.15]} s={[.94,.15,.05]} c="#a99a63" kind="metal"/>
 <Part p={[-1.62,1.12,1.68]} s={[.025,2.1,.025]} c="#8f9d95" kind="metal"/>
 <Part p={[-1.45,1.95,1.68]} s={[.34,.2,.025]} c="#a76550"/>
 <Rail p={[0,2.5,1.76]} w={3.5}/>
 </>}
export function Healthcare(){return <>
 <Part p={[0,.07,0]} s={[3.96,.14,1.98]} c="#989f92" kind="concrete"/>
 <Part p={[0,.71,-.03]} s={[3.66,1.28,1.73]} c="#c7ccbe"/>
 <Part p={[0,1.4,-.03]} s={[3.95,.14,1.96]} c="#6c817a" kind="metal"/>
 <Part p={[0,1.15,.87]} s={[3.5,.14,.06]} c="#7a958a" kind="metal"/>
 <Part p={[.55,.57,.86]} s={[.72,.91,.06]} c="#45616a" kind="glass"/>
 <Part p={[.55,.57,.91]} s={[.026,.91,.03]} c="#687d78" kind="metal"/>
 {[-1.32,-.58].map(x=><Window key={x} p={[x,.68,.85]} w={.56} h={.56}/>)}
 <Part p={[.65,1.24,1.01]} s={[1.42,.08,.42]} c="#526e67" kind="metal"/>
 <Part p={[-.24,1.17,.925]} s={[.085,.29,.03]} c="#a46456"/><Part p={[-.24,1.17,.925]} s={[.29,.085,.03]} c="#a46456"/>
 <Part p={[-.85,1.57,-.18]} s={[.75,.2,.64]} c="#8e9c94" kind="metal" detail={1}/>
 {[0,1].map(i=><Part key={i} p={[.2+i*.65,1.53,-.2]} s={[.56,.035,.68]} c="#3d5863" kind="glass" r={[-.18,0,0]} detail={1}/>)}
 <Window p={[1.84,.69,-.1]} r={Math.PI/2} w={.74} h={.55}/>
 <Part p={[1.5,.18,1.01]} s={[.4,.22,.12]} c="#9b9c88" kind="stone"/>
 </>}
