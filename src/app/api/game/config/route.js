import { CONFIG } from '../../../../data/config.js';
export function GET(){return Response.json(CONFIG,{headers:{'Cache-Control':'public, max-age=3600'}});}
