# Relatório — Fase 1: 2047: Rede Aurora

**Estado:** base jogável implementada e aceite funcional automatizado aprovado. Avaliação humana e meta de 60 FPS em GPU integrada permanecem não verificadas. Nenhuma implementação da Fase 2 foi iniciada.

## 1. O que foi implementado

- Next.js 16.4.3, App Router, React 19.3.1, JavaScript, Three.js 0.186.1, Rapier 0.21.0, libSQL 0.18.0, Vitest 5.0.5 e Playwright 1.64.1. Versões exatas estão no package-lock.json.
- Menu em PT-BR com cena 3D animada, Novo jogo, configurações e créditos. Continuar/Carregar desabilitados conforme a Fase 1.
- Mar de Cinzas com seed 2047, nove setores móveis de 1.024 m, terreno com relevo, rodovia de 3 km com textura de desgaste, abrigo, reservatório elevado, ruínas industriais, postes, rochas, neblina, céu em shader e poeira limitada.
- Titã Rocha Clara procedural: cabine com chanfros e aberturas, para-brisa dividido, grade, seis pneus com sulcos, calotas, eixos e molas animados pela suspensão, tanque cilíndrico, escapamento/fumaça, caçamba e berço vazio, retrovisores, degraus, faróis e painel/volante internos.
- Rapier DynamicRayCastVehicleController: aceleração progressiva, freio/ré, direção, freio de mão, aderência por superfície, massa, inércia, suspensão e colisores do cenário. Passo de 1/60 s com acumulador e interpolação.
- Câmeras externa amortecida, cabine e externa livre com mouse/zoom. E alterna o motor; L alterna faróis. Motor e vento procedurais em Web Audio, iniciados pelo clique do usuário.
- HUD a 10 Hz: velocidade, combustível com consumo real, temperatura, objetivo, distância, terreno e contexto da ignição; pausa, recuperação e retorno ao menu.
- Presets Baixo/Médio/Alto, escala de resolução, volume e legendas persistidos em localStorage. Culling por setor/frustum, instâncias, LOD de rochas e união de superfícies estáticas por material.
- GET /api/game/config; módulo repository isolando libSQL e migração idempotente inicial. API de saves, identidade anônima, Sementes, manutenção e demais sistemas permanecem no escopo da Fase 2+.
- Diagnóstico window.__GAME_DEBUG__ fora de produção, com leitura de estado, setInput e teleport. Integridade é null porque ainda não existe uma Semente transportada.

## 2. Arquivos criados/alterados

O projeto não existia: foi criado um repositório Git real em `/workspace/work/2047-rede-aurora`. A arquitetura está dividida em src/app, components, data, game e lib. A relação completa consta no fim deste relatório.

Commits de implementação verificada:

```text
2d900f0 fix: estabiliza ciclo de vida, câmeras, setores e valida os aceites
16c228e feat: base 3D dirigível com Rapier, mundo procedural, menus e HUD
b5c8d8c chore: estrutura Next e regras puras verificadas
```

Um commit final registra este relatório. O pacote preserva o diretório .git e o histórico.

## 3. Comandos executados e saídas reais

```text
npm test
Test Files  3 passed (3)
Tests       15 passed (15)

npm run db:migrate
Migração verificada: schema 1

NEXT_TELEMETRY_DISABLED=1 npm run build
Compiled successfully in 1020ms
Generating static pages (6/6)
Rotas: /, /_not-found, /api/game/config, /game, /settings

PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
3 passed (51.0s)

node scripts/measure-vehicle.js
speedAt8Kmh: 42.68447963452999
timeTo60Seconds: 11.783333333333333

npm start -- --port 3100
Ready in 101ms

PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium node scripts/smoke-production.js
speedKmh: 45
debugAbsent: true
configStatus: 200
consoleErrors: []
```

Saídas integrais: evidence/unit-tests.log, migration.log, build.log, e2e.log e production.log. Os servidores usados nos testes foram encerrados após as verificações.

## 4. Testes e resultados

| Verificação | Resultado medido |
| --- | --- |
| Novo jogo, tecla W mantida por oito segundos | 43.15 km/h, acima do aceite de 40 km/h |
| Diesel antes/depois | 140.000000 → 139.906820 L |
| Console do navegador no aceite | zero erros |
| Setores carregados | 9 |
| FPS médio, 1280×720, Médio, SwiftShader | 2.99 FPS |
| Draw calls, incluindo sombras | 92 / limite 300 |
| Triângulos renderizados | 62192 / limite 500.000 |
| Física em plano, 0 → 60 km/h, sem carga | 11.78 s |
| Produção, W por oito segundos, 960×540 | 45 km/h; diagnóstico ausente; API 200; zero erros |

Os quinze testes sem renderização cobrem diesel, integração temporal, ordem/curva de aderência, passo fixo, seed/continuidade de terreno, seleção de superfície, ajustes, aceleração/frenagem, ré, esterço e bloqueio por obstáculo sólido no Rapier real.

