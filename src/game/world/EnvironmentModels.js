import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { heightAt,roadX } from './terrain.js';

// Curated traces of the old inhabited road. They leave the lane and interaction areas clear.
const PLACEMENTS=[
 {id:'abandoned-sedan',model:'wreck-sedan',z:-180,offset:-18,yaw:.32},
 {id:'evacuated-hatch',model:'wreck-hatchback',z:-470,offset:17,yaw:-.6},
 {id:'workshop-utility',model:'wreck-utility',z:-1620,offset:-60,yaw:1.2},
 {id:'core-approach-sedan',model:'wreck-sedan',z:-2740,offset:20,yaw:-.25},
];
export class EnvironmentModels {
 constructor(scene,physics,assets,definitions={}){this.scene=scene;this.physics=physics;this.assets=assets;this.definitions=definitions;this.live=new Map();this.disposed=false;}
 update(position,distance){
 const radius=Math.min(550,distance+80);
 for(const p of PLACEMENTS){
 const definition=this.definitions[p.model];if(definition?.status!=='installed'||definition.rightsCleared!==true)continue;
 const x=roadX(p.z)+p.offset,close=Math.hypot(position.x-x,position.z-p.z)<radius;
 if(!close&&this.live.has(p.id)){this.remove(this.live.get(p.id));this.live.delete(p.id);}
 else if(close&&!this.live.has(p.id)){
 const e={id:p.id,removed:false};this.live.set(p.id,e);
 this.assets.model(definition.url).then(lease=>{
 if(this.disposed||e.removed){lease.release();return;}
 e.lease=lease;const root=e.root=new THREE.Group();root.name=p.id;root.position.set(x,heightAt(x,p.z),p.z);root.rotation.y=p.yaw;root.add(lease.scene);this.scene.add(root);
 const [w,h,l]=definition.dimensions;
 e.body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,root.position.y+h/2,p.z).setRotation({x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)}));
 this.physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,l/2).setFriction(.75),e.body);
 }).catch(error=>{if(!this.disposed&&!e.removed)this.assets.errors.push(`environment ${p.model}: ${error.message}`);});
 }
 }
 }
 snapshot(){return {loaded:[...this.live.values()].filter(e=>e.root).length,loading:[...this.live.values()].filter(e=>!e.root).length,ids:[...this.live.keys()]};}
 remove(e){e.removed=true;e.root?.removeFromParent();if(e.body)this.physics.removeRigidBody(e.body);e.lease?.release();}
 dispose(){this.disposed=true;for(const e of this.live.values())this.remove(e);this.live.clear();}
}