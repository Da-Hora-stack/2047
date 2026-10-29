# Integração: main 0.5.0 + Estrada Viva

Esta versão usa a `main` 0.5.0 como base para preservar a simulação de direção mais recente (motor, RPM/torque, câmbio, câmeras, instrumentos, física e áudio) e integra os sistemas da versão 0.4.1 que não existiam na main:

- Gerador e técnico do Núcleo 1, com bloqueio da ativação até ligar o gerador.
- Postos de combustível, estoques, abastecimento e compra de água.
- Oficinas, compra/venda de peças e serviços de reparo.
- Saqueadores com perseguição, abalroamento, fuga e roubo de itens.
- Pontos no mapa, painel de interação, diário e HUD de perseguição.
- Migração da campanha e validação dos dados da estrada nos saves existentes.

Os arquivos exclusivos da Estrada Viva são mantidos em módulos separados; os arquivos compartilhados foram adaptados para conectar os recursos à versão 0.5.0 sem remover as implementações recentes de condução.

## Verificação

Execute `npm install`, depois `npm test` e `npm run build`. A suíte `tests/unit/road.test.js` cobre as regras da estrada; os testes existentes continuam incluídos. O teste manual de jogo ainda é importante para verificar interações e colisores em movimento.
