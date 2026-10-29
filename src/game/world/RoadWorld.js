import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GENERATOR,ROAD_POINTS } from '../../data/road.js';
import { heightAt } from './terrain.js';
import { bevelGeometry } from '../render/materials.js';
import { mergeStatic } from '../render/mergeStatic.js';

// Postos, oficinas e o gerador do Núcleo 1. Só o que está perto do jogador existe (geometria e colisores).
export class RoadWorld {
  constructor(scene,physics,m){this.scene=scene;this.physics=physics;this.m=m;this.live=new Map();this.time=0;
    this.smokeMaterial=new THREE.MeshStandardMaterial({color:'#9d9d96',roughness:1,metalness:0,transparent:true,opacity:.34,depthWrite:false});}

  build(p){
    const m=this.m,e={p,group:new THREE.Group(),bodies:[],npc:null,smoke:[]},f=p.face??1,y=heightAt(p.x,p.z);
    this.scene.add(e.group);
    // Coordenadas locais: lx aponta para a estrada, lz é lateral. face=-1 gira a estrutura 180°.
    const W=(lx,lz)=>({x:p.x+f*lx,z:p.z+f*lz});
    const mesh=(geo,mat,lx,hy,lz)=>{const o=new THREE.Mesh(geo,mat),w=W(lx,lz);o.position.set(w.x,y+hy,w.z);o.castShadow=o.receiveShadow=true;e.group.add(o);return o;};
    const solid=(lx,hy,lz,w,h,d)=>{const q=W(lx,lz),b=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());this.physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(q.x,y+hy,q.z),b);e.bodies.push(b);};
    const blk=(w,h,d,mat,lx,hy,lz,hard=false)=>{const o=mesh(bevelGeometry(w,h,d),mat,lx,hy,lz);if(hard)solid(lx,hy,lz,w,h,d);return o;};
    const cyl=(r,h,mat,lx,hy,lz,seg=10)=>mesh(new THREE.CylinderGeometry(r,r,h,seg),mat,lx,hy,lz);
    const label=(text,lx,hy,lz)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#32373a';ctx.fillRect(0,0,512,96);ctx.fillStyle='#e5d9bd';ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,61,490);
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:true})),w=W(lx,lz);sprite.position.set(w.x,y+hy,w.z);sprite.scale.set(10,1.875,1);e.group.add(sprite);return sprite;};
    const person=(wx,wz,wy,body,hat=true)=>{
      const g=new THREE.Group(),add=(geo,mat,px,py,pz)=>{const o=new THREE.Mesh(geo,mat);o.position.set(px,py,pz);o.castShadow=true;g.add(o);return o;};
      add(new THREE.CapsuleGeometry(.32,.9,3,7),body,0,1,0);add(new THREE.SphereGeometry(.24,8,6),m.paint,0,1.8,0);
      if(hat)add(new THREE.SphereGeometry(.28,8,5,0,Math.PI*2,0,Math.PI/2),m.rust,0,1.88,0);
      add(bevelGeometry(.34,.1,.22),m.dark,0,1.78,.2);
      g.position.set(wx,wy,wz);e.group.add(g);
      const b=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());this.physics.createCollider(RAPIER.ColliderDesc.cuboid(.35,.95,.35).setTranslation(wx,wy+.95,wz),b);e.bodies.push(b);return g;
    };
    const pad=(w,d)=>{blk(w,.4,d,m.steel,0,-.1,0,true);blk(w-.6,4,d-.6,m.dark,0,-2.3,0,false);};

    if(p.kind==='gas'){
      pad(16,20);
      blk(5,3.4,8,m.paint,-4.5,1.8,0,true);blk(6.2,.3,9.2,m.rust,-4.5,3.65,0);                        // loja e telhadinho
      blk(.12,1.2,5.4,m.glass,-1.95,2.1,0);blk(.12,.25,6,m.light,-1.95,3.2,0);blk(.12,2.2,1.3,m.dark,-1.97,1.2,-2.7);
      blk(9,.35,12,m.steel,3.5,4.5,0);blk(6,.08,.5,m.light,3.5,4.28,0);                                 // cobertura das bombas
      for(const lx of [-.3,6.9])for(const lz of [-5.6,5.6])blk(.35,4.4,.35,m.steel,lx,2.3,lz,true);
      blk(1.6,.25,7,m.dark,3,.22,0);
      for(const lz of [-2.6,2.6]){blk(.8,1.8,.7,m.rust,3,1.1,lz,true);blk(.1,.4,.5,m.light,3.42,1.6,lz);cyl(.05,1.6,m.rubber,2.55,1.0,lz,5);}
      blk(.4,9,.4,m.steel,7.2,4.6,-8.8,true);blk(.3,2.4,4.2,m.paint,7.2,8.4,-8.8);                    // placa alta
      cyl(.5,1.1,m.rust,-8,.7,-7.5,9);cyl(.5,1.1,m.rust,-8,.7,-6.2,9);
      e.sign=label(`${p.name} · ${p.npc}`,-1,6.1,0);
      e.npc=person(W(-1,.5).x,W(-1,.5).z,y+.1,m.rust);
    }else if(p.kind==='workshop'){
      pad(16,18);
      blk(.3,4.4,14,m.rust,-7,2.3,0,true);for(const lz of [-7,7])blk(14,4.4,.3,m.rust,0,2.3,lz,true);   // três paredes, frente aberta
      blk(15,.35,15,m.steel,0,4.6,0);for(const lz of [-7,7])blk(.35,4.4,.35,m.steel,7,2.3,lz,true);
      for(const lz of [-2.4,2.4])blk(.4,2.4,.4,m.steel,-2,1.3,lz,true);blk(.35,.3,5.2,m.rust,-2,2.35,0);   // elevador de carro
      blk(1.4,1,6,m.dark,-6.2,.6,0,true);blk(.3,.2,.6,m.paint,-6.2,1.2,-1.5);blk(.5,.15,.5,m.steel,-6.2,1.17,1.2);
      blk(.1,1.6,4.8,m.dark,-6.8,3,0);blk(.6,.15,.6,m.light,1,4.3,0);
      for(const hy of [.3,.7,1.1])cyl(.55,.4,m.rubber,4,hy,5.5,12);
      for(const lz of [-5.5,-4.2])cyl(.5,1.2,m.rust,5.5,.8,lz,9);
      blk(.3,1.6,6,m.paint,7.2,4.1,0);
      e.sign=label(`${p.name} · ${p.npc}`,1,6.2,0);
      e.npc=person(W(1.5,-2).x,W(1.5,-2).z,y+.1,m.dark);
    }else if(p.kind==='tech'){
      // Gerador do Núcleo 1, em coordenadas do mundo.
      const gx=GENERATOR.x,gz=GENERATOR.z,gy=heightAt(gx,gz),at=(w,h,d,mat,x,hy,z,hard=false)=>{const o=new THREE.Mesh(bevelGeometry(w,h,d),mat);o.position.set(x,gy+hy,z);o.castShadow=o.receiveShadow=true;e.group.add(o);
        if(hard){const b=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());this.physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,gy+hy,z),b);e.bodies.push(b);}return o;};
      at(6,.3,4.6,m.dark,gx,.05,gz);                                                                       // base de concreto
      at(3.4,1.7,1.9,m.rust,gx,1.1,gz,true);at(3.1,.14,1.7,m.steel,gx,2.0,gz);                          // corpo do gerador
      at(.9,.9,.1,m.paint,gx-1.72,1.3,gz);                                                                // painel
      const tank=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.8,10),m.steel);tank.rotation.z=Math.PI/2;tank.position.set(gx+.2,gy+2.6,gz);tank.castShadow=true;e.group.add(tank);
      const stack=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2.4,6),m.steel);stack.position.set(gx+1.1,gy+3.4,gz+.6);e.group.add(stack);
      e.fan=new THREE.Mesh(new THREE.BoxGeometry(.08,1.1,.2),m.dark);e.fan.position.set(gx+1.76,gy+1.1,gz);e.fan.castShadow=true;e.group.add(e.fan);
      e.lamp=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),m.rubber);e.lamp.position.set(gx-1.74,gy+1.85,gz);e.group.add(e.lamp);
      const x0=gx-2.6,z0=gz+.4,x1=24.6,z1=-2883.4,len=Math.hypot(x1-x0,z1-z0),n=Math.ceil(len/2.2);
      for(let i=0;i<n;i++){const t=(i+.5)/n,cx=x0+(x1-x0)*t,cz=z0+(z1-z0)*t,c=new THREE.Mesh(new THREE.BoxGeometry(len/n+.05,.12,.14),m.rubber);c.position.set(cx,heightAt(cx,cz)+.1,cz);c.rotation.y=-Math.atan2(z1-z0,x1-x0);e.group.add(c);}  // cabos até o Núcleo
      for(let i=0;i<5;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.3,6,5),this.smokeMaterial);s.position.set(gx+1.1,gy+4.6,gz+.6);s.visible=false;e.group.add(s);e.smoke.push(s);}
      e.gy=gy;e.sign=label(`${p.npc} · ${p.title}`,0,4,0);
      e.npc=person(p.x,p.z,y,m.rust);
    }
    const skip=new Set([e.fan,e.lamp,...e.smoke].filter(Boolean));mergeStatic(e.group,skip);return e;
  }

  update(c,position,dt){
    this.time+=dt;
    for(const p of ROAD_POINTS){
      const d=Math.hypot(position.x-p.x,position.z-p.z);
      if(d<1000&&!this.live.has(p.id))this.live.set(p.id,this.build(p));
      else if(d>1150&&this.live.has(p.id)){this.remove(this.live.get(p.id));this.live.delete(p.id);}
    }
    for(const e of this.live.values()){
      const p=e.p;
      if(e.npc){const dx=position.x-e.npc.position.x,dz=position.z-e.npc.position.z;if(dx*dx+dz*dz<900)e.npc.rotation.y=Math.atan2(dx,dz);}
      if(p.kind==='tech'){
        const on=c.road.generator;e.lamp.material=on?this.m.light:this.m.rubber;e.fan.rotation.x+=dt*(on?22:0);
        e.smoke.forEach((s,i)=>{s.visible=on;if(!on)return;const t=(this.time*.55+i/e.smoke.length)%1;s.position.y=e.gy+4.6+t*3.2;s.scale.setScalar(.7+t*1.8);});
      }
    }
  }
  snapshot(){return {entities:this.live.size,ids:[...this.live.keys()]};}
  remove(e){
    for(const b of e.bodies)this.physics.removeRigidBody(b);
    e.group.traverse(o=>{o.geometry?.dispose();if(o.isSprite){o.material.map?.dispose();o.material.dispose();}});
    e.group.removeFromParent();
  }
  reset(){for(const e of this.live.values())this.remove(e);this.live.clear();}
  dispose(){this.reset();this.smokeMaterial.dispose();}
}
