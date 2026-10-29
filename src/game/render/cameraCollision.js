import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
const sphere=new RAPIER.Ball(.25),identity={x:0,y:0,z:0,w:1};
// Varre volume, e não só o pixel central: protege também a borda próxima da câmera.
export function cameraPosition(world,origin,desired,excludeBody){
 const delta=new THREE.Vector3().subVectors(desired,origin),distance=delta.length();if(!world||distance<.01)return desired.clone();delta.multiplyScalar(1/distance);
 const hit=world.castShape(origin,identity,delta,sphere,.03,distance,true,RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC|RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC,undefined,undefined,excludeBody);
 return hit?new THREE.Vector3().copy(origin).addScaledVector(delta,Math.max(0,hit.time_of_impact-.06)):desired.clone();
}
