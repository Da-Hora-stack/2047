// Estrada viva (0.4.1): o técnico e o gerador do Núcleo 1, postos de combustível, oficinas e emboscadas de saqueadores.
// Tudo aqui é dado puro. As regras ficam em src/game/missions/road.js e as formas 3D em src/game/world/RoadWorld.js.

// Gerador que alimenta o ressonador do Núcleo 1. Sem ele ligado, a ativação não começa.
export const GENERATOR={id:'core1-gen',x:41,z:-2888,cost:{diesel:4,parts:1},reward:{parts:2,scrap:4,water:2}};

export const LITERS_PER_SCRAP=5;           // 1 material recuperado paga 5 L de diesel no posto
export const PUMP_RANGE=26;                // o Titã precisa estar a até 26 m da bomba
export const WORKSHOP_RANGE=26;            // e a até 26 m da oficina para receber serviço

export const GAS_OFFERS=[
 {id:'tank-20',kind:'tank',liters:20,label:'Abastecer o Titã · 20 L'},
 {id:'tank-full',kind:'tank',liters:180,label:'Encher o tanque do Titã'},
 {id:'can-10',kind:'can',liters:10,label:'Galão de diesel · 10 L (mochila)'},
 {id:'water-2',kind:'water',quantity:2,cost:1,label:'Água · 2 L (mochila)'},
];
export const WORKSHOP_OFFERS=[{id:'parts-2',item:'parts',quantity:2,cost:4,label:'Peças mecânicas × 2'}];
export const WORKSHOP_SERVICES=[
 {id:'tune',gain:30,cost:3,label:'Ajuste rápido · +30%'},
 {id:'overhaul',gain:100,cost:7,label:'Revisão completa · 100%'},
];
export const WORKSHOP_SELL={parts:2,scrap:2}; // a oficina compra 2 peças por 2 materiais

// Posição local (lx para a estrada, lz lateral) de quem atende, por tipo de ponto. `face` aponta o lado da estrada.
const NPC_LOCAL={gas:[-1,.5],workshop:[1.5,-2]};
const PUMP_LOCAL=[3,0];
const at=(p,[lx,lz])=>({x:p.x+p.face*lx,z:p.z+p.face*lz});

const tech={id:'core1-tech',kind:'tech',name:'Núcleo 1 · Gerador',npc:'Tomás',title:'Técnico do Núcleo 1',x:36.5,z:-2884,face:-1,
 talk:{x:36.5,z:-2884}};

const place=(id,kind,name,npc,x,z,face,line,stock)=>{const p={id,kind,name,npc,x,z,face,line,stock};p.talk=at(p,NPC_LOCAL[kind]);if(kind==='gas')p.pump=at(p,PUMP_LOCAL);return p;};

export const ROAD_POINTS=[
 tech,
 place('oficina-cotovelo','workshop','Oficina do Cotovelo','Dona Marta',-4.9,-550,1,'Ferramenta boa não enferruja, só espera. Traga materiais, que eu cuido do Titã e vendo as peças que sobraram.',{parts:10}),
 place('posto-boa-viagem','gas','Posto Boa Viagem','Zeca',-47.7,-2250,1,'A bomba ainda puxa. Eu cobro em materiais, que diesel não nasce no chão. Abasteça antes de subir ao Núcleo.',{diesel:90,water:12}),
 place('posto-mare-seca','gas','Posto Maré Seca','Lurdes',10.5,-4450,-1,'Aqui era o fundo do mar. Hoje é sal e diesel. O tanque do Titã é grande, então não economize na bomba.',{diesel:90,water:12}),
 place('oficina-sal','workshop','Oficina do Sal','Seu Gil',1.2,-5650,1,'O sal come o radiador. Já vi caminhão chegar fervendo. Faço ajuste e revisão, tudo contado em materiais.',{parts:10}),
 place('posto-viaduto-velho','gas','Posto Viaduto Velho','Cacá',-45.6,-7500,1,'Depois do viaduto o asfalto piora. Encha o tanque aqui e leve água para a travessia.',{diesel:90,water:12}),
 place('oficina-janelas','workshop','Oficina das Janelas','Rute',-39.9,-9800,1,'Nas cidades vazias sobra peça. O que falta é gente para montar. Eu monto.',{parts:10}),
 place('posto-fronteira-do-sal','gas','Posto Fronteira do Sal','Nando',-36.6,-12450,1,'Última bomba antes da serra. A subida bebe diesel como se fosse água.',{diesel:90,water:12}),
 place('oficina-passo','workshop','Oficina do Passo','Baiano',40.5,-14950,-1,'A montanha estraçalha transmissão. Se o Titã estiver gemendo, deixe comigo.',{parts:10}),
 place('posto-ultima-gota','gas','Posto Última Gota','Tica',-41.2,-17125,1,'Se você chegou até aqui, merece diesel. Se não tiver material, ainda me deve uma história.',{diesel:90,water:12}),
 place('oficina-horizonte','workshop','Oficina do Horizonte','Valéria',63.8,-20400,-1,'Perto do último Núcleo, tudo que quebra custa caro. Revise o Titã antes da frente.',{parts:10}),
];

