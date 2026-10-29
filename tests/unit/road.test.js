import { describe,it,expect } from 'vitest';
import { createCampaign,receiveSeed,activateCore,bagWeight } from '../../src/game/missions/campaign.js';
import { upgradeCampaign } from '../../src/game/missions/network.js';
import { createRoad,upgradeRoad,startGenerator,claimTechReward,gasBuy,shopBuy,shopService,shopSell,robTruck,resolveAmbush,rewardRam } from '../../src/game/missions/road.js';
import { AMBUSHES,ROAD_POINTS,AMBUSH_RULES } from '../../src/data/road.js';
import { NETWORK_POINTS,ROUTES } from '../../src/data/network.js';
import { POIS } from '../../src/data/expedition.js';
import { inFootZone } from '../../src/game/missions/campaign.js';
import { validSave } from '../../src/game/persistence/schema.js';
import { makeGroup,stepGroup,truckFrame } from '../../src/game/world/banditAI.js';
import { roadX } from '../../src/game/world/terrain.js';

const fresh=()=>upgradeCampaign(createCampaign());
const save=c=>({schemaVersion:3,truck:{position:[0,2,5],rotation:[0,0,0,1]},player:{position:[-3,1,5]},context:'driving',fuel:40,temperature:30,engineOn:false,campaign:c});
const Q={x:0,y:0,z:0,w:1};

describe('Núcleo 1: Tomás e o gerador',()=>{
 it('só liga com a Semente e cobra 4 L de diesel + 1 peça',()=>{
  const c=fresh();expect(startGenerator(c)).toBe(false);receiveSeed(c);const d=c.inventory.player.diesel,p=c.inventory.player.parts;
  expect(startGenerator(c)).toBe(true);expect(c.road.generator).toBe(true);expect(c.inventory.player.diesel).toBe(d-4);expect(c.inventory.player.parts).toBe(p-1);expect(startGenerator(c)).toBe(false);
 });
 it('usa o compartimento do Titã só quando permitido',()=>{
  const c=fresh();receiveSeed(c);c.inventory.truck.diesel=6;c.inventory.player.diesel=1;
  expect(startGenerator(c,{useTruck:false})).toBe(false);expect(startGenerator(c,{useTruck:true})).toBe(true);expect(c.inventory.truck.diesel).toBe(3);expect(c.inventory.player.diesel).toBe(0);
 });
 it('recompensa de Tomás só depois da chuva e uma única vez',()=>{
  const c=fresh();receiveSeed(c);expect(claimTechReward(c)).toBe(false);activateCore(c);const n=upgradeCampaign(c);
  expect(n.road.generator).toBe(true);const scrap=n.inventory.player.scrap;expect(claimTechReward(n)).toBe(true);expect(n.inventory.player.scrap).toBe(scrap+4);expect(claimTechReward(n)).toBe(false);
 });
});

describe('postos e oficinas',()=>{
 it('abastece o tanque pagando 1 material por 5 L e respeita capacidade e estoque',()=>{
  const c=fresh(),st={fuel:100},p=ROAD_POINTS.find(p=>p.kind==='gas');c.inventory.player.scrap=8;
  expect(gasBuy(c,st,p.id,'tank-20')).toBe(true);expect(st.fuel).toBe(120);expect(c.inventory.player.scrap).toBe(4);expect(c.road.stocks[p.id].diesel).toBe(70);
  st.fuel=179.5;expect(gasBuy(c,st,p.id,'tank-full')).toBe(false);
  c.inventory.player.scrap=2;st.fuel=10;expect(gasBuy(c,st,p.id,'tank-full')).toBe(true);expect(st.fuel).toBe(20);expect(c.inventory.player.scrap).toBe(0);
 });
 it('galão e água vão para a mochila sem estourar 40 kg',()=>{
  const c=fresh(),st={fuel:0},p=ROAD_POINTS.find(p=>p.kind==='gas');c.inventory.player.scrap=20;c.inventory.player.parts=0;
  expect(gasBuy(c,st,p.id,'water-2')).toBe(true);expect(gasBuy(c,st,p.id,'can-10')).toBe(true);expect(bagWeight(c.inventory.player)).toBeLessThanOrEqual(40);
  c.inventory.player.diesel=45;expect(gasBuy(c,st,p.id,'can-10')).toBe(false);
 });
 it('oficina vende peças, conserta componentes e compra peças',()=>{
  const c=fresh(),p=ROAD_POINTS.find(p=>p.kind==='workshop');c.inventory.player.scrap=20;c.components.radiator=35;
  expect(shopService(c,p.id,'tune','radiator')).toBe(true);expect(c.components.radiator).toBe(65);expect(c.inventory.player.scrap).toBe(17);
  expect(shopService(c,p.id,'overhaul','radiator')).toBe(true);expect(c.components.radiator).toBe(100);expect(shopService(c,p.id,'tune','radiator')).toBe(false);
  const parts=c.inventory.player.parts;expect(shopBuy(c,p.id,'parts-2')).toBe(true);expect(c.inventory.player.parts).toBe(parts+2);
  expect(shopSell(c,p.id)).toBe(true);expect(c.inventory.player.parts).toBe(parts);
  expect(shopService(c,'posto-boa-viagem','tune','engine')).toBe(false);
 });
});

