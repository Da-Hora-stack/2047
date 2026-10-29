import { describe,it,expect } from 'vitest';
import { updateResources } from '../../src/game/survival/resources.js';
import { validSave } from '../../src/game/persistence/schema.js';
import { createCampaign,mechanics } from '../../src/game/missions/campaign.js';
import { createExpedition,migrateCampaign,expeditionStep,consume,rest,buy,sellParts,loot,saltHeat } from '../../src/game/survival/expedition.js';
const campaign=()=>migrateCampaign(createCampaign());
describe('Fase 3 — sobrevivência sem espiral',()=>{
 it('não reduz medidores parado ou em menu',()=>{const e=createExpedition(),before=structuredClone(e);expeditionStep(e,{traveling:false,hot:true},10000);expect(e).toEqual(before);});
 it('consome lentamente durante a viagem, mais água sob calor',()=>{const a=createExpedition(),b=createExpedition();expeditionStep(a,{traveling:true,hot:false},600);expeditionStep(b,{traveling:true,hot:true},600);expect(a.hydration).toBeCloseTo(89.2);expect(a.satiety).toBeCloseTo(94.6);expect(b.hydration).toBeLessThan(a.hydration);});
 it('zerar reserva traz penalidade gradual limitada e reversível',()=>{const c=campaign(),e=c.expedition;e.hydration=0;const initial=expeditionStep(e,{traveling:true},1),later=expeditionStep(e,{traveling:true},10000);expect(initial).toBeGreaterThan(.99);expect(later).toBeGreaterThanOrEqual(.6);expect(consume(c,'water')).toBe(true);expect(e.hydration).toBe(30);expect(e.deprivationSeconds).toBe(0);});
 it('consumo e descanso gastam itens reais',()=>{const c=campaign();c.expedition.hydration=50;c.expedition.satiety=40;c.expedition.fatigue=70;expect(consume(c,'water')).toBe(true);expect(c.inventory.player.water).toBe(3);expect(rest(c)).toBe(true);expect(c.expedition.fatigue).toBe(0);expect(c.inventory.player.food).toBe(2);});
});
describe('Fase 3 — escambo e exploração',()=>{
 it('compra debita material/estoque e preserva limites',()=>{const c=campaign(),before=c.inventory.player.scrap;expect(buy(c,'water')).toBe(true);expect(c.inventory.player.scrap).toBe(before-1);expect(c.expedition.stock.water).toBe(8);c.expedition.stock.water=0;expect(buy(c,'water')).toBe(false);expect(buy(c,'invalid')).toBe(false);});
 it('venda exige peças e não cria ciclo de lucro',()=>{const c=campaign();const scrap=c.inventory.player.scrap;expect(sellParts(c)).toBe(true);expect(c.inventory.player.scrap).toBe(scrap+2);c.inventory.player.parts=0;expect(sellParts(c)).toBe(false);});
 it('loot persiste, tem capacidade e não se duplica',()=>{const c=campaign();expect(loot(c,'depot')).toBe(true);const before=c.inventory.player.parts;expect(loot(c,'depot')).toBe(false);expect(c.inventory.player.parts).toBe(before);const full=campaign();full.inventory.player.parts=40;expect(loot(full,'station')).toBe(false);expect(full.expedition.looted).toEqual([]);});
 it('migra a campanha antiga sem apagar flags nem mutar entrada',()=>{const c=createCampaign();c.flags.chosenRoute='short';const m=migrateCampaign(c);expect(m.flags.chosenRoute).toBe('short');expect(m.expedition.hydration).toBe(100);expect(c.expedition).toBeUndefined();m.expedition.stock.water=2;expect(migrateCampaign(m).expedition.stock.water).toBe(2);});
 it('Leito Seco aquece sob motor/carga e não aquece desligado',()=>{const c=campaign(),s={engineOn:true,temperature:90,speed:20};saltHeat(s,c.components,60);expect(s.temperature).toBeGreaterThan(110);s.engineOn=false;const t=s.temperature;saltHeat(s,c.components,100);expect(s.temperature).toBe(t);});
});

describe('Fase 3 — integração e validação',()=>{
 it('calor compete com o resfriamento real; radiador reparado protege motor',()=>{const run=r=>{const c=campaign();c.components.radiator=r;const s={fuel:120,temperature:90,speed:20,surface:'sal',engineOn:true};let effect;for(let i=0;i<3600;i++){effect=mechanics(c,s,{throttle:1},1/60,false);saltHeat(s,c.components,1/60);updateResources(s,{throttle:1},1/60);}return {s,c,effect};};const worn=run(35),fixed=run(100);expect(worn.s.temperature).toBeGreaterThan(110);expect(worn.s.temperature).toBeGreaterThan(fixed.s.temperature+10);expect(worn.effect.power).toBeLessThan(1);expect(worn.c.components.engine).toBeLessThan(70);});
 it('schema 2 rejeita hidratação inválida e mochila acima da capacidade',()=>{const s={schemaVersion:2,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:4,temperature:30,engineOn:true,campaign:campaign()};expect(validSave(s)).toBe(true);s.campaign.expedition.hydration=-1;expect(validSave(s)).toBe(false);s.campaign.expedition.hydration=100;s.campaign.inventory.player.parts=50;expect(validSave(s)).toBe(false);});
});
