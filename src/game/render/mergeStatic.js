import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// Une les surfaces immobiles par matériau; conserve les roues et la suspension séparées.
export function mergeStatic(group,exclude=new Set()) {
  const batches=new Map();
  for(const mesh of [...group.children]) {
    if(!mesh.isMesh||mesh.isInstancedMesh||exclude.has(mesh)||Array.isArray(mesh.material))continue;
    mesh.updateMatrix();const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();g.applyMatrix4(mesh.matrix);g.clearGroups();
    if(!batches.has(mesh.material))batches.set(mesh.material,[]);batches.get(mesh.material).push(g);group.remove(mesh);mesh.geometry.dispose();
  }
  for(const [material,geometries] of batches){const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
}
