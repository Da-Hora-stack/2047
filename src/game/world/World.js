import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { CONFIG } from '../../data/config.js';
import { heightAt, roadX, roadHeight, randomSeed,detourX,regionAt,networkDetourX,roadHalfWidth,routeAt } from './terrain.js';
import { bevelGeometry } from '../render/materials.js';
import { terrainGeometry } from './terrainGeometry.js';
import { roadRibbon } from './roadGeometry.js';
import { BIOMES,ROUTES } from '../../data/network.js';
import { restoredAt } from '../missions/network.js';
import { mergeStatic } from '../render/mergeStatic.js';
export class World {
constructor(scene,physics,materials) {
this.scene=scene;this.physics=physics;this.m=materials;this.sectors=new Map();this.queue=[];this.disposed=false;
this.rockGeometry=new THREE.DodecahedronGeometry(1,0);this.farRockGeometry=new THREE.OctahedronGeometry(1,0);
this.stripeGeometry=new THREE.PlaneGeometry(.14,3.5);this.stripeGeometry.rotateX(-Math.PI/2);
this.rockMaterial=materials.rock;this.ruinGeometry=bevelGeometry(1,1,1);this.terrainMaterials=[materials.ground,materials.ground,materials.cityGround,materials.cityRestored,materials.salt,materials.saltRestored,materials.glassGround,materials.glassRestored,materials.stormGround,materials.stormRestored];
this.landmarks=new THREE.Group();scene.add(this.landmarks);this.landmarkBodies=[];this.buildLandmarks();mergeStatic(this.landmarks);
}
collider(desc,bodyList) {const body=this.physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());this.physics.createCollider(desc,body);bodyList.push(body);return body;}
update(position,distance) {
const size=CONFIG.world.sectorSize,cx=Math.round(position.x/size),cz=Math.round(position.z/size);
const desired=new Set();for(let x=cx-1;x<=cx+1;x++)for(let z=cz-1;z<=cz+1;z++){const k=`${x},${z}`;desired.add(k);if(!this.sectors.has(k)&&!this.queue.some(s=>s.key===k))this.queue.push({key:k,x,z});}
for(const [key,sector] of this.sectors)if(!desired.has(key)){this.remove(sector);this.sectors.delete(key);}
this.queue=this.queue.filter(s=>desired.has(s.key));
this.queue.sort((a,b)=>(a.x-cx)**2+(a.z-cz)**2-((b.x-cx)**2+(b.z-cz)**2));
if(this.queue.length){const job=this.queue.shift();this.sectors.set(job.key,this.buildSector(job.x,job.z));}
// Le renderer effectue ensuite le culling par frustum, même pour les instances.
for(const s of this.sectors.values()) {s.group.visible=Math.abs(s.x*size-position.x)<size/2+distance && Math.abs(s.z*size-position.z)<size/2+distance;}
}
buildSector(cx,cz) {
const size=CONFIG.world.sectorSize;
const group=new THREE.Group();this.scene.add(group);const bodies=[];const owned=[];
const g=terrainGeometry(cx,cz);owned.push(g);
this.terrainGroups(g);const terrain=new THREE.Mesh(g,this.terrainMaterials);terrain.receiveShadow=true;group.add(terrain);
this.collider(RAPIER.ColliderDesc.trimesh(new Float32Array(g.attributes.position.array),new Uint32Array(g.index.array)).setFriction(.8),bodies);
const low=cz*size-size/2, high=cz*size+size/2;
const start=Math.max(-CONFIG.world.roadLength,low),end=Math.min(80,high);
if(start<end && Math.abs(cx*size)<size/2+60) {
const roadG=roadRibbon({start,end,center:roadX,width:roadHalfWidth,sectorX:cx,sectorSize:size});
if(roadG){
const mesh=new THREE.Mesh(roadG,this.m.asphalt);mesh.receiveShadow=true;group.add(mesh);owned.push(roadG);
this.collider(RAPIER.ColliderDesc.trimesh(new Float32Array(roadG.attributes.position.array),new Uint32Array(roadG.index.array)).setFriction(1),bodies);
const count=Math.floor((end-start)/12);if(count>0){const stripes=new THREE.InstancedMesh(this.stripeGeometry,this.m.stripe,count);const dummy=new THREE.Object3D();for(let i=0;i<count;i++){const z=start+i*12+6;dummy.position.set(roadX(z),roadHeight(z)+.115,z);dummy.rotation.y=Math.atan2(roadX(z+1)-roadX(z-1),2);dummy.updateMatrix();stripes.setMatrixAt(i,dummy.matrix);}group.add(stripes);}
}
}
const ds=Math.max(-1750,low),de=Math.min(-650,high);
if(ds<de){
const roadG=roadRibbon({start:ds,end:de,center:detourX,width:5,shoulder:0,sectorX:cx,sectorSize:size});
if(roadG){const mesh=new THREE.Mesh(roadG,this.m.asphalt);mesh.receiveShadow=true;group.add(mesh);owned.push(roadG);this.collider(RAPIER.ColliderDesc.trimesh(new Float32Array(roadG.attributes.position.array),new Uint32Array(roadG.index.array)).setFriction(1),bodies);}
}
for(const route of ROUTES){
const rs=Math.max(-route.end,low),re=Math.min(-route.start,high);if(rs>=re)continue;
const roadG=roadRibbon({start:rs,end:re,center:networkDetourX,width:5,shoulder:0,sectorX:cx,sectorSize:size});
if(roadG){const mesh=new THREE.Mesh(roadG,this.m.asphalt);mesh.receiveShadow=true;group.add(mesh);owned.push(roadG);this.collider(RAPIER.ColliderDesc.trimesh(new Float32Array(roadG.attributes.position.array),new Uint32Array(roadG.index.array)).setFriction(1),bodies);}
}
const r=randomSeed(CONFIG.seed+cx*7387+cz*19349),count=32;
const rocks=new THREE.InstancedMesh(this.rockGeometry,this.rockMaterial,count);rocks.castShadow=true;rocks.receiveShadow=true;
const farRocks=new THREE.InstancedMesh(this.farRockGeometry,this.rockMaterial,count);
const dummy=new THREE.Object3D();
for(let i=0;i<count;i++) {
let x=cx*size+(r()-.5)*size,z=cz*size+(r()-.5)*size;
if(Math.abs(x-roadX(z))<14)x=roadX(z)+(i%2?1:-1)*(17+r()*24);
if(z < -650 && z > -1750 && Math.abs(x-detourX(z))<14)x=detourX(z)+20;
const scale=1+r()*4;dummy.position.set(x-cx*size,heightAt(x,z)+scale*.2,z-cz*size);dummy.scale.set(scale,scale*.65,scale*.8);dummy.rotation.set(r(),r()*6,r());dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);farRocks.setMatrixAt(i,dummy.matrix);
this.collider(RAPIER.ColliderDesc.ball(scale*.7).setTranslation(x,heightAt(x,z)+scale*.2,z),bodies);
}
const rocksLod=new THREE.LOD();rocksLod.position.set(cx*size,0,cz*size);rocksLod.addLevel(rocks,0);rocksLod.addLevel(farRocks,240);group.add(rocksLod);
// Plus gros éléments au loin, sans multiplier les appels de rendu.
const hills=new THREE.InstancedMesh(this.rockGeometry,this.rockMaterial,14);
for(let i=0;i<14;i++){const z=cz*size+(r()-.5)*size,x=cx*size+(i%2?1:-1)*(180+r()*320);dummy.position.set(x,heightAt(x,z)-8,z);dummy.scale.set(50+r()*70,(18+r()*45)*(regionAt(z)==='glass'?2.8:1),45+r()*40);dummy.updateMatrix();hills.setMatrixAt(i,dummy.matrix);}const region=regionAt(cz*size);hills.visible=region!=='salt'&&region!=='cities';group.add(hills);
if(region==='cities'||region==='storm'){const buildings=new THREE.InstancedMesh(this.ruinGeometry,this.m.dark,18);buildings.castShadow=buildings.receiveShadow=true;for(let i=0;i<18;i++){const x=cx*size+(i%2?1:-1)*(220+r()*180),z=cz*size+(r()-.5)*size,h=region==='cities'?18+r()*45:12+r()*18,w=region==='cities'?12+r()*15:2;dummy.position.set(x,heightAt(x,z)+h/2,z);dummy.scale.set(w,h,region==='cities'?12:2);dummy.rotation.set(0,r()*.2,region==='storm'?.15:0);dummy.updateMatrix();buildings.setMatrixAt(i,dummy.matrix);this.collider(RAPIER.ColliderDesc.cuboid(w/2,h/2,6).setTranslation(x,heightAt(x,z)+h/2,z),bodies);}group.add(buildings);}
return {x:cx,z:cz,group,bodies,owned,terrain};
}
prime(position,distance){for(let i=0;i<9;i++)this.update(position,distance);}
setCampaign(c){this.campaign=c;const key=Object.values(c.cores).map(k=>k.state).join(',');if(this.restorationKey===key)return;this.restorationKey=key;for(const sector of this.sectors.values())this.terrainGroups(sector.terrain.geometry);}
terrainGroups(g){g.clearGroups();const a=g.attributes.position,indices=g.index.array;let start=0,previous=null;
for(let k=0;k<indices.length;k+=3){const z=(a.getZ(indices[k])+a.getZ(indices[k+1])+a.getZ(indices[k+2]))/3;const region=regionAt(z),mi=BIOMES.findIndex(r=>r.id===region)*2+Number(!!this.campaign&&restoredAt(this.campaign,z));if(previous!==null&&previous!==mi){g.addGroup(start,k-start,previous);start=k;}previous=mi;}g.addGroup(start,indices.length-start,previous);
}
buildLandmarks() {
const add=(geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;this.landmarks.add(o);return o;};
const block=(w,h,d,mat,x,y,z,collision=false)=>{const mesh=add(bevelGeometry(w,h,d),mat,x,y,z);if(collision)this.collider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z),this.landmarkBodies);return mesh;};
// Abrigo aberto, ao lado da estrada. Pórtico, chapa e toldo.
const sy=heightAt(-22,8);
for(const x of [-28,-17])for(const z of [2,13])block(.22,5,.22,this.m.rust,x,sy+2.5,z,true);
const roof=block(12,.18,14,this.m.steel,-22.5,sy+5.1,7.5);roof.rotation.z=.06;
block(11,4.1,.18,this.m.rust,-22.5,sy+2.2,14,true);
for(let i=0;i<16;i++)block(.08,4.1,.08,this.m.steel,-27.5+i*.67,sy+2.2,13.85);
block(1.8,1.3,2.6,this.m.dark,-25,sy+.7,10,true);
for(const x of [-18.5,-20])add(new THREE.CylinderGeometry(.45,.45,1.2,10),this.m.rust,x,sy+.6,11);
// Marco dominante: antigo complexo de armazenamento, vazio e silencioso.
const tx=-90,tz=-290,ty=heightAt(tx,tz);
const tank=add(new THREE.CylinderGeometry(12,12,23,20,1,true),this.m.rust,tx,ty+16,tz);
add(new THREE.ConeGeometry(12.5,4,20),this.m.dark,tx,ty+29,tz);
for(let i=0;i<6;i++){const a=i/6*Math.PI*2;block(.8,12,.8,this.m.dark,tx+Math.cos(a)*9,ty+6,tz+Math.sin(a)*9,true);}
for(const y of [6,23]){const ring=add(new THREE.TorusGeometry(12.1,.25,5,20),this.m.steel,tx,ty+y,tz);ring.rotation.x=Math.PI/2;}
for(const z of [-400,-450]){const x=100,y=heightAt(x,z);block(12,19,16,this.m.dark,x,y+9,z,true);block(1.9,47,1.9,this.m.rust,x+8,y+22,z,true);}
// Poteaux cassés et garde-corps ponctuels, jalons du trajet.
for(let i=0;i<20;i++){const z=-i*140-50,x=roadX(z)+10,y=heightAt(x,z);const pole=block(.22,7,.22,this.m.steel,x,y+3.5,z,true);pole.rotation.z=i%5===0?.22:0;block(3,.14,.14,this.m.dark,x,y+6.5,z);}
// Rocher repérable utilisé pour les essais de collision.
const rock=add(new THREE.DodecahedronGeometry(2,0),this.m.rock,11,heightAt(11,-32)+1,-32);this.collider(RAPIER.ColliderDesc.ball(1.7).setTranslation(rock.position.x,rock.position.y,rock.position.z),this.landmarkBodies);
}
remove(s) {this.scene.remove(s.group);s.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});s.bodies.forEach(b=>this.physics.removeRigidBody(b));s.owned.forEach(g=>g.dispose());}
dispose() {this.disposed=true;for(const s of this.sectors.values())this.remove(s);this.sectors.clear();this.landmarkBodies.forEach(b=>this.physics.removeRigidBody(b));this.scene.remove(this.landmarks);this.landmarks.traverse(o=>o.geometry?.dispose());this.rockGeometry.dispose();this.farRockGeometry.dispose();this.stripeGeometry.dispose();this.ruinGeometry.dispose();}
}