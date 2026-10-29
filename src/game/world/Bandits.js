import * as THREE from 'three';
import { AMBUSHES,AMBUSH_RULES as R } from '../../data/road.js';
import { heightAt,roadX } from './terrain.js';
import { bevelGeometry } from '../render/materials.js';
import { mergeStatic } from '../render/mergeStatic.js';
import { makeGroup,stepGroup,groupInfo } from './banditAI.js';

// Saqueadores: veículos cinemáticos (sem corpo no Rapier). A IA está em banditAI.js; aqui só nascem, andam e somem.
export class Bandits {
  constructor(scene,materials){this.scene=scene;this.m=materials;this.active=null;this.root=null;this.meshes=[];this.lastTruck=null;
    this.flag=new THREE.MeshStandardMaterial({color:'#8c3b2c',roughness:.9,metalness:0,side:THREE.DoubleSide});}

  buggy(){
    const m=this.m,g=new THREE.Group(),add=(geo,mat,x,y,z,rx=0,rz=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,0,rz);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
    add(bevelGeometry(1.9,.5,3.8,.06),m.rust,0,.78,0);                       // chassi
    add(bevelGeometry(1.45,.55,1.3,.05),m.dark,0,1.08,-.45);                  // banco e cabine baixa
    add(bevelGeometry(1.5,.32,1.25,.05),m.rust,0,1.0,1.35);                   // capô
    for(const x of [-.72,.72])add(new THREE.CylinderGeometry(.045,.045,1.25,5),m.steel,x,1.55,-.9); // arco de proteção
    add(new THREE.CylinderGeometry(.045,.045,1.5,5),m.steel,0,2.15,-.9,0,Math.PI/2);
    for(const x of [-.95,.95])for(const z of [-1.3,1.3])add(new THREE.CylinderGeometry(.5,.5,.42,10),m.rubber,x,.5,z,0,Math.PI/2);
    for(const x of [-.5,.5])add(new THREE.SphereGeometry(.14,6,5),m.light,x,1.02,2.0);   // faróis
    add(new THREE.CapsuleGeometry(.26,.5,3,6),m.paint,0,1.55,-.45);                       // piloto
    add(new THREE.SphereGeometry(.2,6,5),m.dark,0,2.0,-.45);
    add(new THREE.CylinderGeometry(.02,.02,2.6,4),m.steel,.8,2.2,-1.75);                 // haste da bandeira
    add(new THREE.PlaneGeometry(.9,.55),this.flag,.8+.45,3.2,-1.75);
    mergeStatic(g);g.rotation.order='YXZ';return g;
  }
  camp(a){
    const m=this.m,g=new THREE.Group(),y=heightAt(roadX(a.z)+15,a.z);
    for(const [dx,dz] of [[0,0],[1.6,1.2]]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.1,9),m.rust);b.position.set(roadX(a.z)+15+dx,y+.55,a.z+dz);b.castShadow=true;g.add(b);}
    const fire=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.12,8),m.light);fire.position.set(roadX(a.z)+15,y+1.14,a.z);g.add(fire);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,6,5),m.steel);pole.position.set(roadX(a.z)+15.8,y+3,a.z-1);g.add(pole);
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.1),this.flag);flag.position.set(roadX(a.z)+16.7,y+5.3,a.z-1);flag.rotation.y=Math.PI/2;g.add(flag);
    return g;
  }
  spawn(a){
    this.active=makeGroup(a,roadX);this.root=new THREE.Group();this.scene.add(this.root);
    this.root.add(this.camp(a));this.meshes=this.active.bandits.map(()=>{const b=this.buggy();this.root.add(b);return b;});this.sync();
  }
  remove(){
    if(this.root){this.root.traverse(o=>o.geometry?.dispose());this.scene.remove(this.root);}
    this.root=null;this.active=null;this.meshes=[];
  }
  reset(){this.remove();this.lastTruck=null;}

  // Devolve eventos para o Game aplicar na campanha: spawn, chase, ram, robbed, cleared, gaveup, outran.
  update(dt,truck,campaign){
    this.lastTruck=truck;const events=[];
    if(!this.active&&truck.driving){
      for(const a of AMBUSHES){
        if(campaign.road.ambushes[a.id]!=='pending')continue;
        if(Math.hypot(truck.x-roadX(a.z),truck.z-a.z)<=R.spawnRadius){this.spawn(a);events.push({type:'spawn',id:a.id});break;}
      }
    }
    if(this.active){
      for(const e of stepGroup(this.active,truck,dt)){
        if(e.type==='despawn'||e.type==='done'){this.remove();return events;}
        events.push(e);
      }
      this.sync();
    }
    return events;
  }
  sync(){
    if(!this.active)return;
    this.active.bandits.forEach((b,i)=>{
      const o=this.meshes[i],s=Math.sin(b.heading),c=Math.cos(b.heading),hf=heightAt(b.x+s*1.8,b.z+c*1.8),hb=heightAt(b.x-s*1.8,b.z-c*1.8);
      o.position.set(b.x,(hf+hb)/2+.02,b.z);o.rotation.set(-Math.atan2(hf-hb,3.6),b.heading,b.roll*(b.spin<0?-1:1));
    });
  }
  snapshot(){return this.active&&this.lastTruck?groupInfo(this.active,this.lastTruck):null;}
  dispose(){this.remove();this.flag.dispose();}
}
