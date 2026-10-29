import { POIS,OFFERS } from '../../data/expedition.js';
import { bagWeight,clone } from '../missions/campaign.js';
export function createExpedition(){return {hydration:100,satiety:100,fatigue:0,deprivationSeconds:0,visited:[],looted:[],stock:Object.fromEntries(Object.entries(OFFERS).map(([id,v])=>[id,v.stock])),transactions:0};}
export function migrateCampaign(c){const result=clone(c);result.expedition={...createExpedition(),...(c.expedition||{}),stock:{...createExpedition().stock,...(c.expedition?.stock||{})}};return result;}
export function expeditionStep(e,{traveling,hot,running=false},dt){if(!traveling||dt<=0)return 1;
 e.hydration=Math.max(0,e.hydration-dt*(hot?.035:.018));e.satiety=Math.max(0,e.satiety-dt*.009);e.fatigue=Math.min(100,e.fatigue+dt*(running?.015:.005));
 if(e.hydration<=0||e.satiety<=0)e.deprivationSeconds+=dt;else e.deprivationSeconds=Math.max(0,e.deprivationSeconds-dt*2);
 return 1-Math.min(.3,e.deprivationSeconds/900*.3)-Math.max(0,e.fatigue-75)/250;
}
export function consume(c,kind,from='player'){const e=c.expedition;if(!['water','food'].includes(kind)||!['player','truck'].includes(from)||c.inventory[from][kind]<1)return false;const key=kind==='water'?'hydration':'satiety';if(e[key]>=100)return false;c.inventory[from][kind]--;e[key]=Math.min(100,e[key]+(kind==='water'?30:35));if(e.hydration>0&&e.satiety>0)e.deprivationSeconds=0;return true;}
export function rest(c){const bag=c.inventory.player;if(bag.food<1||bag.water<1)return false;bag.food--;bag.water--;const e=c.expedition;e.fatigue=0;e.hydration=Math.min(100,e.hydration+15);e.satiety=Math.min(100,e.satiety+10);if(e.hydration>0&&e.satiety>0)e.deprivationSeconds=0;return true;}
export function buy(c,id){const offer=OFFERS[id],bag=c.inventory.player,e=c.expedition;if(!offer||e.stock[id]<offer.quantity||bag.scrap<offer.cost)return false;const next={...bag,[id]:bag[id]+offer.quantity,scrap:bag.scrap-offer.cost};if(bagWeight(next)>40)return false;Object.assign(bag,next);e.stock[id]-=offer.quantity;e.transactions++;return true;}
export function sellParts(c){const bag=c.inventory.player;if(bag.parts<2)return false;bag.parts-=2;bag.scrap+=2;c.expedition.transactions++;return true;}
export function loot(c,id){const poi=POIS.find(p=>p.id===id);if(!poi?.loot||c.expedition.looted.includes(id))return false;const next={...c.inventory.player};for(const [key,n] of Object.entries(poi.loot))next[key]+=n;if(bagWeight(next)>40)return false;Object.assign(c.inventory.player,next);c.expedition.looted.push(id);if(!c.expedition.visited.includes(id))c.expedition.visited.push(id);return true;}
export function saltHeat(state,components,dt){if(!state.engineOn)return;state.temperature=Math.min(170,state.temperature+dt*(.2+Math.max(0,state.speed-8)*.025)*(1+(100-components.radiator)/70));if(state.temperature>105)components.radiator=Math.max(0,components.radiator-dt*.006);}
