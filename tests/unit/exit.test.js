import { beforeAll,describe,it,expect } from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import { canExit,canWalkAt,canTakeFootStep } from '../../src/game/player/exitPolicy.js';
import { Player } from '../../src/game/player/Player.js';
import { VehiclePhysics } from '../../src/game/physics/VehiclePhysics.js';
beforeAll(async()=>{await RAPIER.init();});
describe('saída do Titã',()=>{
 it('aceita parado e bloqueia movimento e valores inválidos',()=>{expect(canExit(0)).toBe(true);expect(canExit(.5)).toBe(true);expect(canExit(1)).toBe(false);expect(canExit(-1)).toBe(false);expect(canExit(NaN)).toBe(false);});
 it('permite circular perto do caminhão em um trecho sem abrigo',()=>{const truck={x:0,z:-700};expect(canWalkAt({x:-3,z:-700},truck)).toBe(true);expect(canWalkAt({x:23,z:-700},truck)).toBe(true);expect(canWalkAt({x:26,z:-700},truck)).toBe(false);});
 it('um save fora do limite pode voltar, sem se afastar mais',()=>{const truck={x:0,z:-700},from={x:30,z:-700};expect(canTakeFootStep(from,{x:29.9,z:-700},truck)).toBe(true);expect(canTakeFootStep(from,{x:30.1,z:-700},truck)).toBe(false);});
 it('procura o outro lado quando uma parede bloqueia a porta',()=>{const w=new RAPIER.World({x:0,y:-9.81,z:0});w.createCollider(RAPIER.ColliderDesc.cuboid(100,.5,100).setTranslation(0,-.5,0));const points=[];for(const z of [-2.5,1.45,2.9])for(const x of [-1.2,1.2])points.push({x,y:-.1,z});const truck=new VehiclePhysics(w,points),player=new Player(w);w.createCollider(RAPIER.ColliderDesc.cuboid(.5,3,6).setTranslation(-2.8,3,5));w.step();const exit=player.findExit(truck);expect(exit).not.toBeNull();expect(exit.x).toBeGreaterThan(0);expect(Number.isFinite(exit.y)).toBe(true);player.dispose();w.free();});
});
