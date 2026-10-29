import { BIOMES,CORES,SIDE_MISSIONS } from './network.js';
export const COMPONENTS = { engine:'Motor', radiator:'Radiador', tires:'Pneus', suspension:'Suspensão', transmission:'Transmissão', tank:'Tanque', filters:'Filtros', frame:'Estrutura' };
export const ITEMS = {
  diesel:{name:'Diesel',icon:'fuel',weight:.8,description:'Combustível para o Titã. Transfira ao caminhão antes de abastecer.'},
  water:{name:'Água',icon:'thermo',weight:1,description:'Água limpa para o radiador. Recupera sua condição em campo.'},
  food:{name:'Comida',icon:'aurora',weight:.4,description:'Reserva de viagem. Refeições mantêm a saciedade durante a viagem.'},
  parts:{name:'Peças mecânicas',icon:'gear',weight:1.2,description:'Reparos emergenciais e calibração da Semente.'},
  scrap:{name:'Materiais recuperados',icon:'engine',weight:.6,description:'Escambo por consertos completos no abrigo.'},
};
export const REGIONS = BIOMES;
export const MISSIONS=[...CORES.map(k=>({id:`aurora-${k.number}`,name:k.name,region:k.region,core:k.id,seed:`seed-${k.number}`,steps:['vault','transport','delivered','activated']})),...SIDE_MISSIONS];
export const POINTS={shelter:{x:-19,z:5},core:{x:24,z:-2890},salvage:{x:-28,z:-1650},delivery:{x:7,z:-2880}};
export const COPY = {
  phases:{shelter:'Fale com a sobrevivente no abrigo',transport:'Leve a Semente ao Núcleo 1',failed:'Calibre a Semente e tente novamente',activated:'A primeira chuva voltou'},
  details:{shelter:'Pare, desça com F e procure a sobrevivente sob o toldo.',transport:'Prepare o Titã. A rodovia está soterrada no km 1,1. M abre as duas rotas.',failed:'A matriz não ancorou. Use peças para calibrar antes de outra tentativa.',activated:'A atmosfera começou a se recuperar. Seu checkpoint foi salvo; você pode voltar pela estrada liberada.'},
  survivor:'Sobrevivente', dante:'Dante Rocha Negra',renata:'Dra. Renata Final Boss',
  introduction:'Eu tirei isto do primeiro Cofre. É uma Semente de Ignição. Os ressonadores subterrâneos sobreviveram. A engenheira no rádio disse que o seu caminhão ainda pode chegar ao primeiro.',
  danteLine:'Eu só conheço a estrada. Mas o Titã ainda anda. Vamos ver até onde.',
  receive:'Aceitar a Semente e assumir a viagem',decline:'Ainda preciso me preparar',
  radioFirst:'Dante, aqui é a Dra. Renata Final Boss. O cristal perde alinhamento com choques. Vá com calma. O Núcleo está no fim da rodovia. Repare a suspensão, cuide do radiador e abasteça antes de sair.',
  radioStorm:'Tempestade à frente. A poeira vai obstruir os filtros. Há uma estrada soterrada: o desvio pavimentado é longo, mas protege a carga. O atalho a oeste é irregular.',
  radioRestored:'O primeiro campo ancorou. Está ouvindo, Dante? Chuva. A sequência começou. Os outros Núcleos dependem deste sinal.',
  radioFailed:'A matriz não ancorou. Ainda há cristal no cilindro. Calibre o retículo com peças e tente outra vez. Não precisamos abandonar esta faixa de céu.',
  radioTitle:'Rádio de ondas curtas',frequency:'7.047 MHz · canal Aurora',noRadio:'O canal está em silêncio. A viagem ainda não começou.',
  inventory:'Inventário',maintenance:'Inspeção do Titã',map:'Mapa da viagem',save:'Salvar partida',load:'Carregar partida',back:'Voltar',
  playerBag:'Dante · mochila',truckBag:'Titã · compartimento',transfer:'Transferir',refuel:'Abastecer 4 L',coolant:'Usar 1 L de água no radiador',
  repair:'Reparo de campo · 2 peças / +25%',fullRepair:'Conserto no abrigo · 3 peças + 2 materiais',
  mechanism:'Núcleo 1 · ressonador atmosférico',calibrate:'Calibrar · 2 peças / +20%',activate:'Iniciar ativação',chance:'Chance de ancoragem',integrity:'Integridade da Semente',
  safe:'Desvio seguro',short:'Atalho perigoso',planSafe:'Planejar desvio seguro',planShort:'Planejar atalho',
  safeDescription:'A leste: 1,4 km de asfalto em torno da barreira. Mais diesel, menos vibração.',shortDescription:'A oeste: cerca de 1,1 km em terreno irregular. Menos diesel, maiores choques na carga.',
  saveTitle:'Caderno de viagem',saveSlot:'Salvar neste slot',loadSlot:'Carregar este slot',deleteSlot:'Apagar este slot',empty:'Slot vazio',
  saveOk:'Partida salva no servidor.',loadOk:'Partida recuperada.',saveError:'Não foi possível salvar. Seu progresso continua nesta sessão. Tente novamente.',
  actionError:'Ação indisponível. Confira proximidade, recursos e estado da missão.',partsNeeded:'Faltam recursos no compartimento do Titã.',
  park:'Estacione o Titã na área marcada, a menos de 15 m do Núcleo, e desligue o motor.',
  exitBlocked:'A saída está obstruída. Reposicione o Titã e tente descer novamente.',walkRange:'A pé: explore perto do Titã (24 m), abrigos e estruturas. F entra no caminhão.',footBoundary:'Limite de exploração neste trecho. Volte ao Titã ou aproxime o caminhão da estrutura.',exit:'Descer do caminhão',enter:'Entrar no Titã',talk:'Conversar com a sobrevivente',inspect:'Inspecionar o Titã',collect:'Recuperar suprimentos',operate:'Operar o Núcleo',
  walkHint:'WASD mover · Shift correr · Espaço pular · clique para olhar · F interagir',
  seedRisk:'Carga em risco: reduza a velocidade e evite choques.',storm:'Tempestade de cinzas · filtros sob desgaste',restored:'MAR DE CINZAS · RESTAURAÇÃO INICIADA',
  noFoot:'Estacione próximo a um abrigo, Núcleo ou ponto de interesse para explorar a pé.',stop:'Segure Espaço até parar o Titã. Depois pressione F para descer.',noSeed:'Primeiro receba a Semente no abrigo.',
  recovery:'Resgate do Titã: -2 L de diesel e -8% de integridade. Recursos gastos não são devolvidos.',
};
