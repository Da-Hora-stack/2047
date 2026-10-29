import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { NETWORK_POINTS,ROUTES } from '../../data/network.js';
import { heightAt,roadX,randomSeed } from './terrain.js';
import { weatherAt } from '../missions/network.js';
import { bevelGeometry } from '../render/materials.js';
import { mergeStatic } from '../render/mergeStatic.js';

// Só os equipamentos no entorno do jogador têm geometrias e corpos físicos vivos.
export class NetworkWorld {
 constructor(scene,physics,m){this.scene=scene;this.physics=physics;this.m=m;this.live=new Map();this.defs=[...NETWORK_POINTS,...ROUTES.map(r=>({...r,x:roadX(-r.at),z:-r.at,kind:'hazard'}))];
  const r=randomSeed(7047),a=new Float32Array(240*3);for(let i=0;i<a.length;i+=3){a[i]=(r()-.5)*60;a[i+1]=r()*24;a[i+2]=(r()-.5)*60;}this.rainPositions=a;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));this.rain=new THREE.Points(g,new THREE.PointsMaterial({color:'#bcced3',size:.085,transparent:true,opacity:.5,depthWrite:false}));scene.add(this.rain);this.rain.visible=false;
 }
 build(p){const e={p,group:new THREE.Group(),bodies:[],growth:0};this.scene.add(e.group);const y=heightAt(p.x,p.z),m=this.m;
  const mesh=(g,mat,x,cy,z)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,cy,z);o.castShadow=o.receiveShadow=true;e.group.add(o);return o;};
  const collider=(x,cy,z,w,h,d)=>{const b=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());this.physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,cy,z),b);return b;};
  const block=(w,h,d,mat,x,cy,z,solid=false)=>{const o=mesh(bevelGeometry(w,h,d),mat,x,cy,z);if(solid)e.bodies.push(collider(x,cy,z,w,h,d));return o;};
  const label=(text,x,cy,z)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#32373a';ctx.fillRect(0,0,512,96);ctx.fillStyle='#e5d9bd';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,61,490);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.SpriteMaterial({map:texture,depthTest:true});const sprite=new THREE.Sprite(mat);sprite.position.set(x,cy,z);sprite.scale.set(10,1.875,1);e.group.add(sprite);e.label=sprite;};
  const npc=(x,z,color)=>{const h=heightAt(x,z);mesh(new THREE.CapsuleGeometry(.32,.9,3,7),color,x,h+1,z);mesh(new THREE.SphereGeometry(.24,8,6),m.paint,x,h+1.8,z);};
  if(p.kind==='network-core'){
   mesh(new THREE.CylinderGeometry(8,9,1,16),m.dark,p.x,y+.25,p.z);e.bodies.push(collider(p.x,y+.2,p.z,12,.7,12));
   for(const dx of [-5.5,5.5])block(1.4,10,1.5,m.steel,p.x+dx,y+5.3,p.z);
   mesh(new THREE.TorusGeometry(5.5,.6,5,20,Math.PI),m.rust,p.x,y+8,p.z);mesh(new THREE.CylinderGeometry(2,2.6,5,12),m.steel,p.x,y+3,p.z);
   e.indicator=mesh(new THREE.TorusGeometry(2.1,.16,4,14),m.paint,p.x,y+4,p.z);e.indicator.rotation.x=Math.PI/2;
   block(1.6,1.2,.8,m.paint,p.x-1,y+1.4,p.z+8,true);
   for(const dx of [-6,6])for(const dz of [-7,7])mesh(new THREE.CylinderGeometry(.16,.23,.8,6),m.rust,p.x-14+dx,heightAt(p.x-14+dx,p.z+10+dz)+.4,p.z+10+dz);
   const pg=new THREE.ConeGeometry(.3,1,3),plants=e.plants=new THREE.InstancedMesh(pg,m.leaf,160),r=randomSeed(3000+p.z),dummy=new THREE.Object3D();e.plantPositions=[];
   for(let i=0;i<160;i++){const z=p.z+(r()-.5)*800,x=roadX(z)+(i%2?1:-1)*(9+r()*24);e.plantPositions.push({x,y:heightAt(x,z),z,s:.4+r()});dummy.scale.setScalar(.001);dummy.updateMatrix();plants.setMatrixAt(i,dummy.matrix);}plants.visible=false;e.group.add(plants);label(p.name,p.x,y+13,p.z);
  }else if(p.kind==='vault'){
   block(8,1.5,7,m.dark,p.x,y+.5,p.z,true);for(const dx of [-4,4])block(.5,3,7,m.steel,p.x+dx,y+1.5,p.z);
   e.door=block(5,.3,4,m.rust,p.x,y+1.4,p.z);e.doorBody=collider(p.x,y+1.5,p.z,5,.4,4);
   block(1.3,1.2,.7,m.paint,p.x-1,y+.8,p.z+6,true);e.seed=mesh(new THREE.CylinderGeometry(.45,.45,2,10),m.paint,p.x,y+2,p.z);e.seed.rotation.z=Math.PI/2;label(p.name,p.x,y+5,p.z);
  }else if(p.kind==='shelter'){
   block(10,.2,11,m.steel,p.x,y+.1,p.z,true);for(const dx of [-5,5])block(.2,4,11,m.steel,p.x+dx,y+2,p.z,true);block(10,4,.2,m.rust,p.x,y+2,p.z-5.5,true);block(10.5,.25,11.5,m.steel,p.x,y+4.2,p.z);
   for(const dx of [-3.5,3.5])block(3,4,.2,m.rust,p.x+dx,y+2,p.z+5.5,true);
   npc(p.x,p.z-1,m.rust);block(3,.7,1,m.dark,p.x,y+.6,p.z-2);for(const dx of [-3,3])mesh(new THREE.CylinderGeometry(.5,.5,1.4,8),m.rust,p.x+dx,y+.8,p.z-2);
   if(p.id==='afonso'){e.pump=mesh(new THREE.CylinderGeometry(.5,.8,3,10),m.steel,p.x+8,heightAt(p.x+8,p.z)+1.5,p.z);}
   if(p.id==='noemia'){block(.25,16,.25,m.steel,p.x+8,y+8,p.z);mesh(new THREE.TorusGeometry(2,.12,4,14),m.rust,p.x+8,y+15,p.z);}
   if(p.id==='joel'){e.lia=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.9,3,7),m.paint);body.position.set(p.x+2,y+1,p.z+1);e.lia.add(body);e.group.add(e.lia);}
   label(`${p.name} · ${p.npc}`,p.x,y+6,p.z);
  }else if(p.kind==='cache'){
   for(const dx of [-3,3])block(.3,4,.3,m.rust,p.x+dx,y+2,p.z);block(7,.2,5,m.steel,p.x,y+4,p.z);e.cache=block(2,.9,1.4,m.paint,p.x,y+.5,p.z);label(p.name,p.x,y+5.5,p.z);
  }else if(p.kind==='hazard'){
   const x=p.x,z=p.z,h=heightAt(x,z);e.blocker=new THREE.Group();e.group.add(e.blocker);const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),m.rock);rock.scale.set(10,2.5,12);rock.position.set(x,h+1.4,z);e.blocker.add(rock);e.makeBarrier=()=>collider(x,h+1.2,z,15,2.4,18);
   if(p.id==='city-viaduct'){for(const dx of [-14,14])block(2,9,3,m.steel,x+dx,h+4.5,z,true);block(36,1.1,5,m.steel,x,h+9,z+15);}
   if(p.kind==='hazard'&&p.id==='city-tunnel'){
    for(const dx of [-7,7])block(1,6,80,m.dark,x+dx,h+3,z,true);block(15,1,80,m.steel,x,h+6.5,z,true);e.water=mesh(new THREE.PlaneGeometry(12,78),m.water,x,h+.4,z);e.water.rotation.x=-Math.PI/2;e.blocker.visible=false;
   }
   label(p.name,x+16,h+6,z);
  }
  const excluded=new Set([e.door,e.seed,e.indicator,e.pump,e.cache,e.water].filter(Boolean));mergeStatic(e.group,excluded);return e;
 }
 update(c,position,dt){
  for(const p of this.defs){const close=Math.hypot(position.x-p.x,position.z-p.z)<1000;if(close&&!this.live.has(p.id))this.live.set(p.id,this.build(p));else if(!close&&this.live.has(p.id)){this.remove(this.live.get(p.id));this.live.delete(p.id);}}
  for(const e of this.live.values()){const p=e.p;
   if(p.kind==='vault'){const opened=p.core==='core-1'||c.network.seeds[p.core].obtained;e.door.position.x=p.x+(opened?4:0);e.seed.visible=!opened;if(opened&&e.doorBody){this.physics.removeRigidBody(e.doorBody);e.doorBody=null;}}
   if(e.cache)e.cache.visible=!c.network.looted.includes(p.id);
   if(e.lia)e.lia.visible=c.network.quests.supply==='completed';if(e.pump)e.pump.material=c.network.quests.pump==='completed'?this.m.light:this.m.steel;
   if(e.plants){const active=c.cores[p.core].state==='active';e.plants.visible=active;e.indicator.material=active?this.m.leaf:this.m.paint;e.growth+=(Number(active)-e.growth)*Math.min(1,dt*.55);if(active){const d=new THREE.Object3D();e.plantPositions.forEach((p,i)=>{d.position.set(p.x,p.y+p.s*e.growth/2,p.z);d.scale.setScalar(p.s*e.growth);d.updateMatrix();e.plants.setMatrixAt(i,d.matrix);});e.plants.instanceMatrix.needsUpdate=true;}}
   if(p.kind==='hazard'){const restored=c.cores[p.core].state==='active',front=weatherAt(c,p.z).front,solid=!restored&&p.id!=='city-tunnel'&&p.id!=='salt-crust'&&(p.id!=='storm-front'||front);e.blocker.visible=solid;if(e.water)e.water.visible=!restored;if(solid&&!e.barrierBody)e.barrierBody=e.makeBarrier();else if(!solid&&e.barrierBody){this.physics.removeRigidBody(e.barrierBody);e.barrierBody=null;}}
  }
  const w=weatherAt(c,position.z);this.rain.visible=w.restored&&w.region!=='ashes';this.rain.position.copy(position);if(this.rain.visible){for(let i=1;i<this.rainPositions.length;i+=3){this.rainPositions[i]-=dt*12;if(this.rainPositions[i]<0)this.rainPositions[i]=24;}this.rain.geometry.attributes.position.needsUpdate=true;}
 }
 atmosphere(c,position,dt,rendering){if(position.z>-5800)return;const w=weatherAt(c,position.z),base=1.6/rendering.preset.distance;rendering.scene.fog.density=base*w.fog;rendering.scene.fog.color.lerp(new THREE.Color(w.restored?'#a9bec3':w.front?'#626775':w.region==='salt'?'#c1b69e':'#88908e'),Math.min(1,dt));rendering.sky.material.uniforms.top.value.lerp(new THREE.Color(w.restored?'#6f9ba8':w.front?'#363f52':w.region==='glass'?'#61717f':'#4f6575'),Math.min(1,dt));rendering.sky.material.uniforms.bottom.value.lerp(new THREE.Color(w.restored?'#bfc9bc':w.front?'#7d8190':'#b7a68c'),Math.min(1,dt));}
 snapshot(){return {entities:this.live.size,rain:this.rain.visible,cores:Object.fromEntries([...this.live.values()].filter(e=>e.plants).map(e=>[e.p.core,{plants:e.plants.visible,count:e.plants.count,growth:e.growth}])),barriers:Object.fromEntries([...this.live.values()].filter(e=>e.p.kind==='hazard').map(e=>[e.p.id,!!e.barrierBody])),floods:Object.fromEntries([...this.live.values()].filter(e=>e.water).map(e=>[e.p.id,e.water.visible])),vaults:Object.fromEntries([...this.live.values()].filter(e=>e.door).map(e=>[e.p.core,!e.doorBody])),liaVisible:[...this.live.values()].some(e=>e.lia?.visible)};}
 remove(e){for(const b of [...e.bodies,e.doorBody,e.barrierBody].filter(Boolean))this.physics.removeRigidBody(b);e.group.traverse(o=>{o.geometry?.dispose();if(o.isInstancedMesh)o.dispose();if(o.isSprite){o.material.map?.dispose();o.material.dispose();}});e.group.removeFromParent();}
 reset(){for(const e of this.live.values())this.remove(e);this.live.clear();}
 dispose(){this.reset();this.rain.geometry.dispose();this.rain.material.dispose();this.rain.removeFromParent();}
}