import { beforeAll,describe,it,expect } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { cameraPosition } from '../../src/game/render/cameraCollision.js';
import { Cameras } from '../../src/game/render/Cameras.js';
import { FixedLoop } from '../../src/game/core/FixedLoop.js';
beforeAll(async()=>{await RAPIER.init();});
describe('câmeras com volume e vínculo à cabine',()=>{
 it('a esfera recua diante de uma parede e não colide com o próprio caminhão',()=>{const w=new RAPIER.World({x:0,y:0,z:0});w.createCollider(RAPIER.ColliderDesc.cuboid(10,10,.5).setTranslation(0,2,5));const body=w.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,2,2));w.createCollider(RAPIER.ColliderDesc.ball(1),body);w.step();const p=cameraPosition(w,new THREE.Vector3(0,2,0),new THREE.Vector3(0,2,10),body);expect(p.z).toBeGreaterThan(3.8);expect(p.z).toBeLessThan(4.5);w.free();});
 it('protege bordas da câmera quando um raio central passaria livre',()=>{const w=new RAPIER.World({x:0,y:0,z:0});w.createCollider(RAPIER.ColliderDesc.cuboid(.05,2,.1).setTranslation(.2,2,5));w.step();const p=cameraPosition(w,new THREE.Vector3(0,2,0),new THREE.Vector3(0,2,10));expect(p.z).toBeLessThan(5);w.free();});
 it('a posição interna acompanha imediatamente a cabine, sem arrasto em coordenadas do mundo',()=>{const root=new THREE.Group(),cab=new THREE.Group();root.add(cab);const camera=new THREE.PerspectiveCamera(54,1,.1,100),cameras=new Cameras(camera);cameras.mode=1;cameras.update({root,cab},false,0,1/60);root.position.z=-100;cameras.update({root,cab},false,1,1/60);expect(camera.position.z).toBeCloseTo(-101.98,5);expect(camera.position.x).toBeCloseTo(-.62,5);expect(camera.position.y).toBeCloseTo(1.95,5);expect(camera.getWorldDirection(new THREE.Vector3()).z).toBeLessThan(-.9);});
 it('acompanhamento segue o rumo, enquanto a órbita livre conserva o ângulo do mundo',()=>{const root=new THREE.Group();root.rotation.y=Math.PI/2;const a=new THREE.PerspectiveCamera(),b=new THREE.PerspectiveCamera(),follow=new Cameras(a),orbit=new Cameras(b);orbit.mode=2;follow.update(root,false,0,1/60);orbit.update(root,false,0,1/60);expect(a.position.x).toBeGreaterThan(8);expect(b.position.z).toBeGreaterThan(8);});
 it('a câmera externa usa a colisão também depois da suavização',()=>{const w=new RAPIER.World({x:0,y:0,z:0});w.createCollider(RAPIER.ColliderDesc.cuboid(10,10,.5).setTranslation(0,3,5));w.step();const root=new THREE.Group(),camera=new THREE.PerspectiveCamera(54,1,.1,100),cameras=new Cameras(camera,w);cameras.angle=0;for(let i=0;i<60;i++)cameras.update(root,false,i/60,1/60);expect(camera.position.z).toBeLessThan(4.5);w.free();});
});
describe('relógio de simulação',()=>{
 it('registra passos e tempo descartado; ignora deltas inválidos',()=>{const loop=new FixedLoop(1/60,30);let count=0;loop.advance(3,()=>count++);expect(count).toBe(30);expect(loop.droppedSeconds).toBeCloseTo(2.5);expect(loop.totalSteps).toBe(30);expect(Number.isFinite(loop.advance(NaN,()=>count++))).toBe(true);expect(count).toBe(30);loop.reset();expect(loop.stepsLastFrame).toBe(0);});
});
