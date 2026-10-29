import RAPIER from '@dimforge/rapier3d-compat';
import { VehiclePhysics } from '../src/game/physics/VehiclePhysics.js';
import { FixedLoop } from '../src/game/core/FixedLoop.js';
import { mkdir,writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
await RAPIER.init();
function run({fps=60,loaded=false,grade=0,seconds=12,reverse=false}={}){
 const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=1/60;
 world.createCollider(RAPIER.ColliderDesc.cuboid(500,.5,4000).setTranslation(0,-.5,0).setRotation({x:Math.sin(grade/2),y:0,z:0,w:Math.cos(grade/2)}));
 const points=[];for(const z of [-2.5,1.45,2.9])for(const x of [-1.2,1.2])points.push({x,y:-.1,z});
 const vehicle=new VehiclePhysics(world,points),state={engineOn:true,loaded,fuel:100,temperature:70,speed:0};
 for(let i=0;i<180;i++){vehicle.update({throttle:0,steer:0,handbrake:true},state,1/60);world.step();}
 const loop=new FixedLoop(1/60,30),samples=[];let steps=0;
 for(let frame=0;frame<seconds*fps;frame++)loop.advance(1/fps,dt=>{
  vehicle.update({throttle:reverse?-1:1,steer:0,handbrake:false},state,dt);world.step();steps++;
  if(steps%60===0)samples.push({second:steps/60,speedKmh:vehicle.signedSpeed()*3.6,rpm:state.rpm??null,gear:state.gearLabel??null,position:vehicle.body.translation(),massKg:vehicle.body.mass()});
 });
 const result={fps,loaded,grade,seconds,steps,speedKmh:vehicle.signedSpeed()*3.6,position:vehicle.body.translation(),massKg:vehicle.body.mass(),samples};world.free();return result;
}
const result={generatedAt:new Date().toISOString(),renderer:'Rapier WASM; sem renderização',cases:[... [15,30,60,120].map(fps=>run({fps})),run({loaded:true}),run({grade:.06}),run({reverse:true})]};
const at=process.argv.indexOf('--output');if(at>=0){const path=process.argv[at+1];await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(result,null,2));}
console.log(JSON.stringify(result.cases.map(({samples,...c})=>c),null,2));