describe('saqueadores',()=>{
 it('levam uma fração do compartimento e resolvem a emboscada uma única vez',()=>{
  const c=fresh();Object.assign(c.inventory.truck,{diesel:10,parts:4,scrap:0,water:1,food:0});
  const s=robTruck(c,.5);expect(s).toEqual({diesel:5,parts:2,water:1});expect(c.inventory.truck.diesel).toBe(5);
  expect(resolveAmbush(c,'amb-1','robbed')).toBe(true);expect(resolveAmbush(c,'amb-1','escaped')).toBe(false);expect(c.road.robbed).toBe(1);
 });
 it('recompensa de abalroamento cai no compartimento',()=>{const c=fresh();expect(rewardRam(c,2)).toBe('truck');expect(c.inventory.truck.scrap).toBe(2);});
 const run=(a,speed,swerve)=>{const g=makeGroup(a,roadX);let z=a.z+150,t=0,x=0,out=[];while(t<120&&g.phase!=='done'){z-=speed*(1/60);x=roadX(z)+(swerve?swerve(t,g):0);for(const e of stepGroup(g,truckFrame({x,z},Q,{x:0,z:-speed},true),1/60))out.push(e.type);t+=1/60;}return {g,out};};
 it('desistem depois de uma certa distância quando o Titã corre',()=>{for(const a of AMBUSHES){const r=run(a,a.speed+4);expect(r.g.outcome==='gaveup'||r.g.outcome==='outran').toBe(true);expect(r.out).not.toContain('robbed');}});
 it('agarram e saqueiam um Titã lento',()=>{const r=run(AMBUSHES[0],8);expect(r.g.outcome).toBe('robbed');});
 const chase=speed=>{const a=AMBUSHES[0],g=makeGroup(a,roadX);let z=a.z+150,off=0,t=0,out=[];
  while(t<60&&g.phase!=='done'){z-=speed/60;const rx=roadX(z),f0=truckFrame({x:rx+off,z},Q,{x:0,z:-speed},true);let target=null;
   for(const b of g.bandits){if(b.state!=='chase')continue;const lat=(b.x-f0.x)*f0.rx+(b.z-f0.z)*f0.rz,al=(b.x-f0.x)*f0.fx+(b.z-f0.z)*f0.fz;if(Math.abs(al)<5&&Math.abs(lat)<7)target=lat;}
   if(target!==null)off+=Math.sign(target)*5/60;
   for(const e of stepGroup(g,truckFrame({x:rx+off,z},Q,{x:0,z:-speed},true),1/60))out.push(e.type);t+=1/60;}
  return out;};
 it('virar contra o saqueador em velocidade o abalroa',()=>{expect(chase(14)).toContain('ram');});
 it('abaixo da velocidade mínima não há abalroamento',()=>{expect(chase(AMBUSH_RULES.ramMinSpeed-1)).not.toContain('ram');});
});

describe('integração: posições e saves',()=>{
 it('estruturas ficam longe de abrigos e rotas, e dentro da zona de caminhada',()=>{
  const others=[...NETWORK_POINTS,...POIS];
  for(const p of ROAD_POINTS){if(p.kind==='tech')continue;expect(others.every(o=>Math.hypot(o.x-p.x,o.z-p.z)>150)).toBe(true);expect(ROUTES.every(r=>Math.abs(-p.z-r.at)>400)).toBe(true);expect(inFootZone(p.talk)).toBe(true);}
  expect(inFootZone(ROAD_POINTS[0].talk)).toBe(true);
 });
 it('emboscadas não caem sobre rotas bloqueadas e têm dificuldade crescente',()=>{
  for(const a of AMBUSHES)expect(ROUTES.every(r=>Math.abs(-a.z-r.at)>400)).toBe(true);
  for(let i=1;i<AMBUSHES.length;i++){expect(AMBUSHES[i].speed).toBeGreaterThanOrEqual(AMBUSHES[i-1].speed);expect(AMBUSHES[i].giveUp).toBeGreaterThan(AMBUSHES[i-1].giveUp);}
  expect(Math.max(...AMBUSHES.map(a=>a.speed))).toBeLessThan(25);expect(AMBUSH_RULES.ramMinSpeed).toBeLessThan(AMBUSHES[0].speed);
 });
 it('saves antigos (sem road) carregam e são completados; saves novos validam',()=>{
  const c=fresh();delete c.road;expect(validSave(save(c))).toBe(true);const up=upgradeCampaign(c);expect(up.road.generator).toBe(false);expect(validSave(save(up))).toBe(true);
  const bad=upgradeCampaign(createCampaign());bad.road.ambushes['amb-1']='x';expect(validSave(save(bad))).toBe(false);
  const bad2=upgradeCampaign(createCampaign());bad2.road.stocks['posto-boa-viagem'].diesel=-1;expect(validSave(save(bad2))).toBe(false);
  expect(Object.keys(createRoad().ambushes)).toHaveLength(AMBUSHES.length);
 });
});
