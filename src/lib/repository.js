// Único módulo que importa o driver libSQL.
import { createClient } from '@libsql/client';
let client,ready;
const schema=`CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY,applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS saves(player_id TEXT NOT NULL,slot TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,schema_version INTEGER NOT NULL DEFAULT 1,payload TEXT NOT NULL CHECK(json_valid(payload)),updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(player_id,slot));
INSERT OR IGNORE INTO schema_migrations(version) VALUES(1);`;
function getClient(){if(!client){const url=process.env.TURSO_DATABASE_URL||'file:local.db';if(process.env.NODE_ENV==='production'&&!/^(libsql|https):\/\//.test(url))throw new Error('Turso não configurado');client=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN});}return client;}
async function database(){const db=getClient();if(!ready)ready=db.executeMultiple(schema).catch(e=>{ready=undefined;throw e;});await ready;return db;}
export async function migrate(sql){await getClient().executeMultiple(sql);}
export async function checkDatabase(){const db=await database();const r=await db.execute('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1');return Number(r.rows[0]?.version||0);}
const decode=row=>row?{slot:row.slot,version:Number(row.version),updatedAt:row.updated_at,data:JSON.parse(row.payload)}:null;
export async function listSaves(player){const db=await database();const r=await db.execute({sql:'SELECT slot,version,updated_at,payload FROM saves WHERE player_id=? ORDER BY slot',args:[player]});return r.rows.map(decode);}
export async function getSave(player,slot){const db=await database();return decode((await db.execute({sql:'SELECT slot,version,updated_at,payload FROM saves WHERE player_id=? AND slot=?',args:[player,slot]})).rows[0]);}
export async function createSave(player,slot,data){const db=await database();const r=await db.execute({sql:'INSERT OR IGNORE INTO saves(player_id,slot,payload,schema_version) VALUES(?,?,?,?)',args:[player,slot,JSON.stringify(data),data.schemaVersion]});return r.rowsAffected?getSave(player,slot):null;}
export async function updateSave(player,slot,version,data){const db=await database();const r=await db.execute({sql:'UPDATE saves SET payload=?,schema_version=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE player_id=? AND slot=? AND version=?',args:[JSON.stringify(data),data.schemaVersion,player,slot,version]});return r.rowsAffected?getSave(player,slot):null;}
export async function deleteSave(player,slot){const db=await database();return (await db.execute({sql:'DELETE FROM saves WHERE player_id=? AND slot=?',args:[player,slot]})).rowsAffected>0;}
export function closeRepository(){client?.close();client=undefined;ready=undefined;}
