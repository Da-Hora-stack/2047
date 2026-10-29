import { BIOMES,CORES,ROUTES,SHELTERS,SIDE_MISSIONS,SUPPLY_CACHES,biomeAt,WORLD_COPY as W } from '../../data/network.js';
import { OFFERS } from '../../data/expedition.js';
import { bagWeight,activateCore } from './campaign.js';
import { migrateCampaign } from '../survival/expedition.js';
import { activationChance } from '../cargo/integrity.js';
import { upgradeRoad } from './road.js';

export function upgradeCampaign(source){
const c=migrateCampaign(source),old=c.network;
c.cores={...Object.fromEntries(CORES.map(k=>[k.id,{state:'inactive',attempts:0}])),...c.cores};
c.network={clock:0,cargo:null,seeds:Object.fromEntries(CORES.map(k=>[k.id,{obtained:false,integrity:100}])),quests:Object.fromEntries(SIDE_MISSIONS.map(q=>[q.id,'available'])),looted:[],visited:[],routes:{},stocks:Object.fromEntries(SHELTERS.map(s=>[s.id,{diesel:40,water:16,food:12,parts:16}])),...old};
if(!old){for(const core of Object.values(c.cores))if(core.state!=='inactive'&&core.attempts===0)core.attempts=1;c.network.seeds['core-1']={obtained:c.seed.received,integrity:c.seed.integrity};if(c.seed.received&&c.stage!=='activated')c.network.cargo='core-1';}
syncFirst(c);syncRestoration(c);upgradeRoad(c);return c;
}
export function syncFirst(c){if(!c.network)return;c.network.seeds['core-1'].obtained=c.seed.received;if(c.stage!=='activated'&&c.seed.received){c.network.cargo='core-1';c.network.seeds['core-1'].integrity=c.seed.integrity;}else if(c.network.cargo==='core-1'){c.network.seeds['core-1'].integrity=c.seed.integrity;c.network.cargo=null;}}
export function syncRestoration(c){for(const r of BIOMES)c.restoration[r.id]=r.cores.every(id=>c.cores[id].state==='active');}
export function nextCore(c){return CORES.find(k=>c.cores[k.id]?.state!=='active')||null;}
export function hasCargo(c){return c.network?!!c.network.cargo:c.seed.received&&c.stage!=='activated';}
export function restoredAt(c,z){const region=biomeAt(z),cores=CORES.filter(k=>k.region===region);let nearest=cores[0];for(const k of cores)if(Math.abs(z-k.z)<Math.abs(z-nearest.z))nearest=k;return c.cores[nearest.id]?.state==='active';}
export function transact(c,bag,cost={},reward={}){
if(!['player','truck'].includes(bag))return false;const next={...c.inventory[bag]};
for(const [id,n] of Object.entries(cost)){if(next[id]<n)return false;next[id]-=n;}
for(const [id,n] of Object.entries(reward))next[id]+=n;
if(bagWeight(next)>(bag==='player'?40:240))return false;Object.assign(c.inventory[bag],next);return true;
}
export function openVault(c,id){const core=CORES.find(k=>k.id===id);if(!core||core.number===1||nextCore(c)?.id!==id||hasCargo(c)||c.network.seeds[id].obtained)return false;
if(core.number===7&&(c.components.radiator<50||c.components.filters<50||c.components.transmission<40))return false;
if(!transact(c,'truck',core.vault.cost))return false;
c.network.seeds[id]={obtained:true,integrity:100};c.network.cargo=id;c.seed.integrity=100;c.decisions.push(`${id}-vault-opened`);return true;
}
export function calibrateNetwork(c,id){if(c.network.cargo!==id||c.seed.integrity>=100||!transact(c,'truck',{parts:2}))return false;c.seed.integrity=Math.min(100,c.seed.integrity+20);c.network.seeds[id].integrity=c.seed.integrity;return true;}
export function anchor(c,id){
if(nextCore(c)?.id!==id||!hasCargo(c)||c.network.cargo!==id)return null;
if(id==='core-1'){const result=activateCore(c);syncFirst(c);syncRestoration(c);return result;}
const chance=activationChance(c.seed.integrity);c.rngState=(Math.imul(c.rngState,1664525)+1013904223)>>>0;const roll=c.rngState/4294967296,success=roll<chance,core=c.cores[id];core.attempts++;core.state=success?'active':'failed';
if(success){c.network.cargo=null;c.completedMissions.push(`aurora-${CORES.find(k=>k.id===id).number}`);c.decisions.push(`${id}-activated`);}else c.seed.integrity=Math.max(0,c.seed.integrity-8);
c.network.seeds[id].integrity=c.seed.integrity;syncRestoration(c);return {success,chance,roll};
}
export function questAction(c,id,action){const q=SIDE_MISSIONS.find(q=>q.id===id);if(!q)return false;const state=c.network.quests[id];
if(action==='accept'&&state==='available'){c.network.quests[id]='accepted';c.decisions.push(`quest-${id}-accepted`);return true;}
if(action==='complete'&&state==='accepted'&&transact(c,q.bag,q.cost,q.reward)){c.network.quests[id]='completed';c.completedMissions.push(`side-${id}`);if(id==='relay'&&!c.flags.voiceFragments.includes('glass-relay'))c.flags.voiceFragments.push('glass-relay');return true;}
return false;
}
export function networkLoot(c,id){const cache=SUPPLY_CACHES.find(k=>k.id===id);if(!cache||c.network.looted.includes(id)||!transact(c,'player',{},cache.loot))return false;c.network.looted.push(id);return true;}
export function networkBuy(c,shelter,id){if(!Object.prototype.hasOwnProperty.call(OFFERS,id))return false;const o=OFFERS[id],stock=c.network.stocks[shelter];if(!o||!stock||stock[id]<o.quantity||!transact(c,'player',{scrap:o.cost},{[id]:o.quantity}))return false;stock[id]-=o.quantity;c.expedition.transactions++;return true;}
export function weatherAt(c,z){const region=biomeAt(z),restored=restoredAt(c,z),clock=c.network?.clock||0,front=region==='storm'&&clock%120<65&&!restored;
return {region,restored,event:front?'front':region==='salt'&&!restored?'heat':region==='glass'&&!restored?'crosswind':'calm',front,interference:region==='storm'?(front?.95:restored?.12:.65):region==='glass'?.3:region==='cities'?.18:.08,fog:restored?.55:front?3.8:region==='glass'?1.2:1,grip:restored?1:front?.72:region==='glass'?.78:1};
}
export function networkStep(c,state,input,dt){c.network.clock+=dt;const w=weatherAt(c,state.z),moving=state.speed>1;
if(moving&&w.region==='glass'&&!w.restored){c.components.transmission=Math.max(0,c.components.transmission-dt*Math.abs(input.throttle)*.014);if(state.engineOn)state.temperature=Math.min(170,state.temperature+dt*.09);}
if(moving&&w.front)c.components.filters=Math.max(0,c.components.filters-dt*.055);
const route=ROUTES.find(r=>Math.abs(-state.z-r.at)<45);
if(route?.kind==='flood'&&!w.restored&&Math.abs(state.x)<30&&state.speed>6)c.components.engine=Math.max(0,c.components.engine-dt*(state.speed-6)*.04);
return w;
}
export function objective(c){const core=nextCore(c);if(!core)return {number:7,title:W.allAnchored,detail:W.allDetail};if(core.number===1)return null;const loaded=c.network.cargo===core.id;return {number:core.number,title:loaded?`Leve a Semente ao Núcleo ${core.number}`:`Obtenha a Semente ${core.number}`,detail:loaded?`${BIOMES.find(r=>r.id===core.region).hint} Destino: km ${(-core.z/1000).toFixed(1)}.`:`Cofre ${core.number}, km ${(-core.vault.z/1000).toFixed(2)}. ${core.vault.task}`};}
export function radioMessages(c,z){const region=biomeAt(z),messages=[];if(c.flags.renataContact&&W.radio[region])messages.push(W.radio[region]);if(c.network?.quests.relay==='completed')messages.push(W.radio.relay,W.radio.voice);if(c.network?.quests.supply==='completed'&&region==='storm')messages.push(W.reappeared);if(!nextCore(c))messages.push(W.radio.end);return messages;}