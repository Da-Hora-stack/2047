import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { POIS } from '../../data/expedition.js';
import { heightAt,roadX } from './terrain.js';
import { bevelGeometry } from '../render/materials.js';
import { mergeStatic } from '../render/mergeStatic.js';
export class ExpeditionWorld {
 constructor(scene,physics,m){this.group=new THREE.Group();scene.add(this.group);this.physics=physics;this.bodies=[];this.lootMeshes=new Map();
 const mesh=(g,mat,x,y,z,parent=this.group)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const block=(w,h,d,mat,x,y,z,solid=true)=>{const o=mesh(bevelGeometry(w,h,d),mat,x,y,z);if(solid){const b=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z),b);this.bodies.push(b);}return o;};
 for(const poi of POIS){const {x,z}=poi,y=heightAt(x,z);block(9,.2,10,m.steel,x,y+.1,z);block(9,3.5,.18,m.rust,x,y+1.85,z-5);for(const dx of [-4.5,4.5])block(.18,3.5,10,m.steel,x+dx,y+1.85,z);for(const dx of [-3,3])block(3,3.5,.18,m.rust,x+dx,y+1.85,z+5);block(9.5,.2,10.5,m.steel,x,y+3.7,z);block(2,.7,1.2,m.dark,x-2.5,y+.6,z-3);
  if(poi.kind==='loot'){const loot=mesh(bevelGeometry(1.5,.7,1),m.paint,x,y+.6,z-1);this.lootMeshes.set(poi.id,loot);}else{mesh(new THREE.CapsuleGeometry(.32,.9,3,7),m.paint,x,y+1,z-1);mesh(new THREE.SphereGeometry(.24,8,6),m.rust,x,y+1.8,z-1);for(const dx of [-2,2])mesh(new THREE.CylinderGeometry(.5,.5,1.4,10),m.rust,x+dx,y+.9,z-1);block(3,.7,1,m.dark,x,y+.7,z-2);}
 }
 // Silhueta exclusiva do Leito Seco: costelas de um casco encalhado.
 const sx=105,sz=-4380,sy=heightAt(sx,sz);for(let i=0;i<9;i++){const rib=mesh(new THREE.TorusGeometry(9,.33,4,14,Math.PI),m.rust,sx,sy+2,sz-i*5);rib.rotation.z=0;}
 block(.45,2.2,49,m.dark,sx,sy+.5,sz-20,false);
 // Faixa instável: colisor segue depressões de sal, acessível fora da estrada.
 const g=new THREE.PlaneGeometry(65,110,12,20);g.rotateX(-Math.PI/2);const a=g.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i)-85,z=a.getZ(i)-4700;a.setXYZ(i,x,heightAt(x,z)+.16+Math.sin(z*.3)*.45,z);}g.computeVertexNormals();mesh(g,m.salt,0,0,0);const b=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());physics.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(a.array),new Uint32Array(g.index.array)).setFriction(.45),b);this.bodies.push(b);
 mergeStatic(this.group,new Set(this.lootMeshes.values()));
 }
 update(c){for(const [id,mesh] of this.lootMeshes)mesh.visible=!c.expedition.looted.includes(id);}
 dispose(){this.bodies.forEach(b=>this.physics.removeRigidBody(b));this.group.traverse(o=>o.geometry?.dispose());this.group.removeFromParent();}
}
