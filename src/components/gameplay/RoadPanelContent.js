import { GAS_OFFERS,GENERATOR,LITERS_PER_SCRAP,ROAD_COPY as R,ROAD_POINTS,WORKSHOP_OFFERS,WORKSHOP_SERVICES } from '../../data/road.js';
import { COMPONENTS,ITEMS } from '../../data/campaign.js';
import { CONFIG } from '../../data/config.js';
import DialogueText from './DialogueText.js';

const kmOf=p=>(-p.z/1000).toFixed(2).replace('.',',');

export function RoadJournal({campaign:c}){
  return <><h3>{R.journal}</h3><p className="panel-note">{R.gasLine}</p><div className="network-journal">{ROAD_POINTS.filter(p=>p.kind!=='tech').map(p=>
    <section key={p.id}><h3>{p.name}</h3><p>{p.kind==='gas'?'Posto':'Oficina'} · km {kmOf(p)}{c.road?.visited.includes(p.id)?' · visitado':''}</p><small>{p.npc}</small></section>)}</div></>;
}

function Tech({state,act}){
  const c=state.campaign,gen=c.road.generator,seed=c.seed.received,core=c.cores['core-1'].state;
  const text=core==='active'?(c.road.techReward?R.techAfter:R.techActive):!seed?R.techNoSeed:!gen?R.techNeedGen:core==='failed'||c.stage==='failed'?R.techFailed:R.techGenOn;
  const bag=c.inventory.player,truck=c.inventory.truck,canPay=Object.entries(GENERATOR.cost).every(([id,n])=>bag[id]+truck[id]>=n);
  return <><span className="eyebrow">Tomás</span><DialogueText text={text}/>
    <p className="panel-note">{R.generatorStatus}: <b>{gen?R.on:R.off}</b>. {R.payNote}</p>
    {!gen&&<button className="primary" disabled={!seed||!canPay} onClick={()=>act('roadGenerator')}>{R.generatorCost}</button>}
    {!gen&&seed&&!canPay&&<p role="status">{R.techLowFuel}</p>}
    {gen&&<p role="status">{R.generatorOn}</p>}
    {core==='active'&&<button className="wide-link" disabled={c.road.techReward} onClick={()=>act('roadClaim')}>{c.road.techReward?R.claimed:`${R.claim} · ${R.claimDetail}`}</button>}</>;
}

function Gas({state,game,act,p}){
  const c=state.campaign,stock=c.road.stocks[p.id],scrap=c.inventory.player.scrap,parked=game.roadController.parked(p),fuel=state.fuel??0;
  const room=Math.floor(CONFIG.vehicle.fuelCapacity-fuel);
  const quote=o=>{
    if(o.kind==='water')return {ok:stock.water>=o.quantity&&scrap>=o.cost,cost:o.cost,need:false};
    if(o.kind==='can'){const l=Math.min(o.liters,stock.diesel),cost=Math.ceil(l/LITERS_PER_SCRAP);return {ok:l>=1&&scrap>=cost,cost,need:false};}
    const l=Math.min(o.liters,room,stock.diesel,scrap*LITERS_PER_SCRAP),cost=Math.ceil(l/LITERS_PER_SCRAP);return {ok:l>=1,cost,liters:l,need:true};
  };
  return <><span className="eyebrow">{p.npc}</span><DialogueText text={p.line}/>
    <p className="panel-note">{R.gasLine} {R.pumpNote}</p>
    <p>{R.tank}: {fuel.toFixed(1)} / {CONFIG.vehicle.fuelCapacity} L · {R.scrap}: {scrap} · {R.stock}: {stock.diesel} L diesel · {stock.water} L água</p>
    <div className="trade-list">{GAS_OFFERS.map(o=>{const q=quote(o);return <div key={o.id}><span>{o.label}<small>{q.liters?`${q.liters} L · `:''}{q.cost} {R.scrap.toLowerCase()}</small></span>
      <button disabled={!q.ok||(q.need&&!parked)} onClick={()=>act('roadGas',o.id)}>{stock[o.kind==='water'?'water':'diesel']<1?R.sold:R.buy}</button></div>;})}</div>
    {!parked&&<p role="status">{R.pumpNote}</p>}</>;
}

function Workshop({state,game,act,p}){
  const c=state.campaign,stock=c.road.stocks[p.id],scrap=c.inventory.player.scrap,parked=game.roadController.parked(p);
  return <><span className="eyebrow">{p.npc}</span><DialogueText text={p.line}/>
    <p className="panel-note">{R.shopNote}</p><p>{R.scrap}: {scrap}</p>
    <h3>{R.buyParts}</h3><div className="trade-list">{WORKSHOP_OFFERS.map(o=><div key={o.id}><span>{o.label}<small>{R.stock}: {stock[o.item]} · {o.cost} {R.scrap.toLowerCase()} · {ITEMS[o.item].name}</small></span>
      <button disabled={stock[o.item]<o.quantity||scrap<o.cost} onClick={()=>act('roadShopBuy',o.id)}>{stock[o.item]<o.quantity?R.sold:R.buy}</button></div>)}</div>
    <button className="wide-link" disabled={c.inventory.player.parts<2} onClick={()=>act('roadSell')}>{R.sellParts}</button>
    <h3>{R.services}</h3><div className="component-grid">{Object.entries(COMPONENTS).map(([id,name])=><section key={id}><div className="condition-title"><b>{name}</b><span>{Math.round(c.components[id])}%</span></div><meter min="0" max="100" value={c.components[id]}/>
      {WORKSHOP_SERVICES.map(s=><button key={s.id} aria-label={`${s.label} ${R.serviceFor} ${name}`} disabled={!parked||c.components[id]>=100||scrap<s.cost} onClick={()=>act('roadService',{service:s.id,component:id})}>{s.label} · {s.cost} mat.</button>)}</section>)}</div>
    {!parked&&<p role="status">{R.shopNote}</p>}</>;
}

export default function RoadPanelContent({state,game,act}){
  const p=ROAD_POINTS.find(k=>k.id===state.roadPoint);if(!p||!state.campaign?.road)return null;
  if(p.kind==='tech')return <Tech state={state} act={act}/>;
  if(p.kind==='gas')return <Gas state={state} game={game} act={act} p={p}/>;
  return <Workshop state={state} game={game} act={act} p={p}/>;
}
