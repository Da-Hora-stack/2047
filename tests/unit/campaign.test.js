import { describe,it,expect,beforeEach,afterEach } from 'vitest';
import { createCampaign,receiveSeed,transfer,repair,refuel,calibrate,activateCore,mechanics,collect,bagWeight } from '../../src/game/missions/campaign.js';
import { cargoDamage,activationChance } from '../../src/game/cargo/integrity.js';
import { validSave } from '../../src/game/persistence/schema.js';
import { closeRepository,createSave,getSave,updateSave,deleteSave,listSaves } from '../../src/lib/repository.js';
import { readBody,InvalidInput,identity } from '../../src/lib/api.js';
import { randomUUID } from 'node:crypto';
export function sampleSave(){return {schemaVersion:1,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:4,temperature:26,engineOn:true,campaign:createCampaign()};}
const req=body=>new Request('http://localhost/api/saves',{method:'POST',headers:{'Content-Type':'application/json'},body});
describe('campanha e escassez',()=>{
 it('recebe apenas uma Semente e registra contato/decisão',()=>{const c=createCampaign();expect(receiveSeed(c)).toBe(true);expect(receiveSeed(c)).toBe(false);expect(c.flags.renataContact).toBe(true);expect(c.stage).toBe('transport');});
 it('transferir conserva itens e respeita capacidade',()=>{const c=createCampaign(),total=c.inventory.player.parts+c.inventory.truck.parts;expect(transfer(c,'parts','player',5)).toBe(true);expect(c.inventory.player.parts+c.inventory.truck.parts).toBe(total);expect(transfer(c,'parts','player',100)).toBe(false);expect(transfer(c,'diesel','player',-1)).toBe(false);expect(bagWeight(c.inventory.player)).toBeGreaterThan(0);});
 it('reparo/calibração gastam peças, abastecimento gasta diesel',()=>{const c=createCampaign(),s={fuel:4};expect(repair(c,'suspension')).toBe(true);expect(c.components.suspension).toBe(63);expect(repair(c,'radiator')).toBe(false);expect(refuel(c,s)).toBe(false);transfer(c,'diesel','player',4);expect(refuel(c,s)).toBe(true);expect(s.fuel).toBe(8);receiveSeed(c);c.seed.integrity=60;transfer(c,'parts','player',2);expect(calibrate(c)).toBe(true);expect(c.seed.integrity).toBe(80);});
 it('desgaste afeta potência, aderência e superaquecimento',()=>{const c=createCampaign(),s={speed:10,surface:'areia',engineOn:true,fuel:4,temperature:110};c.components.engine=c.components.filters=c.components.tires=c.components.tank=20;const before=s.fuel;const e=mechanics(c,s,{throttle:1},10,true);expect(e.power).toBeLessThan(1);expect(e.grip).toBe(.8);expect(s.temperature).toBeGreaterThan(110);expect(s.fuel).toBeLessThan(before);expect(c.components.filters).toBeLessThan(20);});
 it('suprimentos não reaparecem após coleta',()=>{const c=createCampaign();expect(collect(c,'road-cache')).toBe(true);const n=c.inventory.truck.parts;expect(collect(c,'road-cache')).toBe(false);expect(c.inventory.truck.parts).toBe(n);});
});
describe('carga e ativação',()=>{
 it('movimento normal não danifica; choques têm teto por segundo',()=>{const sample={filtered:[0,0,0]};for(let i=0;i<600;i++)expect(cargoDamage(sample,[.8,1,.7],0,1/60)).toBe(0);let d=0;for(let i=0;i<60;i++)d+=cargoDamage(sample,[100,100,-100],100,1/60);expect(d).toBeGreaterThan(0);expect(d).toBeLessThanOrEqual(9.00001);});
 it('dano filtrado é consistente entre 60 e 120 passos',()=>{const run=n=>{const s={filtered:[0,0,0]};let d=0;for(let i=0;i<n;i++)d+=cargoDamage(s,[9,12,-9],0,1/n);return d;};expect(Math.abs(run(60)-run(120))).toBeLessThan(.06);});
 it('chance é explícita, monotônica e garantida a 80%',()=>{expect(activationChance(80)).toBe(1);expect(activationChance(0)).toBe(0);expect(activationChance(55)).toBeCloseTo(.55);for(let i=1;i<101;i++)expect(activationChance(i)).toBeGreaterThanOrEqual(activationChance(i-1));});
 it('sucesso transforma e persiste flags; falha permite preparar nova tentativa',()=>{const c=createCampaign();receiveSeed(c);expect(activateCore(c).success).toBe(true);expect(c.restoration.ashes).toBe(true);expect(activateCore(c)).toBeNull();const f=createCampaign();receiveSeed(f);f.seed.integrity=0;expect(activateCore(f).success).toBe(false);expect(f.cores['core-1'].state).toBe('failed');expect(f.restoration.ashes).toBe(false);expect(calibrate(f)).toBe(true);});
});
describe('validação e API',()=>{
 it('rejeita save inválido e estados incoerentes',()=>{const s=sampleSave();expect(validSave(s)).toBe(true);s.fuel=-1;expect(validSave(s)).toBe(false);s.fuel=1;s.truck.position[0]=Infinity;expect(validSave(s)).toBe(false);s.truck.position[0]=0;s.campaign.restoration.ashes=true;expect(validSave(s)).toBe(false);});
 it('limita o corpo real mesmo sem Content-Length',async()=>{await expect(readBody(req('{'))).rejects.toBeInstanceOf(InvalidInput);await expect(readBody(req(JSON.stringify({a:'a'.repeat(140000)})))).rejects.toBeInstanceOf(InvalidInput);});
 it('cookie é HttpOnly/SameSite e seguro sob HTTPS',()=>{const a=identity(new Request('https://example.com'));expect(a.cookie).toContain('HttpOnly');expect(a.cookie).toContain('Secure');expect(a.cookie).toContain('SameSite=Strict');expect(identity(new Request('http://localhost',{headers:{cookie:a.cookie.split(';')[0]}})).id).toBe(a.id);});
});
describe('libSQL real: isolamento, revisão e roundtrip',()=>{
 let player;beforeEach(()=>{player=randomUUID();});afterEach(async()=>{await deleteSave(player,'1');closeRepository();});
 it('cria/lista/lê/atualiza e bloqueia revisão antiga/outro jogador',async()=>{const s=sampleSave();const one=await createSave(player,'1',s);expect(one.version).toBe(1);expect(await createSave(player,'1',s)).toBeNull();expect(await getSave('outro','1')).toBeNull();expect((await listSaves(player)).length).toBe(1);receiveSeed(s.campaign);activateCore(s.campaign);const updated=await updateSave(player,'1',1,s);expect(updated.version).toBe(2);expect(await updateSave(player,'1',1,s)).toBeNull();expect((await getSave(player,'1')).data.campaign.restoration.ashes).toBe(true);expect(await deleteSave(player,'1')).toBe(true);expect(await getSave(player,'1')).toBeNull();});
});
