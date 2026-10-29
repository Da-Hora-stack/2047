# Relatório da Fase 3 — Estradas de sal (v0.3.0)

## 1. Implementado
A Fase 3 amplia a base das Fases 1 e 2, preservando o ciclo da primeira Semente e os controles do Titã.

- Hidratação, saciedade e fadiga com queda lenta somente durante a viagem (inclui deslocamento a pé). Parado ou em menu não consomem medidores. Falta de água/comida traz perda gradual de vigor, limitada; não há morte automática. Água e comida do inventário recuperam medidores e removem privação quando ambos têm reserva.
- HUD e painel H mostram medidores, avisos antes de esgotar reservas e ações de consumo. Água para sobrevivência compete com água para o radiador; todos os custos usam os mesmos inventários.
- Oficina abandonada, posto de Mãe Ivani e estação meteorológica com piso, paredes, cobertura, entrada e colisão. F opera interação dentro da estrutura. Exploração a pé foi ampliada às zonas desses pontos.
- Coletas finitas para a mochila, com limite de 40 kg e transferência ao Titã (240 kg). Contêineres recolhidos desaparecem e não retornam ao recarregar.
- Mãe Ivani vende diesel, água, comida e peças em troca de materiais, compra peças e oferece descanso com custo em água/comida. Quantidades, estoque e transações são persistidos. Não há economia fictícia ou itens infinitos.
- Extensão explorável até 6 km. Leito Seco com sal, planície baixa, casco encalhado como silhueta, crosta instável de menor aderência e calor que pressiona o radiador e pode provocar superaquecimento/perda de potência. Reparar o radiador muda esse comportamento. Chuva/verde da primeira restauração permanecem no Mar de Cinzas.
- Saves schemaVersion 2 com sobrevivência, pontos visitados, coletas e estoque. Saves válidos schemaVersion 1 da Fase 2 são migrados sem apagar missão, componentes, recursos, decisões ou restauração. API aceita as duas versões e valida campos novos/capacidades.
- Textos de expedição e interface centralizados em src/data; versão atualizada, README/limites/assets/checklist e iniciador para Windows incluídos.

O Leito Seco é um ramo de reconhecimento: não ativa Núcleos fora da ordem e não declara construídos os cinco biomas completos ou as sete entregas da Fase 4.

## 2. Arquivos criados/alterados
Principais módulos novos: game/survival/expedition.js, world/ExpeditionWorld.js, data/expedition.js, data/ui.js, tests/unit/expedition.test.js e tests/e2e/phase3.spec.js. Integração no Game, controlador a pé, mundo, HUD, painéis, schema/repository e documentação. Lista completa ao fim.

O repositório real está em /workspace/work/2047-rede-aurora. A Fase 2 foi encerrada em c5b6a80 e tag fase-2, após c201b9b (regras/API). O commit da Fase 3 acompanha o pacote, com o histórico preservado.

## 3. Comandos executados e saídas reais
```text
npm test
Test Files 5 passed (5)
Tests 39 passed (39)

NEXT_TELEMETRY_DISABLED=1 npm run build
✓ Compiled successfully in 795ms
Rotas: /, /game, /settings, /api/game/config, /api/game/items,
/api/game/missions, /api/world/regions, /api/saves, /api/saves/[slot]

PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
6 passed (1.8m)
```
Logs completos: evidence/phase3/unit-tests.log, build.log e e2e.log. São saídas capturadas dos comandos, não resultados presumidos.

## 4. Testes e resultados
Os 39 testes cobrem regras anteriores, física Rapier real, integridade/chance, inventários, API/repositório, migração, consumo temporal, privação limitada/reversível, custos/estoques/coletas, capacidade e calor integrado ao resfriamento real. Radiador avariado ultrapassa 110°C, perde potência e desgasta motor; o reparado mantém temperatura menor no mesmo teste.

Os seis testes de navegador cobrem:
1. Menu e W por oito segundos, diesel, console e orçamento de renderização.
2. Três câmeras, motor, faróis, pausa, ajustes persistidos e API.
3. Renovação dos nove setores e objetivo respondendo à posição.
4. CRUD de saves, cookie, isolamento entre jogadores, revisão antiga, payload inválido e corpo acima do limite.
5. Fatia da Fase 2, ativação, transformação real, salvamento e recarga.
6. Save antigo migrado, consumo de água/comida, pausa sem drenagem, coleta na oficina, estoque/preço/descanso de Mãe Ivani, sal/calor/ausência de chuva no Leito Seco, limite da mochila e transferência antes de coletar a estação, colisão com parede e save/load dos novos estados.

