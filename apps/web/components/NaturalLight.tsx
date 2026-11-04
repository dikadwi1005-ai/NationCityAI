'use client';
import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {Color,FogExp2,PMREMGenerator,Scene,Vector3} from 'three';
import {Sky} from 'three/examples/jsm/objects/Sky.js';
import {useQuality} from '../../../packages/world-engine/quality-context';
import {QUALITY} from '../../../packages/world-engine/visual-config';

export default function NaturalLight(){
 const quality=useQuality(),preset=QUALITY[quality],{gl,scene}=useThree();
 useEffect(()=>{
  gl.toneMappingExposure=.88;gl.shadowMap.enabled=!!preset.shadow;
  scene.background=new Color('#8cabb5');scene.fog=new FogExp2('#8cabb5',quality==='low'?0:.0018);
  if(quality==='low'){scene.environment=null;return}
  const sky=new Sky(),environment=new Scene();sky.scale.setScalar(1000);
  sky.material.uniforms.turbidity.value=3;sky.material.uniforms.rayleigh.value=1.1;
  sky.material.uniforms.mieCoefficient.value=.003;sky.material.uniforms.sunPosition.value=new Vector3(30,48,20);
  environment.add(sky);const generator=new PMREMGenerator(gl),target=generator.fromScene(environment,.04,1,2000);
  scene.environment=target.texture;scene.environmentIntensity=.17;environment.remove(sky);sky.scale.setScalar(500);scene.add(sky);generator.dispose();
  return()=>{scene.environment=null;scene.remove(sky);target.dispose();sky.geometry.dispose();sky.material.dispose()};
 },[gl,scene,quality,preset.shadow]);
 return <><ambientLight intensity={.18}/><hemisphereLight args={['#dceaf2','#4a5d3b',.65]}/><directionalLight position={[30,48,20]} intensity={3} castShadow={!!preset.shadow} shadow-mapSize={[preset.shadow||512,preset.shadow||512]} shadow-camera-left={-65} shadow-camera-right={65} shadow-camera-top={65} shadow-camera-bottom={-65} shadow-camera-far={160} shadow-bias={-.00035} shadow-normalBias={.025}/></>;
}
