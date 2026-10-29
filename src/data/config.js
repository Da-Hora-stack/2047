import { TRUCK_TUNING as TRUCK } from './truck-tuning.js';
export const CONFIG = Object.freeze({
  phase: 4, seed: 2047, fixedStep: 1 / 60, maxSubSteps: 30,
  world: { sectorSize: 1024, terrainSegments: 48, roadLength: 21000, roadWidth: 10 },
  overhaulPhase:2,overhaulStatus:'in_progress',
  vehicle: { mass:TRUCK.chassisMass,maxSpeed:TRUCK.dynamics.maxSpeed,reverseSpeed:TRUCK.dynamics.maxReverseSpeed,wheelRadius:TRUCK.wheelRadius,suspensionLength:TRUCK.suspension.restLength,idleLitersPerSecond:TRUCK.engine.idleLitersPerSecond,drivingLitersPerSecond:.018,initialFuel:140,fuelCapacity:180 },
  presets: {
    baixo: { label: 'Baixo', pixelRatio: .75, shadows: false, shadowSize: 512, distance: 360, particles: 120 },
    medio: { label: 'Médio', pixelRatio: 1, shadows: true, shadowSize: 1024, distance: 650, particles: 300 },
    alto: { label: 'Alto', pixelRatio: 1.5, shadows: true, shadowSize: 2048, distance: 950, particles: 500 },
  },
});