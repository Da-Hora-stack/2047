import RAPIER from '@dimforge/rapier3d-compat';
let ready;
// React StrictMode pode montar duas vezes; a memória WASM deve ser inicializada uma só vez.
export function initializePhysics(){if(!ready)ready=RAPIER.init();return ready;}
