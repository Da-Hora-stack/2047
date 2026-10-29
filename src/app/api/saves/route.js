import { withIdentity,readBody,assertSave,error } from '../../../lib/api.js';
import { listSaves,createSave } from '../../../lib/repository.js';
export const runtime='nodejs';
export const GET=withIdentity(async(req,ctx,player)=>Response.json({saves:(await listSaves(player)).map(({data,...entry})=>({...entry,stage:data.campaign.stage,restored:data.campaign.restoration.ashes}))}));
export const POST=withIdentity(async(req,ctx,player)=>{const {slot,data}=await readBody(req);assertSave(slot,data);const save=await createSave(player,slot,data);return save?Response.json(save,{status:201}):error(409,'VERSION_CONFLICT');});