// Emboscadas de saqueadores. `giveUp` é a distância (m) que eles perseguem antes de desistir.
// `steal` é a fração do compartimento do Titã que levam se conseguirem se agarrar; `reward` são materiais por saqueador abalroado.
export const AMBUSHES=[
 {id:'amb-1',km:1.95,bandits:2,speed:17.5,giveUp:550,steal:.3,reward:2},
 {id:'amb-2',km:4.0,bandits:2,speed:18,giveUp:600,steal:.33,reward:2},
 {id:'amb-3',km:7.75,bandits:3,speed:19,giveUp:650,steal:.36,reward:2},
 {id:'amb-4',km:10.75,bandits:3,speed:19.5,giveUp:700,steal:.4,reward:3},
 {id:'amb-5',km:13.4,bandits:3,speed:20.5,giveUp:780,steal:.44,reward:3},
 {id:'amb-6',km:15.6,bandits:4,speed:21.5,giveUp:850,steal:.5,reward:3},
 {id:'amb-7',km:17.5,bandits:4,speed:22.5,giveUp:900,steal:.55,reward:4},
].map(a=>({...a,z:-a.km*1000}));
export const AMBUSH_RULES={spawnRadius:260,triggerRadius:85,despawnRadius:520,graceSeconds:3.4,outrunDistance:240,outrunSeconds:4,ramMinSpeed:9,ramImpact:5};

export const ROAD_COPY={
 title:{tech:'Tomás · Técnico do Núcleo 1',gas:'Posto de combustível',workshop:'Oficina mecânica'},
 talk:'Falar com',
 // Núcleo 1
 techNoSeed:'Você é o motorista do Titã? Sem uma Semente o ressonador é só ferro e silêncio. A sobrevivente do Abrigo 07 tem a primeira. Volte quando ela estiver com você.',
 techNeedGen:'Dante? A Dra. Renata avisou que alguém viria. O ressonador acorda com a Semente, mas precisa de energia para empurrar a umidade até o céu. O gerador está seco: preciso de 4 L de diesel e uma peça para a partida. Se faltar diesel, o Posto Boa Viagem fica no km 2,25, logo atrás de você.',
 techGenOn:'Está respirando, ouviu? Agora vá ao terminal do Núcleo, ali do lado. Calibre a Semente se estiver abaixo de 100% e inicie a ativação. Quando a chuva vier, segure o chapéu.',
 techFailed:'A matriz falhou, mas o gerador aguentou. Calibre a Semente com peças e tente de novo. A chuva ainda está aí em cima, esperando.',
 techActive:'Olha isso. Chuva de verdade. Faz vinte anos que eu não via uma gota. Guardei este pacote para quem chegasse até aqui.',
 techAfter:'Os outros Núcleos dependem de você, Dante. Há postos e oficinas ao longo da estrada. E cuidado com os saqueadores: eles desistem se você correr.',
 techLowFuel:'Falta diesel ou peça. O Posto Boa Viagem (km 2,25) fica atrás de você. A mochila e o compartimento do Titã contam.',
 generatorCost:'Ligar o gerador · 4 L de diesel + 1 peça',
 generatorOn:'Gerador ligado',
 generatorStatus:'Gerador do Núcleo',
 on:'ligado',off:'desligado',
 claim:'Receber o pacote de Tomás',claimed:'Pacote já recebido',
 claimDetail:'2 peças · 4 materiais · 2 águas',
 needGenerator:'O gerador do Núcleo está desligado. Fale com Tomás e ligue-o antes de iniciar a ativação.',
 noSeedGenerator:'Receba a Semente no Abrigo 07 antes de ligar o gerador.',
 payNote:'O custo sai da mochila e, se faltar, do compartimento do Titã.',
 // Posto
 gasLine:'Preço do posto: 1 material recuperado para cada 5 L de diesel.',
 pumpNote:'Estacione o Titã a até 26 m da bomba e desligue o motor para abastecer o tanque.',
 stock:'Estoque',scrap:'Materiais recuperados',tank:'Tanque do Titã',
 buy:'Comprar',
 sold:'Esgotado',
 // Oficina
 shopNote:'Estacione o Titã a até 26 m da oficina e desligue o motor para receber serviço.',
 buyParts:'Peças à venda',services:'Serviços no Titã',sellParts:'Vender 2 peças · +2 materiais',
 serviceFor:'em',
 // Geral
 error:'Não foi possível concluir. Confira materiais, espaço na mochila, estoque e a posição do Titã.',
 visitedTitle:'Pontos da estrada',
 // Saqueadores
 waiting:'Saqueadores à frente. Acelere ou desvie.',
 chase:'Saqueadores na sua cola!',
 chaseHint:'Acelere para despistá-los ou vire contra eles em velocidade para abalroar.',
 giveUpIn:'Desistem em',
 grab:'Agarrando o Titã',
 gaveUp:'Os saqueadores desistiram da perseguição.',
 outran:'Você despistou os saqueadores.',
 rammed:'Saqueador abalroado! Materiais recuperados.',
 cleared:'Todos os saqueadores foram expulsos da estrada.',
 robbed:'Saqueadores levaram do compartimento:',
 robbedNothing:'Saqueadores se agarraram ao Titã, mas não havia nada no compartimento.',
 journal:'Estrada viva',
};
export const ITEM_LABEL={diesel:'diesel',water:'água',food:'comida',parts:'peças',scrap:'materiais'};