Os três testes Playwright verificam o aceite de condução com teclado real; câmeras, ignição, faróis, pausa que bloqueia os controles, ajustes mantidos após recarga e configuração via API; renovação de setores e chegada ao objetivo usando teleport do diagnóstico.

Screenshots gerados pelo navegador: evidence/menu.png, driving.png, cabin.png, road-end.png e production.png. Métricas completas: evidence/acceptance.json, production.json e vehicle-tuning.json. As capturas foram inspecionadas visualmente; a cabine foi corrigida para mostrar a estrada através do para-brisa.

## 5. Problemas existentes e itens não verificados

- **Desempenho em GPU integrada não verificado.** O ambiente fornecido usa renderização por software. Os 2.99 FPS medidos não cumprem a meta de 60 FPS e não permitem validar a experiência em hardware gráfico real. Os orçamentos de geometria e draw calls foram cumpridos no cenário testado.
- Peso percebido do volante, conforto das câmeras, qualidade sonora, sensação de colisão e saída da estrada exigem avaliação humana. Todos constam como não verificados em CHECKLIST_MANUAL.md.
- Travessia manual completa de 3 km, sessão prolongada, Firefox e Safari não verificados. Transições de setores e objetivo foram verificadas com diagnóstico no Chromium.
- Arte e áudio procedurais são uma primeira passagem funcional. Refinamentos e peças externas destacáveis estão listados em ASSETS_PENDENTES.md; nenhum sistema de dano/peça destacável é declarado concluído nesta fase.
- Sem saves de progresso, exploração a pé, rádio narrativo, Sementes, restauração ou inventário nesta fase. Esses sistemas não possuem botões fictícios simulando mecânicas.
- A pasta de anexos sugerida pela conversa em /codex/browser/projectless/.../output não está disponível para criação nesta máquina. O repositório, relatório, pacote e evidências foram preservados no workspace. Não houve publicação externa.

## 6. Como executar

```sh
cd /workspace/work/2047-rede-aurora
npm ci
npm run db:migrate
npm run dev
```

Abra http://localhost:3000, clique em Novo jogo e use W/S, A/D, Espaço, E, C, L e Esc. A partida começa ao volante com o motor ligado. Na câmera livre, arraste o mouse e use a roda para zoom. Para rodar a compilação de produção: npm run build e npm start.

No pacote ZIP, entre na pasta 2047-rede-aurora extraída e use os mesmos comandos. Node.js 20.9+; verificado em Node 24.19.0. O navegador precisa de WebGL2. O README explica os testes e as configurações de Turso reservadas à produção.

## 7. Próximos passos propostos

1. Revisão humana dos controles/câmeras/áudio e benchmark em GPU integrada antes de ampliar os sistemas.
2. Após autorização, iniciar somente a Fase 2: ciclo abrigo → Semente → preparação → escolha de rota → Núcleo 1 → transformação → save/load.
3. Preservar a stack, o universo e o roteiro; deploy Vercel permanece reservado à Fase 6.

**Pausa de escopo:** aguardando autorização para a Fase 2.

## Relação de arquivos versionados

```text
.env.example
.gitignore
AGENTS.md
ASSETS_PENDENTES.md
CHECKLIST_MANUAL.md
DECISOES.md
README.md
evidence/acceptance.json
evidence/build.log
evidence/cabin.png
evidence/driving.png
evidence/e2e.log
evidence/menu.png
evidence/migration.log
evidence/production.json
evidence/production.log
evidence/production.png
evidence/road-end.png
evidence/unit-tests.log
evidence/vehicle-tuning.json
migrations/001_initial.sql
next.config.js
package-lock.json
package.json
playwright.config.js
public/icon.svg
scripts/measure-vehicle.js
scripts/migrate.js
scripts/smoke-production.js
src/app/api/game/config/route.js
src/app/game/page.js
src/app/globals.css
src/app/layout.js
src/app/page.js
src/app/settings/page.js
src/components/game/GameLoader.js
src/components/game/GameView.js
src/components/hud/Hud.js
src/components/menus/MainMenu.js
src/components/menus/Panel.js
src/components/ui/Symbol.js
src/data/config.js
src/data/pt-BR.js
src/game/audio/EngineAudio.js
src/game/core/FixedLoop.js
src/game/core/Game.js
src/game/input/Input.js
src/game/persistence/settings.js
src/game/physics/VehiclePhysics.js
src/game/physics/initialize.js
src/game/render/Cameras.js
src/game/render/SceneRenderer.js
src/game/render/materials.js
src/game/render/mergeStatic.js
src/game/survival/resources.js
src/game/vehicle/model.js
src/game/world/World.js
src/game/world/terrain.js
src/lib/repository.js
tests/e2e/game.spec.js
tests/unit/physics.test.js
tests/unit/resources.test.js
tests/unit/world.test.js
vitest.config.js
RELATORIO_FASE_1.md
```
