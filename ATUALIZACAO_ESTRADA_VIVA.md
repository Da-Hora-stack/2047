# Estrada Viva — integrada à main 0.5.0

Os sistemas abaixo já estão incorporados neste projeto completo; não é necessário copiar arquivos manualmente. A simulação de direção, câmeras, instrumentos e câmbio da main 0.5.0 foi mantida. Nenhuma dependência nova foi adicionada. Rode `npm install` e `npm run dev`.

## O que mudou

### Km 3 (Núcleo 1): Tomás e o gerador
- **Tomás**, técnico de capacete laranja, fica ao lado do gerador, a leste do Núcleo 1. Aproxime-se a pé e use **F**.
- O ressonador agora precisa de energia: fale com Tomás e use **"Ligar o gerador · 4 L de diesel + 1 peça"**. O custo sai da mochila e, se faltar, do compartimento do Titã (se o caminhão estiver a até 40 m).
- Com o gerador ligado (lâmpada acesa, ventoinha girando, fumaça), vá ao terminal do Núcleo, calibre se quiser e use **Iniciar ativação**. Sem gerador, o botão fica desabilitado e o painel explica por quê.
- Depois da chuva, Tomás entrega um pacote único (2 peças, 4 materiais, 2 águas).
- Saves em que o Núcleo 1 já está ancorado recebem o gerador ligado automaticamente.

### Postos de combustível (5)
km 2,25 · 4,45 · 7,5 · 12,45 · 17,1. Cada um tem um atendente e estoque próprio (90 L de diesel, 12 L de água, salvo no save).
- 1 material recuperado paga 5 L de diesel.
- Abastecer 20 L ou encher o tanque do Titã (o caminhão precisa estar a até 26 m da bomba, motor desligado), galão de 10 L para a mochila e água.

### Oficinas (5)
km 0,55 · 5,65 · 9,8 · 14,95 · 20,4. Estoque de 10 peças cada.
- Comprar peças (2 por 4 materiais), vender 2 peças por 2 materiais.
- Serviço no Titã (a até 26 m, motor desligado): ajuste +30% por 3 materiais ou revisão completa (100%) por 7 materiais, em qualquer um dos 8 componentes.

### Saqueadores (7 emboscadas: km 1,95 · 4,0 · 7,75 · 10,75 · 13,4 · 15,6 · 17,5)
- Ao chegar a ~260 m você vê uma fogueira com bandeira vermelha e os buggies parados na beira da estrada. A ~85 m eles saem atrás de você.
- Eles perseguem por uma distância limitada (550 m na primeira, até 900 m na última) e **desistem**. Também desistem se você abrir mais de 240 m por 4 s.
- Se o Titã estiver lento, eles emparelham e se agarram. Uma barra no HUD mostra o quanto falta. Se completar (3 s), levam uma fração do **compartimento do Titã** (30% a 55%); a mochila e o tanque ficam seguros.
- Como reagir: correr (eles chegam a 17,5–22,5 m/s; o Titã faz até 25), ou **virar contra eles acima de 9 m/s** para abalroar. Cada abalroado dá materiais e custa uma pequena avaria. Fora de combate todos, a emboscada acaba.
- Cada emboscada acontece uma vez e o resultado fica salvo.

### Mapa, diário e HUD
- Mapa: **P** (posto) e **O** (oficina). Diário (J): lista de postos e oficinas visitados. HUD: aviso e medidor de perseguição.

## Arquivos
Novos: `src/data/road.js`, `src/game/missions/road.js`, `src/game/missions/RoadController.js`, `src/game/world/RoadWorld.js`, `src/game/world/Bandits.js`, `src/game/world/banditAI.js`, `src/components/gameplay/RoadPanelContent.js`, `tests/unit/road.test.js`.
Alterados: `Game.js`, `campaign.js` e `network.js` (missions), `schema.js`, `data/campaign.js`, `pt-BR.js`, `MissionPanel.js`, `NetworkMap.js`, `Hud.js`, `globals.css`, `tests/e2e/phase2.spec.js`, `README.md`, `package.json`.

## Compatibilidade
O save continua `schemaVersion` 3. O campo novo `campaign.road` é opcional na validação e completado ao carregar. Saves anteriores abrem normalmente.

## Verificação (o que foi e o que não foi feito)
Foi feito: checagem de sintaxe de todos os arquivos; 15 testes novos e os 33 de `network`, `resources`, `expedition` e `world` rodando em Node; simulação da IA dos saqueadores; construção das estruturas com Three/Rapier simulados.
Não foi feito: `npm test` completo, `next build`, `npm run test:e2e` e jogar no navegador. O e2e `phase2.spec.js` foi editado para ligar o gerador antes de ativar o Núcleo 1, mas não foi executado. Ajustes visuais (tamanho/posição das estruturas, velocidades dos saqueadores) dependem de você jogar. Constantes em `src/data/road.js`.
