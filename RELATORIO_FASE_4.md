# Relatório da Fase 4 — Um continente em resposta (0.4.0)

Entrega de 28/10/2026. Repositório privado: https://github.com/renataaap/2047.

## 1. O que foi implementado

- Continente em escala condensada, com 21 km de estrada e cinco biomas: Mar de Cinzas, Cidades Esqueleto, Leito Seco, Cordilheira Vítrea e Zonas de Tempestade. O trecho de sal dos km 3,2–5,8 permanece como enseada de reconhecimento, preservando as versões anteriores; a sequência principal passa pelas cidades antes do quarto Núcleo no Leito Seco.
- Sete Núcleos com identificadores, regiões, estados, tentativas e Sementes correspondentes. Cofre 1 já esvaziado pela sobrevivente no início; seis novos Cofres com mecanismos/custos distintos. A abertura é uma transação real, embarca a carga no Titã e não pode se repetir. O sétimo exige preparo dos componentes. Nenhum Cofre/Núcleo permite saltar a ancoragem anterior.
- Transporte com integridade, vibração/impactos, chance visível, calibração com peças e falha recuperável, reaproveitando a física e o sistema da primeira entrega. Cada Semente tem sua integridade registrada. O cilindro reaparece na carroceria durante as novas entregas.
- Desafios físicos e alternativas: viaduto com bloqueio sólido, túnel com paredes/cobertura/água e arrasto/dano ao motor em velocidade, sal instável e calor, estradas estreitas/rampas/aderência vítrea e desgaste de transmissão, frentes residuais com rajadas e fragmentos que fecham a passagem. Há seis novos arcos pavimentados a leste e atalhos por chão irregular a oeste. Planejar no mapa não move o caminhão.
- Clima determinístico com relógio persistido. A frente residual alterna 65 segundos de atividade e 55 de calmaria, somente enquanto o jogo está ativo. Menus pausam o relógio. Interferência, estática do áudio, névoa, vento, filtros e passagem central respondem à frente; a restauração estabiliza o campo.
- Transformações reais por faixa: chuva e som, crescimento de 160 plantas por novo Núcleo, terreno/atmosfera recuperados, abertura de colisores de bloqueio, drenagem do túnel e redução de pressão regional. Dois Núcleos urbanos e dois da cordilheira restauram suas faixas separadamente; o estado de região completa exige ambos. A primeira restauração mantém suas 220 plantas e a barreira liberada.
- Quatro novos abrigos/NPCs com comércio de estoque independente: Lia, Afonso, Noêmia e Joel. Abrigo 07 e posto de Mãe Ivani continuam funcionando. Seis depósitos finitos de viagem junto aos novos Cofres, com limite de peso e coleta única.
- Três missões secundárias: entregar água/comida a Lia; reparar a bomba de Afonso; restaurar o repetidor de Noêmia. Aceitação, adiamento, custos, recompensas e conclusão são registrados. A bomba melhora a aderência na crosta; o repetidor acrescenta rádio e um fragmento; Lia reaparece na Última Parada e no mapa.
- Objetivo contextual, mapa dos sete Núcleos/desvios/abrigos, caderno J, rádio R com boletim e diálogos progressivos. A identidade da Voz permanece ausente dos textos do jogo.
- Save schemaVersion 3, com migração de 1/2 e validação de sequência, integridades, estoque, clima, inventário e restauração. API de regiões apresenta identificadores originais e estados por Núcleo. Banco continua atrás do repository libSQL. Carregamentos distantes preparam setores/colliders antes da física.
- Geometrias/corpos dos novos equipamentos são criados por proximidade e liberados ao sair. Terreno mantém janela 3×3, instâncias, LOD e materiais compartilhados. Nenhuma dependência adicional.

A ancoragem do sétimo campo encerra os sistemas de mundo desta fase. Os conflitos completos de Brutus, escolhas finais e quatro desfechos pertencem à Fase 5 e não foram implementados nesta entrega.

## 2. Arquivos criados/alterados

Novos módulos principais: `src/data/network.js`, `game/missions/network.js`, `NetworkController.js`, `game/world/NetworkWorld.js`, `NetworkMap.js`, `NetworkPanelContent.js` e `DialogueText.js`. Integração no Game, terreno/chunks, materiais, veículo, áudio, HUD, API e validação. Testes em `tests/unit/network.test.js` e `tests/e2e/phase4.spec.js`.

Documentação: README, DECISOES, ASSETS_PENDENTES, CHECKLIST_MANUAL, COMO_ATUALIZAR, este relatório, STATUS_DO_PROJETO e CONTINUAR_NO_CELULAR. A especificação original fica em `docs/PROMPT_MESTRE.md` para retomada em outra conversa. Histórico Git preservado: base 5a17c88; regras em 4929ab8; integração verificada em b46e94d; documentação no commit seguinte.

