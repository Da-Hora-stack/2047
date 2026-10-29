import { withIdentity,readBody,assertSave,error,InvalidInput } from '../../../../lib/api.js';
import { getSave,updateSave,deleteSave } from '../../../../lib/repository.js';
import { validSlot } from '../../../../game/persistence/schema.js';
export const runtime='nodejs';
async function slotOf(ctx){const {slot}=await ctx.params;if(!validSlot(slot))throw new InvalidInput();return slot;}
export const GET=withIdentity(async(req,ctx,p)=>{const save=await getSave(p,await slotOf(ctx));return save?Response.json(save):error(404,'NOT_FOUND');});
export const PUT=withIdentity(async(req,ctx,p)=>{const slot=await slotOf(ctx),{data,version}=await readBody(req);assertSave(slot,data);if(!Number.isInteger(version)||version<1)throw new InvalidInput();const save=await updateSave(p,slot,version,data);return save?Response.json(save):error(await getSave(p,slot)?409:404,'VERSION_CONFLICT');});
export const DELETE=withIdentity(async(req,ctx,p)=>(await deleteSave(p,await slotOf(ctx)))?Response.json({deleted:true}):error(404,'NOT_FOUND'));
