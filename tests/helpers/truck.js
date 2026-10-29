import RAPIER from '@dimforge/rapier3d-compat';
import { VehiclePhysics } from '../../src/game/physics/VehiclePhysics.js';
export function truckFixture({grade=0,loaded=false,surface='asfalto',hz=60,noGround=false}={}){
 const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=1/hz;
 if(!noGround)world.createCollider(RAPIER.ColliderDesc.cuboid(500,.5,4000).setTranslation(0,-.5,0).setRotation({x:Math.sin(grade/2),y:0,z:0,w:Math.cos(grade/2)}));
 const points=[];for(const z of [-2.5,1.45,2.9])for(const x of [-1.2,1.2])points.push({x,y:-.1,z});
 const vehicle=new VehiclePhysics(world,points,{surfaceAt:()=>surface}),state={engineOn:true,loaded,fuel:100,temperature:70,speed:0};
 const step=(input={throttle:0,steer:0,handbrake:true})=>{vehicle.update(input,state,1/hz);world.step();};
 const settle=()=>{for(let i=0;i<hz*3;i++)step();vehicle.resetDrivetrain(true);};
 if(!noGround)settle();return {world,vehicle,state,step,settle,hz};
}
