import { MISSIONS } from '../../../../data/campaign.js';
export function GET(){return Response.json({missions:MISSIONS});}