## 3. Comandos executados e saídas reais

```text
npm test
Test Files 7 passed (7)
Tests 55 passed (55)

NEXT_TELEMETRY_DISABLED=1 npm run build
✓ Compiled successfully in 1045ms
✓ Generating static pages using 2 workers (10/10)

PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
9 passed (3.4m)
```

Logs integrais em `evidence/phase4/unit-tests.log`, `build.log` e `e2e.log`. A aplicação foi iniciada pelo webServer do Playwright; os testes usaram Rapier/WebGL reais no Chromium com ANGLE/SwiftShader.

Na integração, a primeira travessia revelou que o teste soltava Espaço antes de aguardar a suspensão assentar após o teleporte. O teste agora aguarda uma parada real e mantém Espaço ao usar F. Também foram atualizados dois aceites antigos que ainda esperavam config.phase 3 e uma mensagem de fim aos 3 km. A execução final completa acima passou; não foram escondidas falhas substituindo as mecânicas por mensagens.

## 4. Testes e resultados

Os 55 testes unitários cobrem regressões anteriores e regras de sequência, migração, integridade/chance/calibração, custos atômicos, capacidade, prevenção de duplicação, estoques independentes, missões e consequências, desgaste na água/cordilheira, clima e rejeição de saves incoerentes. Saves legados aceitos com estado ativo/falho e contador zero são normalizados ao migrar, sem mudar o objeto original.

Os nove testes e2e cobrem:
1. F e botão de saída, retorno ao Titã fora dos abrigos e frenagem, preservando o hotfix 0.3.1.
2. Condução W por 8 s, consumo, console e orçamento de renderização.
3. Três câmeras, ignição, faróis, pausa, ajustes persistidos e API/config da Fase 4.
4. Renovação dos nove setores até as cidades e manutenção do objetivo da primeira Semente ao explorar antes de aceitá-la.
5. Identidade/cookies, isolamento, CRUD, validação, corpo grande e conflito de revisão da API.
6. Primeira entrega completa, preparo, rota, ancoragem, transformação e save/load.
7. Regressão de sobrevivência, estruturas/coletas, Mãe Ivani, sal/calor, capacidade e migração de save 1.
8. Save 2 migrado; Cofre fora de ordem bloqueado; Cofres 2–7, embarque/transporte/ancoragem; missões, compra/estoque, descanso, depósito único, vegetação/chuva, viaduto liberado, túnel drenado, Lia reaparecendo, mapa/radio/J e recarga integral em schema 3.
9. Veículo realmente barrado pelo viaduto e avançando pelo desvio; carregamento distante com nove setores prontos; frente com colisor ativo, pausa do relógio e calmaria removendo o bloqueio/reduzindo interferência.

No roundtrip: sete estados ativos, cinco regiões restauradas, três missões secundárias concluídas, inventário igual ao persistido, depósito 2 ainda recolhido, estoque local mantido, `finalChoice: null`, console de erros vazio. O teste de sequência usa teleportes de diagnóstico para encurtar distâncias; as interações e transações passam pelos controles e botões do jogo.

Medição final inicial: **42,73 km/h** após W por 8 s; diesel diminuiu; **105 draw calls / 66.254 triângulos** a 1280×720 no Médio. FPS médio **3,13 em renderização por software**. Nas seis chegadas novas amostradas, até 114 draw calls; os limites de 300 e 500.000 passaram. Isso não valida 60 FPS em GPU integrada.

Provas: `network-journey.json` e `roads-weather.json`; screenshots de Cofre, missões/mapa/rádio/Lia, frente/calmaria e biomas pelo para-brisa em `evidence/phase4`. Todas foram produzidas pelo navegador. As evidências de regressão anteriores também foram renovadas.

## 5. Problemas existentes e itens não verificados

- ~60 FPS em GPU integrada a 1080p **não verificados**. O ambiente mede SwiftShader; o valor de 3,13 FPS não cumpre essa meta. Os orçamentos geométricos foram medidos nos cenários testados, sem garantia de todas as posições/câmeras.
- Travessia humana dos 21 km, duração, equilíbrio da escassez, legibilidade das rotas, sensação de aderência/freios e qualidade perceptiva de áudio/arte continuam em CHECKLIST_MANUAL. Os testes de transporte não substituem uma sessão humana completa.
- Arte procedural de primeira passagem: montanhas/ruínas/cofres/abrigos têm geometria e função, mas precisam de refinamento e animação humana final. Não há combate, atuação de voz, finais ou personagens completos da Fase 5.
- O iniciador .bat e as instruções de celular não foram testados em aparelhos Windows/celular reais. O jogo continua voltado a desktop; o uso de celular solicitado foi acessar projeto/conversa, sem controles de toque.
- Saves locais dependem de banco e identidade do navegador. GitHub não sincroniza partidas entre aparelhos. Não foi criado login/migração entre contas.
- Turso remoto e deploy Vercel não foram provisionados: continuam na Fase 6. Produção exige as variáveis já documentadas.

