# Correção 0.3.1 — saída do Titã

## Problema e comportamento corrigido
O usuário confirmou a versão 0.3.0 e relatou que F não apresentou resposta. A revisão encontrou uma restrição de área que o HUD não comunicava e reproduziu rolamento residual com Espaço pressionado, capaz de manter o bloqueio de saída por velocidade. A causa exata observada no computador Windows do usuário não foi reproduzida naquele hardware.

- Parado, o Titã permite descer em qualquer trecho para circular até 24 m ao redor dele. Abrigos, Núcleo e pontos de interesse conservam suas áreas maiores de exploração.
- O indicador F é um botão clicável, compartilhando a ação com o teclado. Em movimento, o texto instrui segurar Espaço para parar antes de descer.
- O estacionamento corta a tração, aumenta a força dos freios e assiste a frenagem dianteira em baixa velocidade; a aderência deixa de ser reduzida ao estacionar. Não há mudança de posição por teleporte durante a frenagem.
- A saída procura cinco posições com raycast e interseção de cápsula do Rapier, escolhendo um espaço livre. Se as saídas estiverem obstruídas, informa para reposicionar.
- Dante pode retornar ao Titã se um save antigo o colocar fora do limite de exploração.
- Saves schema 1/2 continuam compatíveis. COMO_ATUALIZAR.txt explica preservar os arquivos local.db e eventuais WAL/SHM.

## Arquivos principais
src/game/player/exitPolicy.js; Player.js; VehiclePhysics.js; core/Game.js; hud/Hud.js; game/GameView.js; textos, estilos, versão e documentação. Novos testes em tests/unit/exit.test.js, physics.test.js e tests/e2e/exit.spec.js.

## Verificação real
```text
npm test
Test Files 6 passed (6)
Tests 44 passed (44)

npm run build
Compiled successfully in 799ms

PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
7 passed (2.1m)
```
O teste novo usa teclado e mouse reais: F no abrigo, retorno ao veículo, saída por botão no km 0,7 sem abrigo, caminhada, retorno ao caminhão, bloqueio enquanto se move, Espaço até parar e nova saída por F. Os testes das missões, restauração, API, inventário, expedição e saves também passaram.

No estado final do teste: modo = walking; velocidade do Titã = 0.000 km/h; console = []. A física em inclinação de 1,5% também validou a imobilização pelo freio de estacionamento.

Logs, estados e capturas estão em evidence/hotfix-0.3.1. before-fix-parking.json registra a falha reproduzida antes do ajuste. A execução específica em Windows e a sensação em terrenos muito inclinados continuam como verificações manuais pendentes.

## Atualizar e jogar
Feche o jogo e o terminal antigo. Extraia o ZIP 0.3.1 numa pasta nova. Para manter progresso, copie local.db e, se houver, local.db-wal/local.db-shm da pasta antiga para a nova, preservando os originais. Use o mesmo navegador e http://localhost:3000. Abra INICIAR_JOGO.bat e confira 0.3.1 no menu.

Segure Espaço até parar; pressione F ou clique no botão de saída. Volte perto do Titã e use F para entrar. O motor não precisa ser desligado para descer; no Núcleo, a ativação continua exigindo motor desligado.