No save recarregado da Fase 3: coletas = ['depot', 'station']; estoque de água de Mãe Ivani = 8; transações = 1. Inventário igual ao salvo; contêiner da estação invisível após recarga; console = [].

Aceite de condução atual: 42.45 km/h após W por oito segundos, combustível reduzido; 101 draw calls e 65794 triângulos (limites 300 e 500.000). FPS médio medido: 3.16 em SwiftShader a 1280×720, preset Médio. O fluxo extenso usa preset Baixo a 960×640 e teleporte apenas para encurtar travessias permitidas pelo aceite.

Provas: evidence/phase3/survival.png, workshop.png, ivani.png, salt.png e station.png. Dados brutos: expedition.json. Evidências da fatia anterior permanecem em evidence/phase2, com a regressão também executada na versão atual.

## 5. Problemas existentes e itens não verificados
- ~60 FPS em GPU integrada a 1080p não verificados. O ambiente oferece renderização por software; os 3.16 FPS medidos não cumprem essa meta. Orçamentos de draw calls/triângulos passaram no cenário testado.
- Travessia humana completa, duração de sessões, equilíbrio em 20–30 min, sensação dos controles, legibilidade da bifurcação e qualidade de áudio dependem de avaliação humana. Não foram declarados verificados; estão no CHECKLIST_MANUAL.md.
- INICIAR_JOGO.bat e abertura automática do navegador não foram executados em Windows. O ambiente é Linux; comandos de instalação/migração/dev/build e o jogo foram executados aqui.
- Arte, avatares, texturas, interiores e sinalização são procedurais funcionais de primeira passagem. Refinamentos estão listados em ASSETS_PENDENTES.md. Não há vozes gravadas, animação humana final ou continente completo.
- Produção exige Turso; nenhuma conta/banco remoto foi provisionada. Deploy Vercel fica para a Fase 6. Banco local/cookies são necessários para preservar saves no Windows e não são incluídos no ZIP.
- Não há entrega dos demais Núcleos, narrativa/finais completos, NPCs de todas as regiões ou sistemas da Fase 4. A sequência oficial da Rede foi preservada.

## 6. Como executar no Windows
1. Instale Node.js LTS pelo site oficial.
2. Extraia o ZIP inteiro para uma pasta nova.
3. Abra INICIAR_JOGO.bat na pasta que contém package.json.
4. Aguarde instalar dependências/migrar e abrir http://localhost:3000. Mantenha o terminal aberto.

Alternativa manual: npm ci, npm run db:migrate, npm run dev. Use o mesmo navegador e endereço para manter a identidade do cookie. Para atualizar uma instalação com saves, preserve local.db e cookies; copie seu local.db para a nova pasta antes de iniciar. Em produção, configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.

## 7. Próximos passos propostos
Avaliar o checklist manual e desempenho em hardware real. Depois, mediante autorização, iniciar somente a Fase 4 (sistemas de mundo e expansão dos demais biomas/Núcleos). **A Fase 4 não foi iniciada.** Os relatórios das Fases 1, 2 e 3 ficam no pacote, junto com Git e evidências.

## Lista de arquivos
```text
ASSETS_PENDENTES.md
CHECKLIST_MANUAL.md
DECISOES.md
README.md
evidence/acceptance.json
evidence/cabin.png
evidence/driving.png
evidence/menu.png
evidence/phase2/loaded.png
evidence/phase2/maintenance.png
evidence/phase2/restored.png
evidence/phase2/routes.png
evidence/phase2/shelter.png
evidence/phase2/storm.png
evidence/phase2/vertical-slice.json
evidence/phase3/build.log
evidence/phase3/e2e.log
evidence/phase3/expedition.json
evidence/phase3/ivani.png
evidence/phase3/salt.png
evidence/phase3/station.png
evidence/phase3/survival.png
evidence/phase3/unit-tests.log
evidence/phase3/workshop.png
evidence/road-end.png
package-lock.json
package.json
src/app/globals.css
src/components/gameplay/MissionPanel.js
src/components/hud/Hud.js
src/components/menus/Panel.js
src/data/campaign.js
src/data/config.js
src/data/expedition.js
src/data/pt-BR.js
src/data/ui.js
src/game/core/Game.js
src/game/input/Input.js
src/game/missions/campaign.js
src/game/persistence/schema.js
src/game/physics/VehiclePhysics.js
src/game/player/Player.js
src/game/render/materials.js
src/game/survival/expedition.js
src/game/world/CampaignWorld.js
src/game/world/ExpeditionWorld.js
src/game/world/World.js
src/game/world/terrain.js
src/lib/repository.js
tests/e2e/game.spec.js
tests/e2e/phase3.spec.js
tests/unit/expedition.test.js
RELATORIO_FASE_3.md
```
