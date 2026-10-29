import { COMPONENTS,ITEMS } from '../../data/campaign.js';
import { CONFIG } from '../../data/config.js';
import { AMBUSHES,GAS_OFFERS,GENERATOR,LITERS_PER_SCRAP,ROAD_POINTS,WORKSHOP_OFFERS,WORKSHOP_SELL,WORKSHOP_SERVICES } from '../../data/road.js';
import { bagWeight } from './campaign.js';

// Regras puras da estrada viva: sem Three.js, sem Rapier. Tudo aqui é testável em Node.
const LIMIT={player:40,truck:240};
const OUTCOMES=['pending','cleared','robbed','escaped'];

export function createRoad(){return {
  generator:false,techReward:false,robbed:0,rammed:0,visited:[],
  ambushes:Object.fromEntries(AMBUSHES.map(a=>[a.id,'pending'])),
  stocks:Object.fromEntries(ROAD_POINTS.filter(p=>p.stock).map(p=>[p.id,{...p.stock}])),
};}

// Completa saves antigos sem apagar o que o jogador já tem. Quem já ancorou o Núcleo 1 recebe o gerador ligado.
export function upgradeRoad(c){
  const base=createRoad(),old=c.road&&typeof c.road==='object'?c.road:{};
  const road={...base,...old,
    ambushes:{...base.ambushes,...(old.ambushes||{})},
    stocks:Object.fromEntries(Object.entries(base.stocks).map(([id,s])=>[id,{...s,...(old.stocks?.[id]||{})}])),
    visited:Array.isArray(old.visited)?old.visited.filter(id=>ROAD_POINTS.some(p=>p.id===id)):[],
  };
  if(c.cores?.['core-1']?.state==='active')road.generator=true;
  c.road=road;return road;
}

export const roadPoint=id=>ROAD_POINTS.find(p=>p.id===id)||null;
export function markVisited(c,id){if(roadPoint(id)&&!c.road.visited.includes(id))c.road.visited.push(id);}

// Cobra de um ou dos dois compartimentos. A mochila vem primeiro; o Titã só entra quando `useTruck` for verdadeiro.
function plan(c,cost,useTruck){
  const out={player:{},truck:{}};
  for(const [id,n] of Object.entries(cost)){
    const fromBag=Math.min(n,c.inventory.player[id]),rest=n-fromBag;
    if(rest>0&&(!useTruck||rest>c.inventory.truck[id]))return null;
    if(fromBag)out.player[id]=fromBag;if(rest)out.truck[id]=rest;
  }
  return out;
}
export function payMixed(c,cost,useTruck=false){
  const p=plan(c,cost,useTruck);if(!p)return false;
  for(const bag of ['player','truck'])for(const [id,n] of Object.entries(p[bag]))c.inventory[bag][id]-=n;
  return true;
}
function addTo(c,bag,items){
  const next={...c.inventory[bag]};for(const [id,n] of Object.entries(items))next[id]+=n;
  if(bagWeight(next)>LIMIT[bag])return false;Object.assign(c.inventory[bag],next);return true;
}
function trade(c,cost,items){ // sempre na mochila: o dinheiro viaja com o Dante
  const next={...c.inventory.player};for(const [id,n] of Object.entries(cost)){if(next[id]<n)return false;next[id]-=n;}
  for(const [id,n] of Object.entries(items))next[id]+=n;
  if(bagWeight(next)>LIMIT.player)return false;Object.assign(c.inventory.player,next);return true;
}

// ---- Núcleo 1: Tomás e o gerador ---------------------------------------------------------------
export function generatorState(c){
  if(c.road.generator)return 'on';
  return c.seed.received?'ready':'waiting-seed';
}
export function startGenerator(c,{useTruck=false}={}){
  if(c.road.generator||!c.seed.received)return false;
  if(!payMixed(c,GENERATOR.cost,useTruck))return false;
  c.road.generator=true;if(!c.decisions.includes('core1-generator-on'))c.decisions.push('core1-generator-on');return true;
}
export function claimTechReward(c){
  if(c.cores['core-1'].state!=='active'||c.road.techReward)return false;
  if(!addTo(c,'player',GENERATOR.reward))return false;c.road.techReward=true;return true;
}

