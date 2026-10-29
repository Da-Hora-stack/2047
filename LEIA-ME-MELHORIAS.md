# Melhorias 2047 — main 0.5.0 integrada

Esta versão combinada mantém as melhorias da main 0.5.0 e acrescenta os sistemas exclusivos da versão Estrada Viva 0.4.1.

## Condução e visual
- Motor a diesel com torque/RPM e câmbio automático de oito marchas e ré segura.
- Física revisada de massa/carga, suspensão, frenagem e direção.
- Câmeras, colisões, painel de instrumentos e volante funcionais; áudio reage ao RPM.
- Configurações do jogador persistentes.

## Estrada Viva
- Técnico e gerador do Núcleo 1; a ativação exige o gerador ligado.
- Postos, oficinas, estoque, combustível, compras, vendas e serviços.
- Emboscadas com perseguição, abalroamento, fuga e roubo de itens.
- Pontos de mapa, painel de interação, diário, HUD de perseguição e migração de saves.

## Verificação local
A instalação de dependências e a suíte completa não puderam ser executadas neste ambiente porque o registro do npm estava inacessível. Foram verificadas a sintaxe de 86 arquivos JavaScript/JSX, além de testes de fumaça para gerador, abastecimento, oficinas, emboscadas, limites de caminhada e migração/validação de saves.

Para a verificação completa no seu computador, execute:

```bash
npm install
npm test
npm run build
npm run test:e2e
```
