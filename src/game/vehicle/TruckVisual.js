import * as THREE from 'three';

export function inspectTruckRig(scene, definition, wheelPoints) {
  const bindings=definition?.wheels;
  if(!Array.isArray(bindings)||bindings.length!==wheelPoints.length)throw new Error(`Rig exige ${wheelPoints.length} rodas físicas compatíveis; o modelo recebido precisa ser adaptado antes de dirigir`);
  const names=new Set();scene.traverse(node=>{if(node.name){if(names.has(node.name))names.add(`duplicate:${node.name}`);names.add(node.name);}});
  const wheels=bindings.map((binding,i)=>{
    if(!binding.node||names.has(`duplicate:${binding.node}`))throw new Error('Nomes de rodas ausentes/ambíguos');
    const node=scene.getObjectByName(binding.node);if(!node||!['x','y','z'].includes(binding.spinAxis)||![1,-1].includes(binding.spinSign))throw new Error(`Roda inválida: ${binding.node}`);
    const center=node.getWorldPosition(new THREE.Vector3()),p=wheelPoints[i];
    if(Math.hypot(center.x-p.x,center.y-(p.y-.52),center.z-p.z)>.4)throw new Error(`Pivô ${binding.node} não corresponde à roda física ${i}`);
    return {node,binding,center};
  });
  if(new Set(wheels.map(w=>w.node)).size!==wheelPoints.length)throw new Error('O mesmo nó foi usado por mais de uma roda');
  for(const wheel of wheels)for(const other of wheels)if(other!==wheel&&wheel.node.getObjectById(other.node.id))throw new Error('Rodas não podem ser ancestrais entre si');
  const size=new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
  if(size.x<1.5||size.x>3.4||size.y>6||size.z<6||size.z>10.5)throw new Error('Dimensões do modelo incompatíveis com o chassi atual');
  let triangles=0;scene.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position?.count||0)/3;});
  if(triangles>180000)throw new Error('Modelo excede o orçamento de 180 mil triângulos; gere LOD/otimize antes de integrar');
  return {wheels,triangles,size:size.toArray()};
}

// The visual never owns or teleports the Rapier body. The raycast controller drives it.
export class TruckVisual {
  constructor(truck,assets){this.truck=truck;this.assets=assets;this.status='legacy';this.wheels=[];}
  async load(definition) {
    if(definition?.status!=='installed'||definition.rightsCleared!==true)return false;
    if(!definition.source||!definition.license||!definition.attribution)throw new Error('Modelo sem origem, licença e crédito registrados');
    const lease=await this.assets.model(definition.url);this.lease=lease;
    try {
      if(this.assets.disposed){lease.release();return false;}
      const visual=new THREE.Group();visual.name='Modelo importado do Titã';visual.add(lease.scene);
      const scale=definition.scale??1;if(!Number.isFinite(scale)||scale<=0||scale>100)throw new Error('Escala de modelo inválida');
      lease.scene.scale.multiplyScalar(scale);lease.scene.rotation.y=definition.rotationY||0;lease.scene.position.fromArray(definition.offset||[0,0,0]);visual.updateMatrixWorld(true);
      for(const name of definition.removeNodes||[]){const node=lease.scene.getObjectByName(name);if(!node)throw new Error(`Malha de carga não encontrada: ${name}`);if(definition.wheels.some(w=>node.getObjectByName(w.node)||node.name===w.node))throw new Error('Remoção atingiria roda/chassi');node.removeFromParent();}
      const rig=inspectTruckRig(visual,definition,this.truck.wheelPoints);
      this.legacy=[...this.truck.root.children].filter(o=>o.isMesh||o.isGroup);
      // Cab/old exterior are hidden outside. The existing cockpit remains provisional inside.
      this.truck.root.add(visual);this.visual=visual;
      for(const {node,binding,center} of rig.wheels){const steer=new THREE.Group(),spin=new THREE.Group();visual.add(steer);steer.position.copy(center);steer.add(spin);visual.updateMatrixWorld(true);spin.attach(node);this.wheels.push({steer,spin,binding});}
      this.status='imported';this.id=definition.id;this.rig=rig;return true;
    }catch(error){lease.release();this.lease=null;throw error;}
  }
  update(controller,inside){
    if(!this.visual)return;
    this.visual.visible=!inside;for(const o of this.legacy)o.visible=o===this.truck.cab&&inside;
    for(let i=0;i<this.wheels.length;i++){const {steer,spin,binding}=this.wheels[i],p=this.truck.wheelPoints[i];steer.position.y=p.y-(controller.wheelSuspensionLength(i)??.52);steer.rotation.y=controller.wheelSteering(i)||0;spin.rotation[binding.spinAxis]=(controller.wheelRotation(i)||0)*binding.spinSign;}
  }
  snapshot(){return {status:this.status,id:this.id||null,triangles:this.rig?.triangles||0,wheelBindings:this.wheels.length,provisionalCockpit:this.status==='imported'};}
  dispose(){this.visual?.removeFromParent();this.lease?.release();this.lease=null;}
}