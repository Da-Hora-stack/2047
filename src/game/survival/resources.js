import { CONFIG } from '../../data/config.js';
import { TRUCK_TUNING } from '../../data/truck-tuning.js';
export const FRICTION = Object.freeze(Object.fromEntries(Object.entries(TRUCK_TUNING.surfaces).map(([id,s])=>[id,s.grip])));
export function terrainFriction(type, speed = 0) {
  const base = FRICTION[type] ?? FRICTION.terra;
  return base * (1 - Math.min(Math.abs(speed) / 100, .12));
}
export function fuelConsumed({ engineOn, throttle = 0, speed = 0,fuelRateLps }, dt) {
  if (!engineOn || dt <= 0) return 0;
  return (Number.isFinite(fuelRateLps)?Math.max(0,fuelRateLps):CONFIG.vehicle.idleLitersPerSecond + CONFIG.vehicle.drivingLitersPerSecond * Math.max(0, Math.min(1, Math.abs(throttle))) * (.4 + Math.min(Math.abs(speed) / 25, 1))) * dt;
}
export function updateResources(state, input, dt) {
  state.fuel = Math.max(0, state.fuel - fuelConsumed({ ...state, throttle: input.throttle }, dt));
  if (state.fuel === 0) state.engineOn = false;
  const load=Number.isFinite(state.enginePowerKw)?Math.min(1,state.enginePowerKw/250):Math.abs(input.throttle);
  const target = state.engineOn ? 72 + load * 19 : 23;
  state.temperature += (target - state.temperature) * dt * .015;
}
