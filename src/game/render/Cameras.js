import * as THREE from 'three';
import { heightAt } from '../world/terrain.js';
import { cameraPosition } from './cameraCollision.js';
export class Cameras {
 constructor(camera,world,body,settings={}){this.camera=camera;this.world=world;this.body=body;this.mode=0;this.angle=.27;this.elevation=.3;this.cabYaw=0;this.cabPitch=.1;this.headYaw=0;this.headPitch=.1;this.distance=14;this.target=new THREE.Vector3();this.desired=new THREE.Vector3();this.focus=new THREE.Vector3();this.anchor=new THREE.Vector3();this.initial=true;this.applySettings(settings);}
 applySettings(settings){if(this.settings?.cameraDistance!==settings.cameraDistance)this.distance=settings.cameraDistance||14;this.settings=settings;}
 cycle(){this.mode=(this.mode+1)%3;this.cabYaw=0;this.cabPitch=.1;this.transition=.28;this.orbitIdle=0;}
 orbit(dx,dy){this.orbitIdle=0;if(this.mode===1){this.cabYaw=Math.max(-1.15,Math.min(1.15,this.cabYaw-dx*.003));this.cabPitch=Math.max(-.35,Math.min(.48,this.cabPitch+dy*.003));}else{this.angle-=dx*.005;this.elevation=Math.max(.05,Math.min(1.1,this.elevation+dy*.004));}}
 zoom(delta){if(this.mode!==1)this.distance=Math.max(6,Math.min(25,this.distance+delta*.01));}
 update(truck,menu,time,dt){
  const root=truck.root||truck,p=root.position,q=root.quaternion,inside=this.mode===1&&!menu;
  if(menu){this.desired.set(11+Math.sin(time*.06)*1.2,4.7,-9).add(p);this.focus.copy(p).add(new THREE.Vector3(-2,1.1,-.5));}
  else if(inside){
   const cab=truck.cab||root;cab.updateWorldMatrix(true,false);this.desired.set(-.62,1.95,-1.98).applyMatrix4(cab.matrixWorld);
   this.camera.up.set(0,1,0).transformDirection(cab.matrixWorld);
   const headAlpha=1-Math.exp(-dt*12);this.headYaw+=(this.cabYaw-this.headYaw)*headAlpha;this.headPitch+=(this.cabPitch-this.headPitch)*headAlpha;
   const direction=new THREE.Vector3(-Math.sin(this.headYaw)*Math.cos(this.headPitch),-Math.sin(this.headPitch),-Math.cos(this.headYaw)*Math.cos(this.headPitch)).transformDirection(cab.matrixWorld);this.focus.copy(this.desired).addScaledVector(direction,40);
  }else{
   this.orbitIdle=(this.orbitIdle||0)+dt;if(this.mode===0&&this.orbitIdle>1.6){this.angle+=(.27-this.angle)*(1-Math.exp(-dt*.7));this.elevation+=(.3-this.elevation)*(1-Math.exp(-dt*.7));}
   const offset=new THREE.Vector3(Math.sin(this.angle)*this.distance,Math.sin(this.elevation)*this.distance+1,Math.cos(this.angle)*this.distance);
   if(this.mode===0)offset.applyQuaternion(q);this.desired.copy(offset.add(p));this.desired.y=Math.max(this.desired.y,heightAt(this.desired.x,this.desired.z)+.6);this.focus.set(0,1.4,this.mode===0?-3:0).applyQuaternion(q).add(p);
  }
  if(!inside)this.camera.up.set(0,1,0);
  this.anchor.set(0,1.5,0).applyQuaternion(q).add(p);
  if(!menu&&!inside)this.desired.copy(cameraPosition(this.world,this.anchor,this.desired,this.body));
  this.transition=Math.max(0,(this.transition||0)-dt);
  const a=this.initial||inside&&!this.transition?1:1-Math.exp(-dt*(inside?14:5));this.camera.position.lerp(this.desired,a);if(inside)this.target.copy(this.focus);else this.target.lerp(this.focus,this.initial?1:1-Math.exp(-dt*5));
  if(!menu&&!inside)this.camera.position.copy(cameraPosition(this.world,this.anchor,this.camera.position,this.body));
  this.camera.lookAt(this.target);const fov=inside?64:54;if(this.camera.fov!==fov){this.camera.fov=fov;this.camera.updateProjectionMatrix();}this.initial=false;
 }
 snapshot(){return {position:this.camera.position.toArray(),target:this.target.toArray(),mode:this.mode,distance:this.distance,fov:this.camera.fov,angle:this.angle,elevation:this.elevation};}
}
