import * as THREE from 'three';
import { bevelGeometry } from '../render/materials.js';
import { mergeStatic } from '../render/mergeStatic.js';
import { createInstruments } from './Instruments.js';
import { TRUCK_TUNING } from '../../data/truck-tuning.js';
export function createTruck(m) {
  const root=new THREE.Group();root.name='Titã Rocha Clara';
  const cab=new THREE.Group();cab.name='Cabine suspensa';root.add(cab);
  const add=(g,mat,x,y,z,parent=root)=>{const mesh=new THREE.Mesh(g,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  const box=(w,h,d,mat,x,y,z)=>add(bevelGeometry(w,h,d),mat,x,y,z);
  const cabBox=(w,h,d,mat,x,y,z)=>add(bevelGeometry(w,h,d),mat,x,y,z,cab);
  box(2.1,.32,8,m.dark,0,-.05,.15);
  // A cabine tem piso e paredes: não existe um bloco sólido escondendo o painel.
  cabBox(2.3,.12,2.05,m.dark,0,.21,-2.65);
  cabBox(2.42,1.26,.12,m.paint,0,.79,-3.67);cabBox(2.42,1.26,.12,m.paint,0,.79,-1.63);
  for(const x of [-1.145,1.145])cabBox(.13,1.26,2.15,m.paint,x,.79,-2.65);
  cabBox(2.42,1.1,.12,m.paint,0,1.98,-1.6);
  cabBox(2.42,.17,.16,m.paint,0,2.44,-3.69);
  for(const x of [-1.17,1.17])for(const z of [-3.68,-1.68])cabBox(.13,1.12,.13,m.paint,x,1.97,z);
  cabBox(2.5,.21,2.3,m.rust,0,2.6,-2.62);
  cabBox(2.25,.82,.12,m.rust,0,.63,-3.76);
  cabBox(2.5,.3,.3,m.steel,0,-.02,-3.9);
  for(let s of [-1,1]) {
    const win=cabBox(1.03,.87,.035,m.glass,s*.565,1.9,-3.755);win.rotation.x=.04;
    cabBox(.04,.87,.03,m.dark,s*.025,1.9,-3.8);
    cabBox(.035,.85,1.12,m.glass,s*1.23,1.9,-2.68);
    cabBox(.04,.04,.3,m.dark,s*1.26,1.1,-2.1);
    cabBox(.3,.13,.025,m.dark,s*.65,1.48,-3.8).rotation.z=s*.2;
    cabBox(.53,.26,.09,m.light,s*.89,.38,-3.85);
    cabBox(.2,.42,.16,m.dark,s*1.57,1.93,-3.22);
    cabBox(.34,.045,.045,m.steel,s*1.4,1.8,-3.12);
    cabBox(.49,.14,1.25,m.steel,s*1.24,-.22,-2.18);
    const fender=add(new THREE.TorusGeometry(.74,.12,5,14,Math.PI),m.rust,s*1.19,-.3,-2.45);fender.rotation.y=Math.PI/2;
    cabBox(.28,.68,.11,m.rubber,s*1.15,-.41,-1.58);
    const tank=add(new THREE.CylinderGeometry(.42,.42,1.8,14),m.steel,s*1.16,-.22,-.35);tank.rotation.x=Math.PI/2;
    for(const z of [-.93,.25]){const strap=add(new THREE.TorusGeometry(.435,.038,5,14),m.dark,s*1.16,-.22,z);}
  }
  for(let i=0;i<6;i++) cabBox(1.35,.045,.04,m.dark,0,.4+i*.105,-3.84);
  cabBox(.46,.16,.04,m.dark,0,.02,-4.07);
  box(2.48,.22,4.55,m.rust,0,.18,1.48);
  for(const s of [-1,1]) {
    box(.12,.78,4.55,m.paint,s*1.2,.68,1.48);
    for(let j=0;j<6;j++)box(.15,.93,.08,m.rust,s*1.22,.72,-.62+j*.8);
    box(.08,.1,4.5,m.steel,s*1.25,1.1,1.48);
  }
  box(2.5,.75,.12,m.paint,0,.67,3.77);
  box(2.45,.28,.16,m.dark,0,-.15,3.95);
  for(const x of [-1,1])box(.26,.17,.08,m.rust,x,-.02,4.05);
  // Berço de carga vazio: a Semente só chega na Fase 2.
  for(const z of [.3,2.8])box(1.65,.18,.2,m.dark,0,.43,z);
  for(const x of [-.75,.75])box(.14,.5,2.7,m.steel,x,.57,1.55);
  const pipe=add(new THREE.CylinderGeometry(.105,.105,3.35,9),m.dark,1.07,1.35,-1.25);
  const cap=add(new THREE.CylinderGeometry(.14,.105,.34,9),m.rust,1.07,3.11,-1.25);cap.rotation.z=.15;
  const wheelGeometry=new THREE.CylinderGeometry(.61,.61,.41,16);wheelGeometry.rotateZ(Math.PI/2);
  const hubGeometry=new THREE.CylinderGeometry(.31,.31,.44,10);hubGeometry.rotateZ(Math.PI/2);
  const treadGeometry=new THREE.BoxGeometry(.43,.045,.19);
  const wheels=[], springs=[], axles=[];
  const wheelPoints=[];
  for(const z of [-2.5,1.45,2.9])for(const s of [-1,1]) {
    const steering=new THREE.Group();steering.position.set(s*1.2,-.68,z);root.add(steering);
    const spin=new THREE.Group();steering.add(spin);add(wheelGeometry,m.rubber,0,0,0,spin);add(hubGeometry,m.steel,0,0,0,spin);
    const tread=new THREE.InstancedMesh(treadGeometry,m.dark,16);
    const dummy=new THREE.Object3D();for(let i=0;i<16;i++){const a=i/16*Math.PI*2;dummy.position.set(0,Math.cos(a)*.604,Math.sin(a)*.604);dummy.rotation.x=a;dummy.updateMatrix();tread.setMatrixAt(i,dummy.matrix);}spin.add(tread);
    wheels.push({steering,spin});wheelPoints.push({x:s*1.2,y:-.1,z});
    const spring=add(new THREE.CylinderGeometry(.11,.11,.45,7),m.steel,s*.85,-.35,z);springs.push(spring);
  }
  for(const z of [-2.5,1.45,2.9]){const a=add(new THREE.CylinderGeometry(.095,.095,2.5,7),m.dark,0,-.68,z);a.rotation.z=Math.PI/2;axles.push(a);}
  // Dashboard visible depuis la caméra de cabine.
  cabBox(2,.27,.55,m.dark,0,1.25,-3.27);
  const steeringWheel=new THREE.Group();steeringWheel.position.set(-.62,1.51,-2.6);steeringWheel.rotation.x=-.6;cab.add(steeringWheel);
  add(new THREE.TorusGeometry(.26,.025,8,32),m.dark,0,0,0,steeringWheel);add(new THREE.CylinderGeometry(.055,.055,.045,12).rotateX(Math.PI/2),m.steel,0,0,.015,steeringWheel);
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2,spoke=add(bevelGeometry(.23,.025,.025),m.steel,Math.cos(a)*.12,Math.sin(a)*.12,.008,steeringWheel);spoke.rotation.z=a;}
  cabBox(.65,.2,.7,m.dark,-.62,.75,-1.94);cabBox(.65,.8,.15,m.dark,-.62,1.2,-1.65);
  const lever=add(new THREE.CylinderGeometry(.018,.018,.45,8),m.steel,.08,.92,-2.22,cab);add(new THREE.SphereGeometry(.055,12,8),m.dark,.08,1.16,-2.22,cab);
  cabBox(1.5,.49,.06,m.dark,-.35,1.43,-3.005);
  const instruments=createInstruments();cab.add(instruments.group);
  const lights=[];
  for(const x of [-.89,.89]) {const spot=new THREE.SpotLight('#efd6a4',35,65,.42,.6,1.4);spot.position.set(x,.4,-4);spot.target.position.set(x,-.6,-35);root.add(spot,spot.target);lights.push(spot);}
  const smokeGeo=new THREE.BufferGeometry();const smokePos=new Float32Array(24*3);smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokePos,3));
  const smoke=new THREE.Points(smokeGeo,new THREE.PointsMaterial({color:'#4a4d52',size:.24,transparent:true,opacity:.35,depthWrite:false}));root.add(smoke);
  mergeStatic(cab,new Set([lever]));mergeStatic(root,new Set([...springs,...axles]));
  return {root,cab,steeringWheel,instruments,wheelPoints,animate(controller,dt,time,engine,headlights,state={},settings={}) {
    for(let i=0;i<wheels.length;i++){const p=wheelPoints[i]; const len=controller.wheelSuspensionLength(i)??.52;wheels[i].steering.position.y=p.y-len;wheels[i].steering.rotation.y=controller.wheelSteering(i)||0;wheels[i].spin.rotation.x=-(controller.wheelRotation(i)||0);springs[i].position.y=p.y-len/2; springs[i].scale.y=len/.45;}
    axles.forEach((a,i)=>a.position.y=(wheels[i*2].steering.position.y+wheels[i*2+1].steering.position.y)/2);
    steeringWheel.rotation.z=(state.steeringAngle||0)*TRUCK_TUNING.steering.steeringWheelRatio;
    const motion=settings.cabMotion!==false,a=1-Math.exp(-Math.min(dt,.25)*9);cab.rotation.z+=((motion?Math.max(-.025,Math.min(.025,-(state.lateralAcceleration||0)*.004)):0)-cab.rotation.z)*a;cab.rotation.x+=((motion?Math.max(-.018,Math.min(.018,-(state.longitudinalAcceleration||0)*.004)):0)-cab.rotation.x)*a;
    cab.position.y=motion&&engine?Math.sin(time*(state.rpm||650)/60*Math.PI*2)*.001:0;lever.rotation.x=state.gear<0?-.18:state.gear>0?.12:0;instruments.update(state,dt);
    lights.forEach(l=>l.visible=headlights);smoke.visible=engine;
    for(let i=0;i<24;i++){const t=(time*.65+i/24)%1;smokePos[i*3]=1.07+t*.9+Math.sin(i*4)*t*.14;smokePos[i*3+1]=3.3+t*2;smokePos[i*3+2]=-1.25+t*.4;}smokeGeo.attributes.position.needsUpdate=true;
  }};
}
