import { TEXT as T } from '../../data/pt-BR.js';
import Symbol from '../ui/Symbol.js';
export default function MainMenu({ready,onStart,onPanel,starting,hasSaves,onContinue}){return <section className="main-menu" aria-label={T.title+': '+T.subtitle}>
  <div className="menu-top"><Symbol size={23}/><span>{T.project}</span><span className="thin-rule"/><span>{T.established}</span></div>
  <div className="menu-content"><div className="eyebrow">{T.silence}</div><h1>{T.title}</h1><div className="game-subtitle">{T.subtitle}</div><p className="tagline">{T.tagline}</p><div className="small-divider"/><p className="intro">{T.intro}</p>
  <nav className="menu-actions"><button className="primary" disabled={!ready||starting} onClick={onStart}><span><small>01</small>{starting?T.loading:T.newGame}</span><Symbol name="arrow"/></button><button disabled={!hasSaves||!ready} onClick={onContinue}><span>{T.continue}</span><small aria-hidden="true">—</small></button><button disabled={!hasSaves||!ready} onClick={()=>onPanel('saves')}><span>{T.load}</span><small aria-hidden="true">—</small></button><div className="menu-secondary"><button onClick={()=>onPanel('settings')}>{T.settings}</button><span>/</span><button onClick={()=>onPanel('credits')}>{T.credits}</button></div></nav></div>
  <div className="menu-footer"><span className="status-dot"/>{T.single}<span className="build">{T.release}</span></div>
</section>;}
