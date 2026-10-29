import { describe,it,expect } from 'vitest';
import { heightAt,roadX,randomSeed,surfaceAt } from '../../src/game/world/terrain.js';
import { normalizeSettings } from '../../src/game/persistence/settings.js';
describe('mundo determinístico',()=>{
  it('repete a seed e diferencia outras seeds',()=>{const a=randomSeed(2047),b=randomSeed(2047),c=randomSeed(2027);expect(a()).toBe(b());expect(a()).toBe(b());expect(a()).not.toBe(c());});
  it('tem asfalto, acostamento e areia por distância da via',()=>{expect(surfaceAt(roadX(-300),-300)).toBe('asfalto');expect(surfaceAt(roadX(-300)+11,-300)).toBe('terra');expect(surfaceAt(roadX(-300)+40,-300)).toBe('areia');expect(surfaceAt(0,-4000)).not.toBe('asfalto');});
  it('mantém continuidade nos limites de setores e terreno finito',()=>{for(const z of [-512,-1536,-2560]){expect(Math.abs(heightAt(50,z+.001)-heightAt(50,z-.001))).toBeLessThan(.001);}expect(Number.isFinite(heightAt(10000,-10000))).toBe(true);});
});
describe('ajustes persistidos',()=>{it('normaliza valores inválidos e limita volume',()=>{expect(normalizeSettings({quality:'ultra',scale:100,volume:5,subtitles:'não'})).toEqual({quality:'medio',scale:1,volume:1,subtitles:true,steeringSensitivity:1,cameraDistance:14,cabMotion:true});expect(normalizeSettings(null).quality).toBe('medio');});});
