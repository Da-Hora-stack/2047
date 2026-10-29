import { COMPONENTS,ITEMS,POINTS } from '../../data/campaign.js';
import { NETWORK_POINTS } from '../../data/network.js';
import { ROAD_POINTS } from '../../data/road.js';
import { POIS } from '../../data/expedition.js';
import { activationChance } from '../cargo/integrity.js';
export const clone=value=>JSON.parse(JSON.stringify(value));
export function createCampaign(rngState=2047){return {
  stage:'shelter',seed:{received:false,integrity:100},components:{engine:70,radiator:35,tires:64,suspension:38,transmission:65,tank:55,filters:55,frame:70},
  inventory:{player:{diesel:8,water:4,food:3,parts:10,scrap:8},truck:{diesel:0,water:0,food:0,parts:2,scrap:0}},
  flags:{metSurvivor:false,renataContact:false,plannedRoute:null,chosenRoute:null,stormEncountered:false,voiceFragments:[],finalChoice:null,titanForced:false},
  cores:{'core-1':{state:'inactive',attempts:0}},restoration:{ashes:false},completedMissions:[],decisions:[],collected:[],rngState:rngState>>>0,travelSeconds:0,checkpoint:0,
};}
export function bagWeight(bag){return Object.entries(bag).reduce((sum,[id,n])=>sum+(ITEMS[id]?.weight||0)*n,0);}
export function transfer(c,id,from,quantity=1){if(!ITEMS[id]||!['player','truck'].includes(from)||!Number.isInteger(quantity)||quantity<1)return false;const to=from==='player'?'truck':'player';if(c.inventory[from][id]<quantity||bagWeight(c.inventory[to])+ITEMS[id].weight*quantity>(to==='player'?40:240))return false;c.inventory[from][id]-=quantity;c.inventory[to][id]+=quantity;return true;}
function spend(c,cost){if(Object.entries(cost).some(([k,v])=>c.inventory.truck[k]<v))return false;for(const [k,v] of Object.entries(cost))c.inventory.truck[k]-=v;return true;}
export function repair(c,id,full=false){if(!COMPONENTS[id]||c.components[id]>=100||!spend(c,full?{parts:3,scrap:2}:{parts:2}))return false;c.components[id]=full?100:Math.min(100,c.components[id]+25);return true;}
export function refuel(c,state){const n=Math.min(4,c.inventory.truck.diesel,180-state.fuel);if(n<=0)return false;c.inventory.truck.diesel-=n;state.fuel+=n;return true;}
export function coolant(c){if(c.components.radiator>=100||!spend(c,{water:1}))return false;c.components.radiator=Math.min(100,c.components.radiator+12);return true;}
export function receiveSeed(c){if(c.seed.received)return false;c.seed.received=true;c.stage='transport';c.flags.metSurvivor=c.flags.renataContact=true;c.decisions.push('accepted-first-seed');return true;}
export function calibrate(c){if(!c.seed.received||c.stage==='activated'||c.seed.integrity>=100||!spend(c,{parts:2}))return false;c.seed.integrity=Math.min(100,c.seed.integrity+20);return true;}
export function activateCore(c){if(!c.seed.received||c.stage==='activated')return null;const chance=activationChance(c.seed.integrity);c.rngState=(Math.imul(c.rngState,1664525)+1013904223)>>>0;const roll=c.rngState/4294967296;const success=roll<chance;const core=c.cores['core-1'];core.attempts++;core.state=success?'active':'failed';c.stage=success?'activated':'failed';c.restoration.ashes=success;if(success){c.completedMissions=['aurora-1'];c.decisions.push('core-1-activated');}else c.seed.integrity=Math.max(0,c.seed.integrity-8);return {success,chance,roll};}
export function collect(c,id){if(c.collected.includes(id)||id!=='road-cache')return false;for(const [k,v] of Object.entries({diesel:6,parts:4,water:2}))c.inventory.truck[k]+=v;c.collected.push(id);return true;}
export function near(a,b,d=5){return Math.hypot(a.x-b.x,a.z-b.z)<=d;}
export function inFootZone(p){return near(p,POINTS.shelter,48)||near(p,POINTS.core,65)||POIS.some(poi=>near(p,poi,45))||NETWORK_POINTS.some(poi=>near(p,poi,45))||ROAD_POINTS.some(poi=>near(p,poi.talk||poi,45));}
export function mechanics(c,state,input,dt,storm){
  const m=c.components;
  const moving=state.speed>1;
  if(moving){c.travelSeconds+=dt;m.tires=Math.max(0,m.tires-dt*(state.surface==='asfalto'?.0007:.004));m.transmission=Math.max(0,m.transmission-dt*Math.abs(input.throttle)*.001);m.filters=Math.max(0,m.filters-dt*(storm?.12:.001));}
  if(state.engineOn){const target=72+(Number.isFinite(state.enginePowerKw)?Math.min(1,state.enginePowerKw/250):Math.abs(input.throttle))*22+(m.radiator<40?35:0);state.temperature+=(target-state.temperature)*dt*.024;state.fuel=Math.max(0,state.fuel-dt*(m.tank<40?.012:0));if(state.temperature>108)m.engine=Math.max(0,m.engine-dt*.035);}
  return {power:(m.engine<40?.45+m.engine/80:1)*(m.filters<40?.6+m.filters/100:1)*(m.transmission<40?.65:1)*(state.temperature>110?.65:1),grip:m.tires<40?.8:1};
}
export function impactDamage(c,speed){const loss=Math.min(18,Math.max(0,speed-3)*1.2);if(!loss)return;for(const id of ['frame','suspension','radiator','engine','tank'])c.components[id]=Math.max(0,c.components[id]-loss);}
