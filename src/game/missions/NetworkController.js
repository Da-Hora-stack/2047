import { NETWORK_POINTS,ROUTES,CORES } from '../../data/network.js';
import { ROAD_POINTS } from '../../data/road.js';
import { near } from './campaign.js';
import { openVault,anchor,calibrateNetwork,questAction,networkLoot,networkBuy } from './network.js';
import { rest } from '../survival/expedition.js';
import { generatorState,startGenerator,claimTechReward,gasBuy,shopBuy,shopService,shopSell } from './road.js';

export function interactionPoint(p){return {x:p.kind==='vault'||p.kind==='network-core'?p.x-1:p.x,z:p.z+(p.kind==='vault'?6:p.kind==='network-core'?8:p.kind==='shelter'?-1:0)};}
export class NetworkController {
constructor(game){this.g=game;}
target(){const p=this.g.player.body.translation(),point=NETWORK_POINTS.find(k=>near(p,interactionPoint(k),k.kind==='network-core'?5:4))||ROAD_POINTS.find(k=>near(p,k.talk||k,4));return point?{id:'network',point:point.id,text:point.name}:null;}
parked(p){const g=this.g,delivery=p.kind==='network-core'?{x:p.x-14,z:p.z+10}:p;return !g.state.engineOn&&g.state.speed<.6&&near(g.current,delivery,p.kind==='network-core'?15:35);}
action(type,payload){if(!['openVault','networkCalibrate','networkActivate','networkLoot','networkBuy','questAccept','questComplete','questDefer','networkRest','networkPlan','generatorStart','techClaim','gasBuy','shopBuy','shopService','shopSell'].includes(type))return undefined;
const g=this.g,c=g.campaign;
if(type==='networkPlan'){const r=ROUTES.find(r=>r.id===payload?.id);if(!r||!['safe','short'].includes(payload.path))return false;c.network.routes[r.id]=payload.path;return true;}
const p=NETWORK_POINTS.find(p=>p.id===g.state.networkPoint)||ROAD_POINTS.find(p=>p.id===g.state.networkPoint);if(!p||g.context()!=='walking'||g.state.overlay!=='network')return false;
let ok=false;
if(type==='openVault'&&p.kind==='vault'&&this.parked(p)){ok=openVault(c,p.core);if(ok)g.resetCargo();}
if(type==='networkCalibrate'&&p.kind==='network-core'&&this.parked(p))ok=calibrateNetwork(c,p.core);
if(type==='networkActivate'&&p.kind==='network-core'&&this.parked(p)){const result=anchor(c,p.core);ok=!!result;if(ok)g.state.activationResult={...result,core:p.core};}
if(type==='networkLoot'&&p.kind==='cache')ok=networkLoot(c,p.id);
if(type==='networkBuy'&&p.kind==='shelter')ok=networkBuy(c,p.id,payload);
if(type==='networkRest'&&p.kind==='shelter')ok=rest(c);
if(type==='questDefer'&&p.quest&&p.kind==='shelter'){const key=`quest-${p.quest}-deferred`;if(!c.decisions.includes(key))c.decisions.push(key);ok=true;}
if(['questAccept','questComplete'].includes(type)&&p.kind==='shelter'&&p.quest&&(p.quest==='supply'||this.parked(p)))ok=questAction(c,p.quest,type==='questAccept'?'accept':'complete');
// Estrada Viva
if(type==='generatorStart'&&p.kind==='tech')ok=startGenerator(c,{useTruck:false});
if(type==='techClaim'&&p.kind==='tech')ok=claimTechReward(c);
if(type==='gasBuy'&&p.kind==='gas')ok=gasBuy(c,g.state,p.id,payload);
if(type==='shopBuy'&&p.kind==='workshop')ok=shopBuy(c,p.id,payload);
if(type==='shopService'&&p.kind==='workshop')ok=shopService(c,p.id,payload,payload.component);
if(type==='shopSell'&&p.kind==='workshop')ok=shopSell(c,p.id);
if(ok&&['openVault','networkActivate','questComplete'].includes(type))g.checkpoint(10+(CORES.find(k=>k.id===p.core)?.number||0));
return ok;
}
}