import {BufferGeometry,Matrix4,Vector3} from 'three';
/** Deform a private geometry copy in world space; domain transforms remain intact. */
export function conformRoadGeometry(original:BufferGeometry,worldMatrix:Matrix4,baseHeight:number,height:(x:number,z:number)=>number){
 const geometry=original.clone(),position=geometry.getAttribute('position'),inverse=worldMatrix.clone().invert(),point=new Vector3();
 for(let i=0;i<position.count;i++){point.fromBufferAttribute(position,i).applyMatrix4(worldMatrix);point.y+=height(point.x,point.z)-baseHeight;point.applyMatrix4(inverse);position.setXYZ(i,point.x,point.y,point.z)}
 position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
