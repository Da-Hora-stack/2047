# Relatório da Fase 2 — A primeira faixa de céu

## 1. Implementado
Ciclo abrigo → diálogo de Dante/sobrevivente → rádio da Dra. Renata → Semente → transferência, abastecimento e reparo → escolha de duas rotas → tempestade/filtros → barreira de areia → Núcleo/calibração/chance → restauração → save/load. Condução e três câmeras da Fase 1 preservadas.

Controlador Rapier a pé com colisão, corrida/salto e mouse; F contextual e E exclusivo da ignição. Oito componentes com custos e efeitos reais; diesel limitado, inventário com peso e transferência. A carga mede aceleração filtrada, impactos e frenagem, com zona morta, crescimento quadrático e teto 9%/s. Chance monotônica: 80%+ garante, 30–80% cresce linearmente, abaixo de 30% chance pequena. Falha permite gastar peças e tentar novamente.

Há dois caminhos físicos: desvio pavimentado (~1,4 km) e atalho ondulado (~1,1 km), com barreira na rodovia; o mapa apenas planeja a rota. A ativação remove o colisor da barreira, clareia névoa/céu, inicia chuva/som e crescimento de 220 plantas instanciadas. Bandeiras de finais e decisões já são serializadas sem revelar o mistério da Voz.

API completa requerida: configuração, regiões persistidas por slot, missões, itens, listagem/CRUD de três slots. libSQL isolado por repository, cookie anônimo HttpOnly/SameSite, Secure em HTTPS/produção, identidade opcionalmente assinada, limite real de 128 KiB, validação e revisão otimista; erros 400/404/409/500 sem detalhes internos. Slots de outros jogadores são inacessíveis.

Inclui INICIAR_JOGO.bat e scripts/launch-local.js para facilitar execução no Windows.

## 2. Arquivos criados/alterados
Lista completa no fim. Principais: game/core/Game, game/missions/campaign, game/cargo/integrity, game/player/Player, world/CampaignWorld, persistence/schema/client, lib/api/repository, app/api, components/gameplay/MissionPanel e testes.

## 3. Comandos e saídas reais
```text
npm test
Test Files 4 passed (4)
Tests 28 passed (28)

npm run build
Compiled successfully; 10 rotas geradas/registradas

PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e -- tests/e2e/phase2.spec.js
API: cookies, isolamento, CRUD, validação e conflito — passou
Fatia vertical: abrigo, carga, preparo, rota, Núcleo, transformação e recarga — passou
2 passed (30.5s)
```
As três verificações de navegador da Fase 1 também passaram na execução anterior desta fase, incluindo W por oito segundos: 43.49 km/h, diesel reduzido, console sem erros. Logs em evidence/phase2, métricas/capturas em evidence/.

## 4. Testes e provas
28 testes de regras/física/repositório; inclui dano com zona morta e teto, chance, inventário/custos, revisão/isolamento libSQL e validação. E2E usou teclado/interações reais e teleporte apenas para encurtar travessias, conforme autorizado pelo aceite.

No fluxo salvo: suspensão 63%, radiador 60%; após recarga, Núcleo = active, restauração = True, rota = safe. Verificação derivada dos objetos 3D: chuva e plantas visíveis, 220 instâncias, barreira sem colisor. Console: [].
Capturas: shelter.png, maintenance.png, routes.png, storm.png, restored.png e loaded.png em evidence/phase2. Dados completos: vertical-slice.json.

## 5. Limites e não verificados
- Não foi cronometrada uma sessão humana de 10–15 min; o fluxo automatizado usa teleporte nas travessias. As duas rotas completas precisam de avaliação humana.
- Desempenho medido em SwiftShader: 3.08 FPS, 101 draw calls e 65794 triângulos no aceite. Meta ~60 FPS em GPU integrada a 1080p não verificada; o ambiente usa renderização por software.
- Sensação de volante/câmeras, qualidade de som, pointer lock em Windows e iniciador .bat não verificados por uma pessoa. Checklist atualizado.
- Nenhum Turso foi provisionado; deploy Vercel continua reservado à Fase 6. Desenvolvimento local/Windows usa file:local.db; produção recusa arquivo local.
- Arte procedural funcional ainda exige revisão. Placas sem pintura final e avatar simplificado estão listados em ASSETS_PENDENTES.md.

## 6. Executar
Windows: Node.js LTS, extrair o ZIP e abrir INICIAR_JOGO.bat. Alternativa: npm ci, npm run db:migrate, npm run dev. Abrir http://localhost:3000 e manter o terminal aberto. Preserve local.db e cookies para manter acesso aos saves.

## 7. Próximo passo autorizado
O usuário autorizou explicitamente iniciar a Fase 3 logo após a Fase 2. Este relatório encerra a Fase 2; a próxima etapa acrescentará sobrevivência, coleta/trocas, estruturas exploráveis e o Leito Seco. Não avançar para a Fase 4 sem autorização.

## Arquivos
```text
ASSETS_PENDENTES.md
CHECKLIST_MANUAL.md
DECISOES.md
INICIAR_JOGO.bat
README.md
evidence/acceptance.json
evidence/cabin.png
evidence/driving.png
evidence/menu.png
evidence/phase2/build.log
evidence/phase2/e2e.log
evidence/phase2/loaded.png
evidence/phase2/maintenance.png
evidence/phase2/restored.png
evidence/phase2/routes.png
evidence/phase2/shelter.png
evidence/phase2/storm.png
evidence/phase2/unit-tests.log
evidence/phase2/vertical-slice.json
evidence/road-end.png
package-lock.json
package.json
scripts/launch-local.js
src/app/api/game/items/route.js
src/app/api/game/missions/route.js
src/app/api/saves/[slot]/route.js
src/app/api/saves/route.js
src/app/api/world/regions/route.js
src/app/globals.css
src/components/game/GameView.js
src/components/gameplay/MissionPanel.js
src/components/hud/Hud.js
src/components/menus/MainMenu.js
src/components/menus/Panel.js
src/data/campaign.js
src/data/config.js
src/data/pt-BR.js
src/game/audio/EngineAudio.js
src/game/cargo/integrity.js
src/game/core/Game.js
src/game/input/Input.js
src/game/missions/campaign.js
src/game/persistence/client.js
src/game/persistence/schema.js
src/game/physics/VehiclePhysics.js
src/game/player/Player.js
src/game/world/CampaignWorld.js
src/game/world/World.js
src/game/world/terrain.js
src/lib/api.js
src/lib/repository.js
tests/e2e/game.spec.js
tests/e2e/phase2.spec.js
tests/unit/campaign.test.js
```
