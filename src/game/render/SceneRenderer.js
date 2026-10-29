import * as THREE from 'three';
import { CONFIG } from '../../data/config.js';
import { randomSeed } from '../world/terrain.js';
export class SceneRenderer {
  constructor(canvas,settings) {
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.14;
    this.renderer.shadowMap.type=THREE.PCFShadowMap;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#75848a');this.scene.fog=new THREE.FogExp2('#88908e',.0029);
    this.camera=new THREE.PerspectiveCamera(54,1,.1,1800);
    this.scene.add(new THREE.HemisphereLight('#9caeba','#6b5844',2.1));
    this.sun=new THREE.DirectionalLight('#f3ce9d',3.1);this.sun.position.set(-100,65,-160);this.sun.castShadow=true;
    const sc=this.sun.shadow.camera;sc.left=sc.bottom=-45;sc.right=sc.top=45;sc.near=1;sc.far=300;this.sun.shadow.bias=-.0005;this.sun.shadow.normalBias=.12;this.scene.add(this.sun,this.sun.target);
    const skyGeo=new THREE.SphereGeometry(1500,24,12);const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#4f6575')},bottom:{value:new THREE.Color('#b7a68c')}},vertexShader:`varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(v).y*1.6,0.0,1.0);float cloud=sin(v.x*.006+sin(v.z*.009))*sin(v.z*.006+v.y*.012)*.035;gl_FragColor=vec4(mix(bottom,top,h)+cloud,1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
    this.sky=new THREE.Mesh(skyGeo,skyMat);this.scene.add(this.sky);
    // Original procedural sky, convolved for image-based lighting. No external HDRI claimed.
    this.scene.environmentIntensity=.4;
    this.dustGeo=new THREE.BufferGeometry();this.dustPositions=new Float32Array(500*3);const r=randomSeed(2047);for(let i=0;i<500;i++){this.dustPositions[i*3]=(r()-.5)*100;this.dustPositions[i*3+1]=r()*18;this.dustPositions[i*3+2]=(r()-.5)*100;}
    this.dustGeo.setAttribute('position',new THREE.BufferAttribute(this.dustPositions,3));this.dust=new THREE.Points(this.dustGeo,new THREE.PointsMaterial({color:'#c5b496',size:.075,transparent:true,opacity:.28,depthWrite:false}));this.scene.add(this.dust);
    this.resize=()=>{this.renderer.setSize(window.innerWidth,window.innerHeight,false);this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();};window.addEventListener('resize',this.resize);this.applySettings(settings);this.resize();
  }
  applySettings(settings) {
    this.settings=settings;this.preset=CONFIG.presets[settings.quality]||CONFIG.presets.medio;
    if(settings.quality==='alto'&&!this.environment){const skyScene=new THREE.Scene(),skyMaterial=this.sky.material.clone();skyScene.add(new THREE.Mesh(this.sky.geometry,skyMaterial));const pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(skyScene,0,.1,2000);pmrem.dispose();skyMaterial.dispose();}this.scene.environment=settings.quality==='alto'?this.environment.texture:null;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,this.preset.pixelRatio)*(settings.scale||1));this.renderer.shadowMap.enabled=this.preset.shadows;this.sun.shadow.mapSize.setScalar(this.preset.shadowSize);
    if(this.sun.shadow.map){this.sun.shadow.map.dispose();this.sun.shadow.map=null;}
    this.dustGeo.setDrawRange(0,this.preset.particles);this.scene.fog.density=1.6/this.preset.distance;this.camera.far=this.preset.distance*2.3;this.camera.updateProjectionMatrix();this.resize?.();
  }
  render(position,dt) {
    this.sky.position.copy(this.camera.position);
    this.sun.position.set(position.x-100,position.y+65,position.z-160);this.sun.target.position.copy(position);this.sun.target.updateMatrixWorld();
    this.dust.position.copy(position);for(let i=0;i<this.preset.particles;i++){this.dustPositions[i*3]+=(.65+i%3*.12)*dt;if(this.dustPositions[i*3]>50)this.dustPositions[i*3]=-50;}this.dustGeo.attributes.position.needsUpdate=true;
    this.renderer.render(this.scene,this.camera);
  }
  dispose(sharedMaterials=new Set()) {window.removeEventListener('resize',this.resize);const gs=new Set(),ms=new Set(),ts=new Set();this.scene.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!o.geometry.userData.assetManaged)gs.add(o.geometry);const mats=Array.isArray(o.material)?o.material:[o.material];mats.filter(Boolean).forEach(m=>{if(!m.userData.assetManaged&&!sharedMaterials.has(m)){ms.add(m);for(const v of Object.values(m))if(v?.isTexture&&!v.userData.assetManaged)ts.add(v);}});});gs.forEach(g=>g.dispose());ts.forEach(t=>t.dispose());ms.forEach(m=>m.dispose());this.environment?.dispose();this.sun.shadow.map?.dispose();this.renderer.dispose();this.renderer.forceContextLoss();}
}