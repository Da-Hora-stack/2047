// Ordem oficial da Rede. A enseada de sal inicial preserva a exploração dos saves 0.3.
export const BIOMES=[
 {id:'ashes',name:'Mar de Cinzas',cores:['core-1'],hint:'Cinzas obstruem os filtros. Contorne a rodovia soterrada.'},
 {id:'cities',name:'Cidades Esqueleto',cores:['core-2','core-3'],hint:'Viadutos interrompidos e túnel alagado. O desvio elevado protege motor e carga.'},
 {id:'salt',name:'Leito Seco',cores:['core-4'],hint:'Sal instável e calor. Água e um radiador reparado valem mais que velocidade.'},
 {id:'glass',name:'Cordilheira Vítrea',cores:['core-5','core-6'],hint:'Rampas, curvas estreitas e rocha lisa. Suba devagar e revise a transmissão.'},
 {id:'storm',name:'Zonas de Tempestade',cores:['core-7'],hint:'Frentes de plasma fecham a passagem central. Use o desvio e prepare os filtros.'},
];
export function biomeAt(z){const d=-z;return d<3200?'ashes':d<5800?'salt':d<10000?'cities':d<12600?'salt':d<17600?'glass':'storm';}
export const CORES=[
 {id:'core-1',number:1,region:'ashes',name:'Núcleo 1 · A primeira faixa',x:24,z:-2890,vault:{x:-36,z:-20,cost:{},task:'A sobrevivente trouxe a Semente do primeiro Cofre.'}},
 {id:'core-2',number:2,region:'cities',name:'Núcleo 2 · Viaduto',x:28,z:-7200,vault:{x:-25,z:-6150,cost:{parts:1},task:'Substituir a manivela do mecanismo · 1 peça no Titã.'}},
 {id:'core-3',number:3,region:'cities',name:'Núcleo 3 · As janelas vazias',x:-30,z:-9500,vault:{x:30,z:-8050,cost:{parts:2},task:'Desobstruir o acesso com uma talha · 2 peças no Titã.'}},
 {id:'core-4',number:4,region:'salt',name:'Núcleo 4 · Mar ausente',x:28,z:-12000,vault:{x:-30,z:-10500,cost:{water:2,parts:1},task:'Resfriar o selo salino · 2 águas + 1 peça no Titã.'}},
 {id:'core-5',number:5,region:'glass',name:'Núcleo 5 · Passo de vidro',x:32,z:-14400,vault:{x:-28,z:-13100,cost:{scrap:4},task:'Pagar ao abrigo pelo acesso ao elevador · 4 materiais no Titã.'}},
 {id:'core-6',number:6,region:'glass',name:'Núcleo 6 · Acima das nuvens',x:-30,z:-16800,vault:{x:28,z:-15300,cost:{parts:3},task:'Reparar a passarela de acesso · 3 peças no Titã.'}},
 {id:'core-7',number:7,region:'storm',name:'Núcleo 7 · Horizonte',x:30,z:-20100,vault:{x:-28,z:-18200,cost:{parts:2,water:2},task:'Isolar o selo · 2 peças + 2 águas. Exige radiador/filtros ≥ 50% e transmissão ≥ 40%.'}},
];
export const ROUTES=[
 {id:'city-viaduct',region:'cities',start:6400,end:6900,at:6650,core:'core-2',kind:'rubble',name:'Viaduto interrompido',detail:'Concreto bloqueia o eixo central. Leste: alça elevada longa; oeste: chão irregular.'},
 {id:'city-tunnel',region:'cities',start:8400,end:9000,at:8700,core:'core-3',kind:'flood',name:'Túnel parcialmente alagado',detail:'Água limita a tração e danifica o motor em velocidade. Leste: desvio seco; oeste: leito irregular.'},
 {id:'salt-crust',region:'salt',start:10900,end:11500,at:11200,core:'core-4',kind:'salt',name:'Crosta de sal',detail:'A crosta a oeste cede sob o peso. O arco a leste tem piso firme e gasta mais diesel.'},
 {id:'glass-pass',region:'glass',start:13600,end:14200,at:13900,core:'core-5',kind:'glass',name:'Passo estreito',detail:'Deslizamento no eixo central. Leste: curva larga; oeste: atalho de rocha lisa.'},
 {id:'glass-ridge',region:'glass',start:15900,end:16500,at:16200,core:'core-6',kind:'glass',name:'Crista partida',detail:'A pista estreita cruza rampas. Use a curva longa a leste para reduzir a inclinação efetiva.'},
 {id:'storm-front',region:'storm',start:18700,end:19500,at:19100,core:'core-7',kind:'storm',name:'Frente residual',detail:'Rajadas e fragmentos fecham o eixo durante a frente. O desvio leste permanece acessível.'},
];
export const SHELTERS=[
 {id:'lia',name:'Abrigo do Viaduto',npc:'Lia',x:-32,z:-6000,quest:'supply',line:'A caixa-d’água rachou. Duas águas e uma ração ajudam quem ainda está aqui. Em troca, tenho peças e materiais.',after:'A água chegou a tempo. Vou levar a notícia da Aurora ao último abrigo.'},
 {id:'afonso',name:'Bomba do Leito',npc:'Afonso',x:32,z:-10200,quest:'pump',line:'A bomba perdeu o eixo. Três peças devolvem água e drenam a crosta junto à passagem.',after:'A bomba está firme. A travessia do sal está menos traiçoeira.'},
 {id:'noemia',name:'Oficina da Cordilheira',npc:'Noêmia',x:-32,z:-12800,quest:'relay',line:'Se o transmissor voltar, quem sobe recebe o aviso antes da frente. Preciso de duas peças e dois materiais no Titã.',after:'O repetidor voltou. Há um sinal estranho entre os avisos de vento.'},
 {id:'joel',name:'Última Parada',npc:'Joel',x:32,z:-17800,line:'A frente segue um ciclo. Prepare filtros e radiador, escute o rádio e contorne os fragmentos pelo leste.',after:'O campo está estável. O continente voltou a responder.'},
];
export const SIDE_MISSIONS=[
 {id:'supply',name:'Água para as janelas',shelter:'lia',bag:'player',cost:{water:2,food:1},reward:{parts:3,scrap:5},detail:'Entregue 2 águas e 1 comida da mochila a Lia. Recompensa: 3 peças + 5 materiais. Lia reaparece na Última Parada.'},
 {id:'pump',name:'O que o sal guardou',shelter:'afonso',bag:'truck',cost:{parts:3},reward:{water:6,scrap:4},detail:'Repare a bomba com 3 peças do Titã. Recompensa: 6 águas + 4 materiais; a crosta instável ganha aderência.'},
 {id:'relay',name:'Um aviso antes do vento',shelter:'noemia',bag:'truck',cost:{parts:2,scrap:2},reward:{diesel:8,food:3},detail:'Repare o repetidor com 2 peças + 2 materiais do Titã. Recompensa: 8 L de diesel + 3 comidas e um fragmento do sinal.'},
];
export const SUPPLY_CACHES=CORES.slice(1).map(c=>({id:`cache-${c.number}`,name:`Depósito de viagem ${c.number}`,x:c.vault.x+13,z:c.vault.z+18,loot:{diesel:12,parts:4,scrap:6,water:2,food:2}}));
export const NETWORK_POINTS=[{id:'vault-1',name:'Cofre 1',x:CORES[0].vault.x,z:CORES[0].vault.z,kind:'vault',core:'core-1'},...CORES.slice(1).flatMap(c=>[{...c,kind:'network-core',core:c.id},{id:`vault-${c.number}`,name:`Cofre ${c.number}`,x:c.vault.x,z:c.vault.z,kind:'vault',core:c.id}]),...SHELTERS.map(s=>({...s,kind:'shelter'})),...SUPPLY_CACHES.map(s=>({...s,kind:'cache'}))];
export const WORLD_COPY={
 vault:'Cofre de Semente',firstVault:'A sobrevivente já retirou a primeira Semente deste Cofre. Fale com ela no Abrigo 07 para assumir a viagem.',sideMissions:'Missões secundárias',buy:'Comprar',inTruck:'no Titã',interference:'Interferência no rádio',openVault:'Liberar e embarcar Semente',vaultOpened:'Cofre aberto · Semente já retirada',vaultLocked:'Aguarde a ancoragem do Núcleo anterior.',parkVault:'Estacione o Titã a até 35 m do Cofre, desligue o motor e interaja a pé. Os custos saem do compartimento.',
 currentSeed:'Semente a bordo',noCargo:'Localize o Cofre indicado no mapa. Cada entrega depende da anterior.',allAnchored:'Sete campos ancorados',allDetail:'A Rede responde pelo continente. Os desfechos e as últimas decisões chegam na Fase 5.',
 accept:'Aceitar missão',defer:'Deixar para depois',complete:'Entregar e concluir',completed:'Missão concluída',missions:'Caderno de missões',reappeared:'Lia chegou à Última Parada com a notícia da primeira chuva.',
 trade:'Suprimentos do abrigo',stock:'Estoque local',rest:'Descansar · 1 comida + 1 água',collect:'Recolher depósito',collected:'Depósito recolhido',
 error:'Confira a sequência, proximidade do Titã, motor desligado, recursos e espaço no inventário.',
 route:'Rotas do continente',safe:'Desvio pavimentado a leste',short:'Atalho irregular a oeste',weather:'Boletim da estrada',front:'Frente residual · use o desvio leste',quiet:'Janela de calmaria · revise o caminhão antes de avançar',
 states:{inactive:'Aguardando Semente',failed:'Falhou · pode recalibrar',active:'Ancorado'},quests:{available:'Disponível',accepted:'Em andamento',completed:'Concluída'},
 radio:{cities:'Dra. Renata Final Boss: os dois ressonadores urbanos usam âncoras separadas. Contorne os viadutos e evite entrar rápido na água.',salt:'Dra. Renata Final Boss: o quarto Cofre está selado pelo sal. Guarde água para o mecanismo e para o radiador.',glass:'Dra. Renata Final Boss: cada faixa da montanha precisa da anterior. A rocha lisa não perdoa uma frenagem brusca.',storm:'Dra. Renata Final Boss: há fragmentos na passagem central durante a frente. O arco leste mantém um caminho. Filtros e radiador precisam estar prontos.',voice:'A Voz: …quando o vento cair, continue pela borda. Ainda há estrada à sua frente.',relay:'Noêmia: repetidor funcionando. Recebi seu sinal, Dante. Os outros abrigos também vão ouvir.',end:'Dra. Renata Final Boss: sete campos em fase. Estão respondendo além do continente. O céu está mudando, Dante.'},
};
