import { inFootZone,near } from '../missions/campaign.js';
export const EXIT_SPEED_LIMIT=.6; // m/s: não deixa saltar de um caminhão em movimento.
export const TRUCK_WALK_RADIUS=24;
export function canExit(speed){return Number.isFinite(speed)&&Math.abs(speed)<=EXIT_SPEED_LIMIT;}
export function canWalkAt(position,truck){return inFootZone(position)||near(position,truck,TRUCK_WALK_RADIUS);}
export function canTakeFootStep(from,to,truck){
 if(canWalkAt(to,truck))return true;
 // Saves antigos podiam deixar Dante fora do limite; permita voltar ao Titã.
 return !canWalkAt(from,truck)&&Math.hypot(to.x-truck.x,to.z-truck.z)<Math.hypot(from.x-truck.x,from.z-truck.z);
}
