import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

export function localAssetURL(url) {
  if (typeof url !== 'string' || !url.startsWith('/assets/') || /[\\?#]|%|\/\.\.?\//.test(url)) throw new Error('Asset precisa usar caminho local /assets/');
  return url;
}

// Shared resources live until Game.dispose; streamed instances only release their lease.
export class AssetManager {
  constructor(renderer) {
    this.disposed = false; this.renderer = renderer; this.jsonCache = new Map(); this.textures = new Map(); this.textureBytes=new Map(); this.models = new Map(); this.errors = [];
    this.loading = new THREE.LoadingManager();
    this.loading.setURLModifier(url => {
      if (url.startsWith('data:') || url.startsWith('blob:')) return url;
      // GLTFLoader resolves relative external buffers to the same local asset directory.
      return localAssetURL(url);
    });
    this.textureLoader = new THREE.TextureLoader(this.loading);
    this.gltfLoader = new GLTFLoader(this.loading).setMeshoptDecoder(MeshoptDecoder);
    this.abort = new AbortController(); this.references = 0;this.modelRefs=new Map();
  }
  json(url) {
    localAssetURL(url);
    if (!this.jsonCache.has(url)) this.jsonCache.set(url, fetch(url, { signal: this.abort.signal }).then(r => { if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`); return r.json(); }));
    return this.jsonCache.get(url);
  }
  texture(url, { color = false, tileMeters = [1,1] } = {}) {
    localAssetURL(url); const key = JSON.stringify([url, color, tileMeters]);
    if (!this.textures.has(key)) {
      const job = this.textureLoader.loadAsync(url).then(texture => {
        if (this.disposed) { texture.dispose(); throw new Error('Assets liberados durante carregamento'); }
        texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1 / tileMeters[0], 1 / tileMeters[1]); texture.channel = 0;
        texture.anisotropy = Math.min(8, this.renderer?.capabilities.getMaxAnisotropy() || 1);
        texture.userData.assetManaged = true; texture.needsUpdate = true;this.textureBytes.set(key,(texture.image?.width||0)*(texture.image?.height||0)*4*4/3);return texture;
      });
      this.textures.set(key, job);
    }
    return this.textures.get(key);
  }
  async model(url) {
    localAssetURL(url);
    if (!this.models.has(url)) this.models.set(url, this.gltfLoader.loadAsync(url).then(gltf => {
      gltf.scene.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.geometry.userData.assetManaged=true;for (const m of Array.isArray(o.material) ? o.material : [o.material]) { m.userData.assetManaged = true; for (const t of Object.values(m)) if (t?.isTexture) t.userData.assetManaged = true; } } });
      if (this.disposed) { this.releaseModel(gltf); throw new Error('Assets liberados durante carregamento'); }
      return gltf;
    }));
    const job=this.models.get(url);this.modelRefs.set(url,(this.modelRefs.get(url)||0)+1);
    let original;try{original=await job;}catch(error){this.dropModel(url,job);throw error;}
    if (this.disposed) {this.dropModel(url,job);throw new Error('Gerenciador liberado');}
    this.references++;
    let released = false;
    const scene=clone(original.scene);
    return { scene, animations: original.animations, release: () => { if (!released) {const skeletons=new Set();scene.traverse(o=>{if(o.skeleton)skeletons.add(o.skeleton);});skeletons.forEach(s=>s.dispose());this.references--;this.dropModel(url,job); released = true; } } };
  }
  dropModel(url,job){const remaining=Math.max(0,(this.modelRefs.get(url)||1)-1);if(remaining)this.modelRefs.set(url,remaining);else{this.modelRefs.delete(url);if(!this.disposed&&this.models.get(url)===job){this.models.delete(url);job.then(g=>this.releaseModel(g)).catch(()=>{});}}}
  releaseModel(gltf) {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    const skeletons=new Set();gltf.scene.traverse(o => { if(o.skeleton)skeletons.add(o.skeleton);if (o.geometry) geometries.add(o.geometry); for (const m of (Array.isArray(o.material) ? o.material : [o.material]).filter(Boolean)) { materials.add(m); for (const t of Object.values(m)) if (t?.isTexture) textures.add(t); } });skeletons.forEach(s=>s.dispose());
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => { t.source?.data?.close?.(); t.dispose(); });
  }
  snapshot() { return { textures: this.textures.size, estimatedTextureBytes:[...this.textureBytes.values()].reduce((a,b)=>a+b,0),modelSources: this.models.size, modelInstances: this.references, errors: [...this.errors] }; }
  pruneTextures(keep) { for (const [key, job] of this.textures) job.then(texture => { if (!keep.has(texture)) { texture.dispose(); if(this.textures.get(key)===job){this.textures.delete(key);this.textureBytes.delete(key);} } }).catch(() => {}); }
  dispose() {
    if (this.disposed) return; this.disposed = true; this.abort.abort();
    for (const job of this.textures.values()) job.then(t => t.dispose()).catch(() => {});
    for (const job of this.models.values()) job.then(gltf => this.releaseModel(gltf)).catch(() => {});
    this.textures.clear();this.textureBytes.clear();this.models.clear();this.modelRefs.clear();this.jsonCache.clear();
  }
}