import { PUMP_RANGE,ROAD_POINTS,WORKSHOP_RANGE } from '../../data/road.js';
import { near } from './campaign.js';
import { claimTechReward,gasBuy,roadPoint,shopBuy,shopSell,shopService,startGenerator } from './road.js';

const TYPES=['roadGenerator','roadClaim','roadGas','roadShopBuy','roadService','roadSell'];
const TALK_RANGE=4.5;
const TRUCK_BAG_RANGE=40; // o compartimento do Titã só ajuda se o caminhão estiver por perto

export class RoadController {
  constructor(game){this.g=game;}
  target(){
    const p=this.g.player.body.translation(),point=ROAD_POINTS.find(k=>near(p,k.talk,TALK_RANGE));
    return point?{id:'road',point:point.id,text:`Falar com ${point.npc}`}:null;
  }
  // Titã parado, motor desligado e perto da bomba (posto) ou da oficina.
  parked(p){
    const g=this.g,ref=p.kind==='gas'?p.pump:p,range=p.kind==='gas'?PUMP_RANGE:WORKSHOP_RANGE;
    return !g.state.engineOn&&g.state.speed<.6&&near(g.current,ref,range);
  }
  action(type,payload){
    if(!TYPES.includes(type))return undefined;
    const g=this.g,c=g.campaign,p=roadPoint(g.state.roadPoint);
    if(!p||g.context()!=='walking'||g.state.overlay!=='road'||!near(g.player.body.translation(),p.talk,TALK_RANGE))return false;
    let ok=false;
    if(type==='roadGenerator'&&p.kind==='tech'){ok=startGenerator(c,{useTruck:near(g.player.body.translation(),g.current,TRUCK_BAG_RANGE)});if(ok)g.checkpoint(5);}
    if(type==='roadClaim'&&p.kind==='tech')ok=claimTechReward(c);
    if(type==='roadGas'&&p.kind==='gas'){
      const tank=['tank-20','tank-full'].includes(payload);
      if(!tank||this.parked(p))ok=gasBuy(c,g.state,p.id,payload);
    }
    if(p.kind==='workshop'&&type==='roadShopBuy')ok=shopBuy(c,p.id,payload);
    if(p.kind==='workshop'&&type==='roadSell')ok=shopSell(c,p.id);
    if(p.kind==='workshop'&&type==='roadService'&&this.parked(p))ok=shopService(c,p.id,payload?.service,payload?.component);
    return ok;
  }
}
