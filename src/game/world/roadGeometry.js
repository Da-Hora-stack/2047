import * as THREE from 'three';
import { roadHeight, heightAt } from './terrain.js';

// Reusable road strip: the same indexed geometry is sent to rendering and Rapier.
// UVs are measured in metres, preserving the scale of PBR scans across segments.
export function roadRibbon({ start,end,center,width=5,side=0,shoulder=3,sectorX=0,sectorSize=1024,step=4 }) {
  const positions=[],indices=[],uv=[],steps=Math.ceil((end-start)/step);let rows=0;
  for(let i=0;i<=steps;i++){
    const z=start+(end-start)*i/steps,x=center(z);if(Math.round(x/sectorSize)!==sectorX)continue;
    const w=typeof width==='function'?width(z):width,derivative=(center(z+.1)-center(z-.1))/.2,normalX=1/Math.hypot(1,derivative),normalZ=-derivative*normalX;
    const offsets=side<0?[-w-shoulder,-w]:side>0?[w,w+shoulder]:[-w,w];
    for(const offset of offsets){const px=x+offset*normalX,pz=z+offset*normalZ;const y=side&&Math.abs(offset)>w+.01?heightAt(px,pz)+.035:roadHeight(pz)+(side?.075:.09);positions.push(px,y,pz);uv.push(offset,-z);}
    if(rows){const j=(rows-1)*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}rows++;
  }
  if(!indices.length)return null;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;
}