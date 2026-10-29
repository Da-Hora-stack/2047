import RAPIER from '@dimforge/rapier3d-compat';
import { writeFile } from 'node:fs/promises';
import { VehiclePhysics } from '../src/game/physics/VehiclePhysics.js';
await RAPIER.init();
const world=new RAPIER.World({x:0,y:-9.81,z:0});
try {
  world.createCollider(RAPIER.ColliderDesc.cuboid(500,.5,4000).setTranslation(0,-.5,0));
  const points=[];for(const z of [-2.5,1.45,2.9])for(const x of [-1.2,1.2])points.push({x,y:-.1,z});
  const truck=new VehiclePhysics(world,points),state={engineOn:true};
  for(let i=0;i<120;i++){world.step();truck.update({throttle:0,steer:0,handbrake:true},state,1/60);}
  let timeTo60=null,speedAt8=null;
  for(let i=1;i<=1800;i++){truck.update({throttle:1,steer:0,handbrake:false},state,1/60);world.step();const speed=truck.signedSpeed()*3.6;if(i===480)speedAt8=speed;if(speed>=60){timeTo60=i/60;break;}}
  const result={speedAt8Kmh:speedAt8,timeTo60Seconds:timeTo60,surface:'asfalto',cargo:false,stepSeconds:1/60};console.log(JSON.stringify(result,null,2));await writeFile('evidence/vehicle-tuning.json',JSON.stringify(result,null,2));
  if(timeTo60===null||timeTo60<10||timeTo60>14||speedAt8<=40)throw new Error('Curva de aceleração fora do alvo');
}finally{world.free();}
