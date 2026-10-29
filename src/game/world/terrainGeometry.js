import * as THREE from 'three';
import { CONFIG } from '../../data/config.js';
import { heightAt,roadX,detourX,routeAt,networkDetourX } from './terrain.js';
import { groundUV } from '../render/metricUV.js';

// Concentrate vertices around the actual main/alternative roads. A uniform 21 m
// grid interpolated hills across the 10 m pavement, hiding it and lifting wheels.
export function terrainGeometry(cx,cz){
 const size=CONFIG.world.sectorSize,base=CONFIG.world.terrainSegments,dense=cx===0,rows=dense?size/8:base,low=cz*size-size/2,positions=[],indices=[];let columns;
 for(let row=0;row<=rows;row++){
  const z=low+row*size/rows;let xs=[];
  if(dense){
   const main=roadX(z),other=Math.max(main+36,z<-650&&z>-1750?detourX(z):routeAt(z)?networkDetourX(z):main+36);
   const spans=[[-size/2,main-16,16],[main-16,main+16,16],[main+16,other-16,8],[other-16,other+16,16],[other+16,size/2,12]];
   for(const [from,to,steps]of spans)for(let i=0;i<steps;i++)xs.push(from+(to-from)*i/steps);xs.push(size/2);
  }else xs=Array.from({length:base+1},(_,i)=>cx*size-size/2+i*size/base);
  columns=xs.length;
  for(const x of xs){
   let y=heightAt(x,z);
   if(dense&&Math.abs(x)>500){const step=size/base,z0=low+Math.floor((z-low)/step)*step,f=(z-z0)/step,edge=heightAt(x,z0)*(1-f)+heightAt(x,z0+step)*f,t=Math.min(1,(Math.abs(x)-500)/12);y=y*(1-t)+edge*t;}
   positions.push(x,y,z);
  }
  if(row)for(let col=0;col<columns-1;col++){const a=(row-1)*columns+col,b=row*columns+col;indices.push(a,b,a+1,a+1,b,b+1);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);groundUV(g);g.computeVertexNormals();g.computeBoundingSphere();return g;
}