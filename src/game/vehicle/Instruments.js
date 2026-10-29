import * as THREE from 'three';
import { DRIVING_COPY as C } from '../../data/truck-tuning.js';

function faceTexture(label,max,step){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
 c.fillStyle='#171b1b';c.fillRect(0,0,256,256);c.strokeStyle='#747c75';c.lineWidth=4;c.beginPath();c.arc(128,128,116,0,Math.PI*2);c.stroke();
 c.textAlign='center';c.textBaseline='middle';c.font='18px sans-serif';
 for(let v=0;v<=max;v+=step){const a=(225-v/max*270)*Math.PI/180;c.strokeStyle=v>max*.83?'#b96b4e':'#ddd7c7';c.lineWidth=2;c.beginPath();c.moveTo(128+Math.cos(a)*94,128-Math.sin(a)*94);c.lineTo(128+Math.cos(a)*106,128-Math.sin(a)*106);c.stroke();c.fillStyle='#d8d3c5';c.fillText(String(v),128+Math.cos(a)*76,128-Math.sin(a)*76);}
 c.fillStyle='#aaa99b';c.font='16px sans-serif';c.fillText(label,128,174,170);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
export function createInstruments(){
 const group=new THREE.Group(),dials={};const needleMaterial=new THREE.MeshBasicMaterial({color:'#d2a271',toneMapped:false}),rimMaterial=new THREE.MeshStandardMaterial({color:'#525c5b',roughness:.6,metalness:.35});
 const shape=new THREE.Shape();shape.moveTo(-.008,-.024);shape.lineTo(.008,-.024);shape.lineTo(.003,.145);shape.lineTo(-.003,.145);shape.closePath();const needleGeometry=new THREE.ShapeGeometry(shape);
 const dial=(key,label,max,step,x,y,r)=>{const g=new THREE.Group();g.position.set(x,y,-2.96);group.add(g);const material=new THREE.MeshBasicMaterial({map:faceTexture(label,max,step),toneMapped:false});const face=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),material);g.add(face);g.add(new THREE.Mesh(new THREE.TorusGeometry(r,.009,6,32),rimMaterial));const needle=new THREE.Mesh(needleGeometry,needleMaterial);needle.position.z=.006;needle.scale.setScalar(r/.19);g.add(needle);dials[key]={needle,max,value:0};};
 dial('speed',C.instrumentSpeed,120,20,-.88,1.45,.19);dial('rpm',C.instrumentRpm,26,4,-.43,1.45,.19);dial('fuel',C.instrumentFuel,180,60,-.09,1.45,.1);dial('temperature',C.instrumentTemp,150,50,.15,1.45,.1);
 const display=document.createElement('canvas');display.width=256;display.height=80;const displayTexture=new THREE.CanvasTexture(display);displayTexture.colorSpace=THREE.SRGBColorSpace;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.24,.12),new THREE.MeshBasicMaterial({map:displayTexture,toneMapped:false}));screen.position.set(.12,1.61,-2.945);group.add(screen);let lastText='',readings={};
 return {group,update(state,dt){readings={speed:Math.abs(state.speed||0)*3.6,rpm:(state.rpm||0)/100,fuel:state.fuel||0,temperature:state.temperature||0,gear:state.gearLabel||C.neutral};
  for(const [key,d] of Object.entries(dials)){d.value+=(readings[key]-d.value)*(1-Math.exp(-Math.min(dt,.25)*14));const a=(225-Math.max(0,Math.min(1,d.value/d.max))*270)*Math.PI/180;d.needle.rotation.z=a-Math.PI/2;}
  const text=`${readings.gear}   ${state.parkingBrake?'P':state.shifting?'↔':''}`;if(text!==lastText){const c=display.getContext('2d');c.fillStyle='#232c27';c.fillRect(0,0,256,80);c.fillStyle='#c8cfad';c.font='54px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(text,128,43);displayTexture.needsUpdate=true;lastText=text;}
 },snapshot(){return {...readings,rpm:(readings.rpm||0)*100,needleAngles:Object.fromEntries(Object.entries(dials).map(([key,d])=>[key,d.needle.rotation.z]))};}};
}