// ---- Posto de combustível ------------------------------------------------------------------------
export function gasBuy(c,state,pointId,offerId){
  const p=roadPoint(pointId),o=GAS_OFFERS.find(o=>o.id===offerId);if(!p||p.kind!=='gas'||!o)return false;
  const stock=c.road.stocks[p.id],scrap=c.inventory.player.scrap;
  if(o.kind==='water'){if(stock.water<o.quantity)return false;if(!trade(c,{scrap:o.cost},{water:o.quantity}))return false;stock.water-=o.quantity;return true;}
  if(o.kind==='can'){
    const liters=Math.min(o.liters,stock.diesel);if(liters<1)return false;
    const cost=Math.ceil(liters/LITERS_PER_SCRAP);if(scrap<cost||!trade(c,{scrap:cost},{diesel:liters}))return false;
    stock.diesel-=liters;return true;
  }
  const room=Math.floor(CONFIG.vehicle.fuelCapacity-state.fuel);
  const liters=Math.min(o.liters,room,stock.diesel,scrap*LITERS_PER_SCRAP);if(liters<1)return false;
  const cost=Math.ceil(liters/LITERS_PER_SCRAP);c.inventory.player.scrap-=cost;state.fuel+=liters;stock.diesel-=liters;return true;
}

// ---- Oficina -------------------------------------------------------------------------------------
export function shopBuy(c,pointId,offerId){
  const p=roadPoint(pointId),o=WORKSHOP_OFFERS.find(o=>o.id===offerId);if(!p||p.kind!=='workshop'||!o)return false;
  const stock=c.road.stocks[p.id];if(stock[o.item]<o.quantity||!trade(c,{scrap:o.cost},{[o.item]:o.quantity}))return false;
  stock[o.item]-=o.quantity;return true;
}
export function shopService(c,pointId,serviceId,component){
  const p=roadPoint(pointId),s=WORKSHOP_SERVICES.find(s=>s.id===serviceId);
  if(!p||p.kind!=='workshop'||!s||!COMPONENTS[component]||c.components[component]>=100)return false;
  if(c.inventory.player.scrap<s.cost)return false;
  c.inventory.player.scrap-=s.cost;c.components[component]=Math.min(100,c.components[component]+s.gain);return true;
}
export function shopSell(c,pointId){
  const p=roadPoint(pointId);if(!p||p.kind!=='workshop')return false;
  return trade(c,{parts:WORKSHOP_SELL.parts},{scrap:WORKSHOP_SELL.scrap});
}

// ---- Saqueadores ---------------------------------------------------------------------------------
export function resolveAmbush(c,id,outcome){
  if(!OUTCOMES.includes(outcome)||outcome==='pending'||c.road.ambushes[id]!=='pending')return false;
  c.road.ambushes[id]=outcome;if(outcome==='robbed')c.road.robbed++;return true;
}
// Leva uma fração de cada item do compartimento do Titã (pelo menos 1 de cada item que existir).
export function robTruck(c,fraction){
  const stolen={};
  for(const id of Object.keys(ITEMS)){
    const have=Math.floor(c.inventory.truck[id]);if(have<1)continue;
    const n=Math.min(have,Math.max(1,Math.ceil(have*fraction)));stolen[id]=n;c.inventory.truck[id]-=n;
  }
  return stolen;
}
// Materiais recuperados do saqueador abalroado. Vão para o compartimento; se não couber, para a mochila.
export function rewardRam(c,amount){
  if(addTo(c,'truck',{scrap:amount}))return 'truck';
  if(addTo(c,'player',{scrap:amount}))return 'player';
  return null;
}
export function describeItems(items,labels){
  return Object.entries(items).map(([id,n])=>`${n} ${labels[id]||id}`).join(', ');
}
export const ambushList=c=>AMBUSHES.map(a=>({...a,state:c.road.ambushes[a.id]}));
