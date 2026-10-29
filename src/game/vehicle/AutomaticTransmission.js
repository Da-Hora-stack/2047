import { TRUCK_TUNING as T,DRIVING_COPY as C } from '../../data/truck-tuning.js';
import { clamp } from './Engine.js';
export class AutomaticTransmission {
 constructor(){this.reset();}
 reset(){this.gear=0;this.shiftRemaining=0;this.dwell=0;this.directionWait=0;this.launchTime=0;this.shiftCount=0;}
 get ratio(){return this.gear<0?-T.transmission.reverseRatio:this.gear===0?0:T.transmission.ratios[this.gear-1];}
 get label(){return this.gear<0?C.reverse:this.gear===0?C.neutral:`${C.drive}${this.gear}`;}
 shift(gear){if(gear===this.gear)return;const from=this.gear;this.gear=gear;this.shiftRemaining=from>0&&gear>0?T.transmission.shiftSeconds:0;this.dwell=0;this.launchTime=0;if(from>0&&gear>0)this.shiftCount++;}
 update(input,speed,running,dt){
  const command=clamp(Number(input.throttle)||0,-1,1),desired=command<-.01?-1:command>.01?1:0;
  this.shiftRemaining=Math.max(0,this.shiftRemaining-dt);this.dwell+=dt;
  const opposing=desired&&speed*desired < -T.transmission.safeDirectionSpeed;
  const changing=desired&&this.gear!==0&&Math.sign(this.gear)!==desired;
  let brake=opposing?Math.abs(command):0;
  if(desired<0&&this.gear>=0){
   brake=Math.abs(command);if(Math.abs(speed)<=T.transmission.safeDirectionSpeed&&running&&!input.handbrake){this.directionWait+=dt;if(this.directionWait>=T.transmission.reverseDelay){this.shift(-1);brake=0;this.directionWait=0;}}else this.directionWait=0;
  }else if(desired>0&&this.gear<=0){
   if(opposing){brake=command;this.directionWait=0;}else if(running&&(this.gear===0||Math.abs(speed)<=T.transmission.safeDirectionSpeed)){
    let selected=1;const wheelRpm=Math.abs(speed)*60/(Math.PI*2*T.wheelRadius);
    while(selected<T.transmission.ratios.length&&wheelRpm*T.transmission.ratios[selected-1]*T.transmission.finalDrive>T.transmission.upshiftRpm)selected++;
    this.shift(selected);this.directionWait=0;
   }
  }else this.directionWait=0;
  if(!running&&Math.abs(speed)<.25)this.shift(0);
  const throttle=running&&!opposing&&!brake&&(!changing||Math.sign(this.gear)===desired)?Math.abs(command):0;
  const wheelRpm=Math.abs(speed)*60/(Math.PI*2*T.wheelRadius);
  const syncedRpm=wheelRpm*Math.abs(this.ratio)*T.transmission.finalDrive;
  if(running&&this.gear>0&&!brake&&!input.handbrake&&!this.shiftRemaining&&this.dwell>T.transmission.dwellSeconds){
   if(syncedRpm>T.transmission.upshiftRpm-(1-throttle)*250&&this.gear<T.transmission.ratios.length)this.shift(this.gear+1);
   else if(syncedRpm<T.transmission.downshiftRpm&&this.gear>1)this.shift(this.gear-1);
  }
  if(throttle>.02&&!brake&&!input.handbrake)this.launchTime+=dt;else this.launchTime=0;
  return {throttle,brake:Math.max(brake,clamp(Number(input.brake)||0,0,1)),coupledRpm:wheelRpm*Math.abs(this.ratio)*T.transmission.finalDrive,clutch:this.shiftRemaining?0:clamp(.25+this.launchTime*.85,.25,1)};
 }
}
