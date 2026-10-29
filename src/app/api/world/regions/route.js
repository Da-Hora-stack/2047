import { upgradeCampaign } from '../../../../game/missions/network.js';
import { REGIONS } from '../../../../data/campaign.js';
import { getSave } from '../../../../lib/repository.js';
import { withIdentity,InvalidInput } from '../../../../lib/api.js';
import { validSlot } from '../../../../game/persistence/schema.js';
export const GET=withIdentity(async(req,ctx,p)=>{const slot=new URL(req.url).searchParams.get('slot');if(slot&&!validSlot(slot))throw new InvalidInput();const s=slot?await getSave(p,slot):null;const campaign=s?upgradeCampaign(s.data.campaign):null;return Response.json({regions:REGIONS.map(r=>({...r,restored:!!campaign?.restoration[r.id],coreStates:r.cores.map(id=>({id,state:campaign?.cores[id]?.state||'inactive'}))}))});});