## 6. Como executar e continuar em outro aparelho

No Windows: entrar como renataaap no GitHub, usar Code → Download ZIP, extrair, instalar Node.js LTS e abrir INICIAR_JOGO.bat. Fechar o terminal antigo antes de atualizar e conferir 0.4.0 no menu. Preservar local.db/cookies para atualizar no mesmo computador/navegador. Consulte COMO_ATUALIZAR.txt para os arquivos auxiliares do banco.

Alternativa manual: `npm ci`, `npm run db:migrate`, `npm run dev`; abrir http://localhost:3000 no computador que executa o servidor.

No celular, entrar na mesma conta do ChatGPT e abrir esta conversa no histórico. O projeto está em https://github.com/renataaap/2047 (privado). STATUS_DO_PROJETO e CONTINUAR_NO_CELULAR contêm o resumo e as instruções para outra conversa/computador.

## 7. Próximos passos propostos

Avaliar a travessia e o desempenho em hardware real. A próxima fase de desenvolvimento é a Fase 5: conflitos morais de Brutus, evolução dos personagens, consequências, fragmentos/mistério da Voz e quatro finais. Aguardar o pedido do usuário antes de iniciá-la.

## Lista de arquivos da implementação e evidências

- `DECISOES.md`
- `evidence/acceptance.json`
- `evidence/cabin.png`
- `evidence/driving.png`
- `evidence/hotfix-0.3.1/exit.json`
- `evidence/hotfix-0.3.1/foot-at-shelter.png`
- `evidence/hotfix-0.3.1/foot-by-road.png`
- `evidence/menu.png`
- `evidence/phase2/loaded.png`
- `evidence/phase2/maintenance.png`
- `evidence/phase2/restored.png`
- `evidence/phase2/routes.png`
- `evidence/phase2/shelter.png`
- `evidence/phase2/storm.png`
- `evidence/phase2/vertical-slice.json`
- `evidence/phase3/expedition.json`
- `evidence/phase3/ivani.png`
- `evidence/phase3/salt.png`
- `evidence/phase3/station.png`
- `evidence/phase3/survival.png`
- `evidence/phase3/workshop.png`
- `evidence/phase4/biome-cities-cab.png`
- `evidence/phase4/biome-glass-cab.png`
- `evidence/phase4/biome-salt-cab.png`
- `evidence/phase4/biome-storm-cab.png`
- `evidence/phase4/build.log`
- `evidence/phase4/city-detour.png`
- `evidence/phase4/continent-map.png`
- `evidence/phase4/core-2-restored.png`
- `evidence/phase4/core-4-restored.png`
- `evidence/phase4/core-5-restored.png`
- `evidence/phase4/core-7-restored.png`
- `evidence/phase4/e2e.log`
- `evidence/phase4/journal.png`
- `evidence/phase4/lia-reappeared.png`
- `evidence/phase4/network-journey.json`
- `evidence/phase4/radio.png`
- `evidence/phase4/roads-weather.json`
- `evidence/phase4/storm-calm.png`
- `evidence/phase4/storm-front.png`
- `evidence/phase4/unit-tests.log`
- `evidence/phase4/vault-2.png`
- `evidence/road-end.png`
- `package-lock.json`
- `package.json`
- `src/app/api/world/regions/route.js`
- `src/app/globals.css`
- `src/components/gameplay/DialogueText.js`
- `src/components/gameplay/MissionPanel.js`
- `src/components/gameplay/NetworkMap.js`
- `src/components/gameplay/NetworkPanelContent.js`
- `src/components/hud/Hud.js`
- `src/data/campaign.js`
- `src/data/config.js`
- `src/data/expedition.js`
- `src/data/network.js`
- `src/data/pt-BR.js`
- `src/data/ui.js`
- `src/game/audio/EngineAudio.js`
- `src/game/core/Game.js`
- `src/game/input/Input.js`
- `src/game/missions/NetworkController.js`
- `src/game/missions/campaign.js`
- `src/game/missions/network.js`
- `src/game/persistence/schema.js`
- `src/game/physics/VehiclePhysics.js`
- `src/game/render/materials.js`
- `src/game/survival/resources.js`
- `src/game/world/CampaignWorld.js`
- `src/game/world/NetworkWorld.js`
- `src/game/world/World.js`
- `src/game/world/terrain.js`
- `tests/e2e/game.spec.js`
- `tests/e2e/phase3.spec.js`
- `tests/e2e/phase4.spec.js`
- `tests/unit/network.test.js`

Documentos de entrega adicionados/atualizados no commit de documentação citado acima.
