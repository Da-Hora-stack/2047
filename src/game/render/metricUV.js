import * as THREE from 'three';

// One UV unit = one metre. Materials set repeat using the captured physical tile size.
export function metricUV(geometry) {
 const p = geometry.attributes.position, n = geometry.attributes.normal, uv = new Float32Array(p.count * 2);
 for (let i=0;i<p.count;i++) {
 const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
 const pair=ny>=nx&&ny>=nz?[p.getX(i),p.getZ(i)]:nx>=nz?[p.getZ(i),p.getY(i)]:[p.getX(i),p.getY(i)];
 uv[i*2]=pair[0];uv[i*2+1]=pair[1];
 }
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2)); return geometry;
}

export function groundUV(geometry) {
 const p=geometry.attributes.position,uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i);uv[i*2+1]=p.getZ(i);}
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));return geometry;
}