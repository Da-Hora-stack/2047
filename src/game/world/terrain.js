import { CONFIG } from '../../data/config.js';
import { biomeAt,ROUTES } from '../../data/network.js';
export function randomSeed(seed) { let n=seed|0; return () => { n = (Math.imul(n,1664525)+1013904223)|0; return (n>>>0)/4294967296; }; }
export function roadX(z) { const t=Math.max(0, -z-240); return Math.sin(t/390)*24*Math.min(t/300,1); }
export function roadHeight(z) { const t=Math.max(0,Math.min(1,(-z-12600)/5000));return Math.sin(z/180)*1.3 + Math.sin(z/73)*.23+95*Math.sin(t*Math.PI)**2; }
export function roadHalfWidth(z){return biomeAt(z)==='glass'?3:5;}
export function routeAt(z){return ROUTES.find(r=>-z>=r.start&&-z<=r.end);}
export function networkDetourX(z){const r=routeAt(z);return roadX(z)+(r?Math.sin((-z-r.start)/(r.end-r.start)*Math.PI)*130:0);}
export function detourX(z) {const t=Math.max(0,Math.min(1,(-z-650)/1100));return roadX(z)+Math.sin(t*Math.PI)*350;}
export function heightAt(x,z) {
  const route=routeAt(z);const d=Math.min(Math.abs(x-roadX(z)),z < -650 && z > -1750?Math.abs(x-detourX(z)):1e9,route?Math.abs(x-networkDetourX(z)):1e9);
  const s=Math.min(1,Math.max(0,(d-8)/50)); const blend=s*s*(3-2*s);
  const n=Math.sin(x*.016+Math.cos(z*.008)*2)*5 + Math.cos(z*.012+x*.006)*3 + Math.sin(x*.043+z*.027)*1.2;
  const region=biomeAt(z),amplitude=region==='salt'?.18:region==='glass'?4:1;return roadHeight(z) + blend * (n + .8)*amplitude + Math.sin(z*1.5)*.025*(1-blend);
}
export const regionAt=biomeAt;
export function surfaceAt(x,z) {const r=routeAt(z),side=Math.abs(x-roadX(z)),safe=r&&Math.abs(x-networkDetourX(z))<5,region=biomeAt(z);if(safe&&side>12)return 'asfalto';if(region==='salt')return side>55?'lama':'sal';if(region==='glass')return side<roadHalfWidth(z)?'vidro':'rocha';if(r?.kind==='flood'&&Math.abs(-z-r.at)<40&&side<9)return 'agua';const d=Math.min(side,z < -650 && z > -1750?Math.abs(x-detourX(z)):1e9);return d<CONFIG.world.roadWidth/2&&z<80&&z>-CONFIG.world.roadLength?'asfalto':side<8&&z>-3200&&z<80?'cascalho':d<16?'terra':'areia';}