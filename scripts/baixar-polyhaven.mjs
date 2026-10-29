import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public', 'assets', 'polyhaven');
const API = 'https://api.polyhaven.com';
const APP_ID = '2047-rede-aurora';

const args = process.argv.slice(2);
let resolution = '2k';
let ids = [];
let all = false;
let refresh = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--resolution' && args[i + 1]) resolution = args[++i];
  else if (args[i] === '--ids' && args[i + 1]) ids = args[++i].split(',').map(s => s.trim());
  else if (args[i] === '--all') all = true;
  else if (args[i] === '--refresh') refresh = true;
}

const PRIORITY = ['road_damaged_2', 'gravel_road', 'mud_cracked_dry_03', 'dirt', 'rocky_terrain_03', 'rusty_metal_05', 'rust_coarse_01', 'corrugated_iron'];
const COMPLEMENTARY = ['asphalt_02', 'asphalt_pit_lane', 'cracked_concrete_02', 'damaged_concrete_floor_02', 'broken_brick_wall', 'rebar_reinforced_concrete', 'painted_metal_shutter', 'container_side', 'garage_floor', 'wood_peeling_paint_weathered', 'worn_planks', 'brown_leather', 'withered_grass', 'sparse_grass', 'leafy_grass', 'sand_01'];

if (!ids.length && !all) ids = PRIORITY;
if (all) ids = [...PRIORITY, ...COMPLEMENTARY];

const MAP_TYPES = ['Diffuse', 'nor_gl', 'Rough', 'AO', 'arm', 'Displacement'];
const MAP_ALIASES = { Diffuse: 'diff', nor_gl: 'nor_gl', Rough: 'rough', AO: 'ao', arm: 'arm', Displacement: 'disp' };

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': APP_ID } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': APP_ID } });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return buf.length;
}

async function processMaterial(id) {
  const dir = join(OUT, id);
  const instalacaoPath = join(dir, 'instalacao.json');

  let existing = null;
  try { existing = JSON.parse(await readFile(instalacaoPath, 'utf8')); } catch {}
  if (existing && existing.resolution === resolution && !refresh) {
    console.log(`  [skip] ${id} — already installed at ${resolution}`);
    return existing;
  }

  console.log(`  [info] ${id} — fetching metadata...`);
  let info;
  try { info = await fetchJSON(`${API}/info/${id}`); } catch (e) {
    console.error(`  [fail] ${id} — info: ${e.message}`);
    return null;
  }

  let files;
  try { files = await fetchJSON(`${API}/files/${id}`); } catch (e) {
    console.error(`  [fail] ${id} — files: ${e.message}`);
    return null;
  }

  const maps = {};
  const errors = [];

  for (const apiKey of MAP_TYPES) {
    const alias = MAP_ALIASES[apiKey] || apiKey;
    const fileEntry = files[apiKey]?.[resolution];
    if (!fileEntry) continue;

    const ext = fileEntry.png ? 'png' : fileEntry.jpg ? 'jpg' : null;
    if (!ext) continue;

    const url = fileEntry.png?.url || fileEntry.jpg?.url;
    if (!url) continue;

    const filename = `${id}_${alias}_${resolution}.${ext}`;
    const dest = join(dir, filename);

    try {
      const size = await downloadFile(url, dest);
      maps[alias] = { file: filename, size, url };
      console.log(`  [ok]   ${id}/${filename} (${(size / 1024).toFixed(0)} KB)`);
    } catch (e) {
      errors.push(`${alias}: ${e.message}`);
      console.error(`  [fail] ${id}/${filename}: ${e.message}`);
    }
  }

  const result = {
    id,
    resolution,
    category: info.categories?.[0] || 'unknown',
    dimensions: info.dimensions || null,
    maps,
    errors,
    downloadedAt: new Date().toISOString(),
  };

  await writeFile(instalacaoPath, JSON.stringify(result, null, 2));
  return result;
}

async function main() {
  console.log(`Poly Haven downloader — ${ids.length} materials at ${resolution}`);
  console.log(`Output: ${OUT}\n`);

  await mkdir(OUT, { recursive: true });

  const results = [];
  for (const id of ids) {
    const r = await processMaterial(id);
    if (r) results.push(r);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    resolution,
    materials: Object.fromEntries(results.map(r => [r.id, {
      category: r.category,
      dimensions: r.dimensions,
      maps: Object.fromEntries(Object.entries(r.maps).map(([k, v]) => [k, v.file])),
    }])),
  };

  const manifestPath = join(OUT, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  const instalacao = {
    generatedAt: new Date().toISOString(),
    resolution,
    total: ids.length,
    installed: results.length,
    failed: ids.length - results.length,
    materials: results.map(r => ({ id: r.id, maps: Object.keys(r.maps).length, errors: r.errors.length })),
  };

  const instalacaoPath = join(OUT, 'instalacao.json');
  await writeFile(instalacaoPath, JSON.stringify(instalacao, null, 2));

  console.log(`\nDone: ${results.length}/${ids.length} installed. Manifest: ${manifestPath}`);
  if (instalacao.failed > 0) console.log(`Failed: ${ids.filter(id => !results.find(r => r.id === id)).join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });