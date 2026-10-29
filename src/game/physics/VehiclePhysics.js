import RAPIER from '@dimforge/rapier3d-compat';
import { TRUCK_TUNING as T } from '../../data/truck-tuning.js';
import { CONFIG } from '../../data/config.js';
import { terrainFriction } from '../survival/resources.js';
import { heightAt,surfaceAt,roadX } from '../world/terrain.js';
import { Powertrain,roadResistance,steeringLimit } from '../vehicle/Powertrain.js';
import { clamp,approach } from '../vehicle/Engine.js';

export class VehiclePhysics {
 constructor(world,wheelPoints,options={}){
  this.world=world;this.steer=0;this.payloadMass=-1;this.surfaceResolver=options.surfaceAt||surfaceAt;this.powertrain=new Powertrain();this.previousSpeed=0;this.filteredAcceleration=0;
  this.body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,2.1,5).setLinearDamping(0).setAngularDamping(.85).setCcdEnabled(true));
  world.createCollider(RAPIER.ColliderDesc.cuboid(1.12,.45,3.9).setMass(T.chassisMass).setFriction(.65).setRestitution(.02),this.body);
  world.createCollider(RAPIER.ColliderDesc.cuboid(1.18,1.1,1.08).setTranslation(0,1.15,-2.65).setDensity(0),this.body);
  this.controller=world.createVehicleController(this.body);this.controller.indexUpAxis=1;this.controller.setIndexForwardAxis=2;
  wheelPoints.forEach(p=>{const i=this.controller.numWheels();this.controller.addWheel(p,{x:0,y:-1,z:0},{x:-1,y:0,z:0},T.suspension.restLength,T.wheelRadius);this.controller.setWheelMaxSuspensionTravel(i,T.suspension.travel);this.controller.setWheelMaxSuspensionForce(i,T.suspension.maxForce);this.controller.setWheelFrictionSlip(i,2.3);this.controller.setWheelSideFrictionStiffness(i,.9);});
 }
 forward(){const q=this.body.rotation();return {x:-2*(q.x*q.z+q.w*q.y),y:-2*(q.y*q.z-q.w*q.x),z:-(1-2*(q.x*q.x+q.y*q.y))};}
 signedSpeed(){const v=this.body.linvel(),f=this.forward();return v.x*f.x+v.y*f.y+v.z*f.z;}
 setPayload(state){
  const mass=(state.loaded?T.seedMass:0)+Math.max(0,state.inventoryMass||0)+Math.max(0,state.fuel||0)*T.engine.dieselKgPerLiter;
  if(Math.abs(mass-this.payloadMass)>.2){this.body.setAdditionalMassProperties(mass,{x:0,y:.55,z:1.35},{x:mass*1.2,y:mass*1.1,z:mass*.35},{x:0,y:0,z:0,w:1},true);this.body.recomputeMassPropertiesFromColliders();this.payloadMass=mass;}
  state.massKg=this.body.mass();state.cargoMassKg=this.payloadMass;
 }
 update(input,state,dt){
  if(!(dt>0)||!Number.isFinite(dt))return;
  this.setPayload(state);const speed=this.signedSpeed(),p=this.body.translation();state.speed=Math.abs(speed);state.signedSpeed=speed;state.surface=this.surfaceResolver(p.x,p.z);if(state.localRestored&&state.surface==='agua')state.surface='asfalto';
  if(input.throttle||input.steer||input.handbrake)this.body.wakeUp();
  const grip=terrainFriction(state.surface,speed)*(state.gripMultiplier??1),drive=this.powertrain.update(input,state,dt),mass=this.body.mass();
  const maxSteer=steeringLimit(speed),target=clamp(input.steer||0,-1,1)*maxSteer,steerRate=(target?T.steering.rate:T.steering.returnRate)*(state.steeringSensitivity||1);
  this.steer+=clamp(target-this.steer,-steerRate*dt,steerRate*dt);this.steer=clamp(this.steer,-maxSteer,maxSteer);
  const force=clamp(drive.force,-mass*9.81*T.dynamics.drivenWeight*grip,mass*9.81*T.dynamics.drivenWeight*grip);
  const condition=clamp(state.suspensionCondition??100,0,100)/100,massScale=T.chassisMass/mass;
  for(let i=0;i<6;i++){
   const angle=i<2&&Math.abs(this.steer)>.001?Math.atan(T.wheelbase/(T.wheelbase/Math.tan(this.steer)+(i%2===0?-T.track/2:T.track/2))):0;
   this.controller.setWheelSteering(i,angle);this.controller.setWheelEngineForce(i,i>=2?-force/4:0);
   const parking=input.handbrake?(i>=2?T.dynamics.parkingBrakeForce/4:Math.abs(speed)<3.2?T.dynamics.parkingFrontAssist/2:0):0;
   this.controller.setWheelBrake(i,(parking+drive.serviceBrakeForce/6+(i>=2?drive.engineBrake/4:0))*dt);
   this.controller.setWheelFrictionSlip(i,2.3*grip);
   this.controller.setWheelSuspensionStiffness(i,T.suspension.stiffness*massScale*(.75+.25*condition));
   this.controller.setWheelSuspensionCompression(i,T.suspension.compression*massScale*(.65+.35*condition));
   this.controller.setWheelSuspensionRelaxation(i,T.suspension.relaxation*massScale*(.65+.35*condition));
  }
  const grounded=Array.from({length:6},(_,i)=>this.controller.wheelIsInContact(i)).some(Boolean),f=this.forward();
  const resistance=roadResistance(mass,speed,state.surface,grounded),impulse=Math.min(resistance*dt,Math.abs(speed)*mass)*Math.sign(speed);
  this.body.applyImpulse({x:-f.x*impulse,y:-f.y*impulse,z:-f.z*impulse},false);
  if(state.front&&Math.abs(speed)>1)this.body.applyImpulse({x:Math.sin((state.weatherClock||0)*.3)*mass*dt*.25,y:0,z:0},true);
  this.controller.updateVehicle(dt,RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC);
  this.filteredAcceleration=approach(this.filteredAcceleration,(speed-this.previousSpeed)/dt,.2,dt);this.previousSpeed=speed;
  const v=this.body.linvel(),q=this.body.rotation(),right={x:1-2*(q.y*q.y+q.z*q.z),y:2*(q.x*q.y+q.w*q.z),z:2*(q.x*q.z-q.w*q.y)};
  Object.assign(state,{tractionForceN:force,resistanceForceN:resistance,steeringAngle:this.steer,longitudinalAcceleration:this.filteredAcceleration,lateralAcceleration:speed*speed*Math.tan(this.steer)/T.wheelbase,lateralSpeed:v.x*right.x+v.y*right.y+v.z*right.z});
 }
 resetDrivetrain(running=false,state){this.powertrain.reset(running);this.steer=0;this.previousSpeed=0;this.filteredAcceleration=0;if(state)Object.assign(state,{rpm:this.powertrain.engine.rpm,gear:0,gearLabel:'N',shiftCount:0,shifting:false,throttle:0,brake:0,torqueNm:0,enginePowerKw:0,engineBraking:false,parkingBrake:false});}
 teleport(x,z,y=heightAt(x,z)+1.7){this.body.setTranslation({x,y,z},true);this.body.setRotation({x:0,y:0,z:0,w:1},true);this.body.setLinvel({x:0,y:0,z:0},true);this.body.setAngvel({x:0,y:0,z:0},true);this.resetDrivetrain();}
 recover(){const z=Math.max(-CONFIG.world.roadLength+20,Math.min(20,this.body.translation().z));this.teleport(roadX(z),z);}
}
