export const POIS=[
 {id:'depot',name:'Oficina abandonada',x:-38,z:-1650,kind:'loot',loot:{parts:3,water:2,scrap:3},description:'Há ferramentas sob a bancada. Entre pela abertura voltada à estrada.'},
 {id:'ivani',name:'Posto de Mãe Ivani',x:-28,z:-3480,kind:'trade',description:'A dona da parada vende suprimentos e oferece descanso. Tudo tem um custo.'},
 {id:'station',name:'Estação meteorológica',x:42,z:-5100,kind:'loot',loot:{diesel:4,water:3,food:2,scrap:4},description:'O reservatório da estação está intacto. Procure o caixote no interior.'},
];
export const OFFERS={diesel:{quantity:4,cost:3,stock:12},water:{quantity:2,cost:1,stock:10},food:{quantity:2,cost:2,stock:8},parts:{quantity:2,cost:3,stock:8}};
export const EXPEDITION={
 title:'Expedição · sobrevivência',hydration:'Hidratação',food:'Saciedade',fatigue:'Fadiga',drink:'Beber 1 L de água · +30%',eat:'Comer 1 ração · +35%',
 rest:'Descansar · 1 comida + 1 água',restEffect:'Um descanso curto reduz a fadiga e recupera hidratação/saciedade.',trade:'Trocas com Mãe Ivani',
 buy:'Comprar',sell:'Trocar 2 peças por 2 materiais',currency:'Materiais recuperados',stock:'Estoque',ivani:'Mãe Ivani',
 ivaniBeforeLine:'Quem chega nesta parada encontra água, diesel e um lugar para respirar. Nada vem de graça, Dante. Prepare o caminhão antes de seguir. O preço está aí.',
 ivaniLine:'Você trouxe o primeiro sinal de volta. Eu não posso viver de esperança, Dante. Mas quem chega nesta parada encontra água, diesel e um lugar para respirar. O preço está aí.',
 collect:'Recolher suprimentos',collected:'Suprimentos já recolhidos',lootNote:'A coleta vai para a mochila. Abra Tab ao lado do caminhão para transferir. Espaço limitado: libere peso se necessário.',
 shelter:'Posto e abrigo',salt:'LEITO SECO',ashes:'MAR DE CINZAS',saltDetail:'O fundo do oceano virou sal. Reduza a carga do motor e cuide do radiador.',
 recognized:'Reconheça o Leito Seco',recognizedDetail:'A primeira ancoragem está segura. Siga ao sul, visite o posto de Mãe Ivani e explore a estação. Siga o objetivo do HUD para localizar os próximos Cofres.',
 warning:'Água ou comida em baixa. Reponha antes de continuar.',critical:'Reservas corporais esgotadas. A perda de vigor é gradual; comer e beber recupera a viagem.',
 heat:'Calor do Leito Seco · radiador sob pressão',heatWarning:'Temperatura alta. Pare com o motor desligado, use água e repare o radiador.',
 noRoom:'A mochila está cheia ou faltam recursos. Transfira carga para o Titã e confira o custo.',
 noTravel:'Água e comida diminuem devagar, somente durante a viagem. Nenhuma queda ocorre em menus ou enquanto você está parado.',
 help:'H · Expedição',poi:'Pontos de interesse',inspect:'Explorar ponto de interesse',capacity:'Capacidade da mochila',journey:'Reconhecimento opcional',
};
