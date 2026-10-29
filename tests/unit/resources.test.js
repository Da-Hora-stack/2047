import { describe, it, expect } from 'vitest';
import { fuelConsumed, terrainFriction, updateResources } from '../../src/game/survival/resources.js';
import { FixedLoop } from '../../src/game/core/FixedLoop.js';
describe('diesel', () => {
  it('não consome com motor desligado', () => expect(fuelConsumed({ engineOn: false, throttle: 1, speed: 20 }, 8)).toBe(0));
  it('consome mais sob carga e integra independentemente do FPS', () => {
    const run = { engineOn: true, throttle: 1, speed: 18 };
    expect(fuelConsumed(run, 8)).toBeGreaterThan(fuelConsumed({ engineOn: true }, 8));
    expect(Array.from({length:480}, () => fuelConsumed(run, 1/60)).reduce((a,b)=>a+b,0)).toBeCloseTo(fuelConsumed(run,8),8);
  });
  it('não deixa combustível negativo e desliga sem diesel', () => { const s={fuel:.0001,engineOn:true,speed:20,temperature:70}; updateResources(s,{throttle:1},60); expect(s.fuel).toBe(0); expect(s.engineOn).toBe(false); });
});
describe('aderência por terreno', () => {
  it('mantém asfalto > terra > areia', () => { for(const v of [0,10,25]) { expect(terrainFriction('asfalto',v)).toBeGreaterThan(terrainFriction('terra',v)); expect(terrainFriction('terra',v)).toBeGreaterThan(terrainFriction('areia',v)); } });
  it('é contínua, limitada e simétrica em ré', () => { expect(terrainFriction('areia',-20)).toBe(terrainFriction('areia',20)); expect(terrainFriction('asfalto',1e5)).toBeCloseTo(.88); expect(terrainFriction('terra',10.001)).toBeCloseTo(terrainFriction('terra',10),4); });
});
describe('passo fixo', () => {
  it('executa 60 passos em um segundo a 30 FPS', () => { const l=new FixedLoop(); let n=0; for(let i=0;i<30;i++) l.advance(1/30,()=>n++); expect(n).toBe(60); });
  it('limita recuperação após aba suspensa', () => { const l=new FixedLoop(); let n=0; l.advance(20,()=>n++); expect(n).toBe(6); });
});
