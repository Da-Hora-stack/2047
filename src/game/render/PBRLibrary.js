import * as THREE from 'three';
import { applyTerrainBlend } from './TerrainBlend.js';

export const MATERIAL_ROLES = {
 asphalt: ['road_damaged_2','asphalt_pit_lane','asphalt_02'], shoulder: ['gravel_road'], ground: ['dirt','mud_cracked_dry_03'],
 rock: ['rocky_terrain_03'], rust: ['rusty_metal_05','rust_coarse_01'], roof: ['corrugated_iron'],
 concrete: ['cracked_concrete_02','damaged_concrete_floor_02'], brick: ['broken_brick_wall'],
 garage: ['garage_floor','damaged_concrete_floor_02'], shutter: ['painted_metal_shutter'], container: ['container_side'],
 wood: ['wood_peeling_paint_weathered','worn_planks'], leather: ['brown_leather'],
};

export function validMaterial(entry) {
 return entry?.status === 'installed' && entry.normalConvention === 'OpenGL' && entry.maps?.color && entry.maps.normal && (entry.maps.roughness || entry.maps.arm) &&
 (!entry.maps.arm || entry.armChannels?.r === 'ao' && entry.armChannels?.g === 'roughness' && entry.armChannels?.b === 'metalness');
}

export class PBRLibrary {
 constructor(assets, materials, quality='medio') { this.assets = assets; this.materials = materials; this.loaded = new Map(); this.applied = {}; this.unavailable = []; this.quality=quality;this.queue=Promise.resolve(); }
 async maps(entry) {
 if (!validMaterial(entry)) throw new Error(`Material incompleto/incompatível: ${entry?.id}`);
 if (!this.loaded.has(entry.id)) this.loaded.set(entry.id, (async () => {
 const tile = entry.tileMeters?.length === 2 && entry.tileMeters.every(n => Number.isFinite(n) && n > 0) ? entry.tileMeters : [2,2];
 const maps = {};
 for (const [kind, file] of Object.entries(entry.maps)) {
 if (kind === 'displacement') continue; // Height stays in preparation until visual + physical mesh use it together.
 maps[kind] = await this.assets.texture(file.variants?.[this.quality]?.url || file.url, { color: kind === 'color', tileMeters: tile });
 }
 return { ...maps, tileMeters: tile };
 })());
 return this.loaded.get(entry.id);
 }
 async load() {
 const manifest = await this.assets.json('/assets/polyhaven/manifest.json'); this.manifest = manifest;
 const definitions = manifest.assets || {};
 // Only the first region's roles load. The other catalog entries stay on disk.
 await Promise.all(Object.entries(MATERIAL_ROLES).map(async ([role, choices]) => {
 const entry = choices.map(id => definitions[id]).find(validMaterial);
 if (!entry) { this.unavailable.push(role); return; }
 try {
 const maps = await this.maps(entry), m = this.materials[role];
 if (!m || this.assets.disposed) return;
 const previous = m.map;
 m.map = maps.color; m.normalMap = maps.normal; m.roughnessMap = maps.arm || maps.roughness;
 m.aoMap = maps.arm || maps.ao || null; m.metalnessMap = maps.arm || maps.metalness || null;
 m.color.set('#ffffff'); m.roughness = 1; m.metalness = m.metalnessMap ? 1 : ['rust','roof','shutter','container'].includes(role) ? .12 : 0;
 m.normalScale = new THREE.Vector2(.65,.65); m.aoMapIntensity = .65; m.flatShading = false;
 m.userData.polyhaven = entry.id; m.userData.metricUV = true; m.needsUpdate = true;
 if (previous && !previous.userData.assetManaged) previous.dispose(); this.applied[role] = entry.id;
 } catch (error) { this.assets.errors.push(`${role}: ${error.message}`); }
 }));
 if (this.applied.ground && this.applied.rock && this.applied.shoulder && validMaterial(definitions.mud_cracked_dry_03)) {
 try {
 const cracked = await this.maps(definitions.mud_cracked_dry_03);
 applyTerrainBlend(this.materials.ground, { rock: await this.maps(definitions[this.applied.rock]), gravel: await this.maps(definitions[this.applied.shoulder]), cracked }); this.blended = true;
 } catch (error) { this.assets.errors.push(`terrain blend: ${error.message}`); }
 }
 return this;
 }
 setQuality(quality) {
 this.queue=this.queue.then(async()=>{if(this.assets.disposed||this.quality===quality)return;this.quality=quality;this.loaded.clear();this.unavailable=[];await this.load();const keep=new Set();for(const job of this.loaded.values())for(const value of Object.values(await job.catch(()=>({}))))if(value?.isTexture)keep.add(value);this.assets.pruneTextures(keep);});
 return this.queue;
 }
 snapshot() { return { applied: { ...this.applied }, unavailable: [...this.unavailable].sort(), terrainBlend: !!this.blended, installed: Object.keys(this.manifest?.assets || {}).length }; }
}