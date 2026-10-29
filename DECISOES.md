# Decisões — Fase 1

## Reformulação realista — Fase 1 (pedido de 29/10/2026)

O novo pedido substitui a direção artística estilizada e estabelece outro roteiro de seis fases. Esta entrega executa somente a Fase 1 da reformulação: diagnóstico e condução. O continente e as funcionalidades 0.4.0 são preservados; a antiga Fase 5 narrativa não será iniciada por engano.

1. Capturar uma referência reproduzível da física 0.4.0 e conferir as APIs oficiais de Rapier/Three.js instaladas. Manter Rapier DynamicRayCastVehicleController e passo fixo 1/60 s.
2. Separar parâmetros, curva de torque/RPM, transmissão automática e forças do veículo. Aplicar massa real da Semente/estoque/combustível, resistência por terreno, arrasto, freio de motor e freio de serviço com unidades físicas. Converter força de frenagem em impulso por passo, conforme a API Rapier.
3. Introduzir troca com interrupção breve de torque, histerese e engate seguro da ré. A entrada do acelerador responde imediatamente; embreagem/conversor e massa explicam a partida progressiva. Controlar esterçamento pela aceleração lateral permitida e amortecimento de suspensão pela condição mecânica/carga.
4. Corrigir a ordem controlador → passo Rapier → leitura/interpolação. Medir passos/tempo descartado; pausar ao ocultar a aba. Conferir 15/30/60/120 FPS simulados e rampas com Rapier real.
5. Integrar instrumentos 3D de RPM, velocidade, marcha, diesel e temperatura; volante, movimento secundário da cabine derivado da física e áudio dirigido por RPM/trocas. Câmeras com colisão por varredura de esfera, olhar na cabine e distância ajustável.
6. Preservar saves 1–3, exploração F, missões, economia e os sete Núcleos. Rodar regressões/unitários/build/navegador, capturar cenas reais, registrar limites, fazer commits e atualizar o GitHub já autorizado. Entregar relatório antes da Fase 2 da reformulação.

Poly Haven/PBR, remodelagem exterior completa, iluminação realista/ciclo solar e reconstrução ambiental são a próxima fase. Esta fase não declara materiais baixados nem o caminhão final realista. Nenhuma dependência nova é necessária para corrigir a simulação.

Fontes consultadas: https://rapier.rs/javascript3d/classes/DynamicRayCastVehicleController.html (força das rodas, impulso de freio e suspensão), https://rapier.rs/javascript3d/classes/RigidBody.html (massa adicional/inércia), tipos oficiais da versão instalada 0.21.0 e https://threejs.org/docs/pages/Raycaster.html. Documentação Next local lida antes da integração React.

## Fase 4 — arquitetura e tarefas antes da implementação
1. Catálogo único dos cinco biomas, sete Núcleos/Cofres, rotas, abrigos, personagens, suprimentos e missões secundárias. Regras puras de sequência, custos, tentativas, clima e restauração por faixa.
2. Preservar o trecho de 6 km das versões anteriores: o Leito Seco inicial passa a ser uma enseada de reconhecimento. A rota principal segue pelas Cidades Esqueleto, retorna ao Leito Seco, sobe a Cordilheira Vítrea e termina nas Zonas de Tempestade. Escala condensada de aproximadamente 21 km, sem carregar o continente inteiro.
3. Gerar estruturas/colliders por proximidade e terreno na janela 3×3. Biomas têm silhuetas e desafios físicos distintos: bloqueio/água urbana, calor/sal instável, rampas/aderência vítrea e frentes atmosféricas com bloqueios/interferência. Desvios físicos oferecem alternativas; restaurar remove obstáculos e reduz a pressão regional.
4. Save schemaVersion 3 aceita/migra versões 1 e 2, mantém o estado da primeira entrega e registra os demais Cofres, integridades, Núcleos, missões, estoques e relógio climático. Estado de progresso continua na API/libSQL, sem HTTP por frame.
5. Integrar objetivos, mapa, diálogos, rádio e ações contextuais; manter F/saída do caminhão da correção 0.3.1. Custos e recompensas são transações com capacidade e sem duplicação.
6. Verificar regras e API, executar os sete transportes via e2e (teleportes apenas para encurtar deslocamentos), comprovar transformações e recarga, executar regressões/build, registrar relatório e commits por etapa verificada. Atualizar o GitHub autorizado e parar antes da Fase 5.

Os conflitos morais completos, revelação da Voz e quatro finais permanecem na Fase 5. A sétima ancoragem encerra os sistemas de mundo desta fase sem escolher um final pelo jogador.

## Arquitetura e tarefas (antes da implementação)
1. Preparar Next.js App Router, JavaScript, Vitest e Playwright. Validar o esqueleto e fazer commit.
2. Implementar regras puras: consumo, terreno determinístico e passo fixo. Integrar Rapier DynamicRayCastVehicleController, modelo procedural, mundo em janela 3×3, câmeras e áudio. Verificar e fazer commit.
3. Integrar menu/HUD/configurações/pausa e diagnóstico. Verificar os aceites em navegador e build. Corrigir falhas e fazer commit.
4. Registrar evidências, limitações e checklist; entregar somente a Fase 1.

- Next.js estável obtido do registro npm, sem TypeScript; React só monta o canvas e a UI.
- Unidades SI (1 unidade = 1 metro), eixo vertical Y; caminhão aponta para -Z; física a 1/60 s com interpolação visual.
- Mundo em grade móvel de nove setores de 1.024 m. Estrada com ~3 km, com faixa inicial retilínea para aprender os controles. Seed fixa 2047, props intencionais e compartilhados por instância.
- Semente, inventário, NPCs, restauração e saves jogáveis pertencem à Fase 2+. Nenhum botão finge executá-los. API de configuração e repositório libSQL/migração preparados nesta fase; sem emissão de saves antecipada.
- Deploy na Vercel fica na Fase 6 conforme o roteiro. Sem adaptação para outro runtime de hospedagem.
- Áudio integralmente procedural, iniciado pelo clique em Novo jogo. Qualidade gráfica persistida apenas no navegador; não são dados de progresso.
- Geometrias e texturas procedurais são arte funcional autoral de primeira passagem. Revisão de arte e sensação humana permanecem no checklist.

## Parâmetros consolidados e verificações
- Novo jogo começa na cabine com o motor já ligado, para cumprir o aceite W por oito segundos. E continua sendo exclusivamente a ignição. Entrada/saída a pé (F) está reservada à Fase 2.
- Rapier é inicializado por uma Promise compartilhada para evitar reinicializar a memória WASM durante a montagem duplicada do React StrictMode.
- O acumulador aceita até 30 passos por frame (0,5 s), mantendo o passo de 1/60 s. Isso evita desacelerar artificialmente a simulação em renderizadores lentos. Suspensão de aba pausa o jogo, e o limite ainda impede recuperação ilimitada.
- A força de tração é negativa no controlador porque o modelo aponta para -Z; não há aplicação paralela de movimento por teleporte durante a condução.
- Superfície da estrada e terreno têm colisores reais. A aderência do controlador depende da posição e da velocidade.
- Geometrias estáticas são unidas por material. Rochas têm LOD próximo/distante, props usam instâncias e seus buffers são descartados quando o setor sai da janela.
- O Three.js atual removeu PCFSoftShadowMap; usamos PCFShadowMap com filtragem, sem bloom.
- Medições em SwiftShader são evidência de execução por software, sem inferir desempenho de GPU integrada. A meta de ~60 FPS a 1080p continua não verificada.
- Semente/integridade são null no diagnóstico da Fase 1; nenhum valor inventado simula uma carga ainda não recebida.

# Fase 2 — arquitetura antes da implementação
1. Campanha pura e testável: recepção da Semente no abrigo, preparo, planejamento, transporte, calibração/ativação, flags e restauração. Integridade mede aceleração filtrada, impactos e frenagem com zona morta e teto por segundo.
2. Mecânica dos oito componentes e inventário com custos reais. Controlador Rapier a pé, com colisão, corrida, salto e F contextual. Atividades a pé limitadas ao abrigo e ao Núcleo nesta fase.
3. Mundo: barreira de areia na rodovia, desvio pavimentado longo à direita e atalho irregular à esquerda; tempestade, desgaste de filtros, Núcleo e restauração física com chuva/vegetação e liberação da estrada.
4. Persistência: repository libSQL, identidade anônima via cookie HttpOnly/SameSite e Secure em HTTPS/produção, validação estrita, tamanho máximo 128 KiB e revisão otimista. Saves somente por requisições explícitas e checkpoints.
5. Interface de jogo: diálogo, rádio, mapa, inventário/transferência, manutenção, mecanismo, saves/carregamento e alertas. Textos em src/data. Preservar as três câmeras e a condução existentes.
6. Verificar regras/API/fluxo e2e com Rapier/WebGL, screenshots e build; commit por etapa verificada. Entregar ZIP com iniciador Windows e parar antes da Fase 3.

- Novo jogo continua ao volante com motor ligado. F permite descer com o caminhão parado; o contato narrativo acontece no abrigo ao lado. A rodovia pode ser explorada antes de receber a carga.
- Desenvolvimento local usa libSQL em file:local.db e cria o schema idempotentemente na primeira operação. Produção exige Turso. Nenhum progresso importante depende da memória do processo.
- Para conciliar o cookie Secure com localhost HTTP no Windows, Secure será obrigatório em produção/HTTPS e desativado somente no desenvolvimento HTTP. Cookie de identidade é assinado pelo HMAC do servidor quando SAVE_COOKIE_SECRET é configurado; sem segredo, usa UUID de alta entropia, sem expor conteúdo de outros jogadores.

# Fase 3 — arquitetura e tarefas (autorização de início automático após a Fase 2)
1. Adicionar módulo puro survival/expedition: hidratação, saciedade e fadiga; queda lenta apenas quando há viagem, penalidades graduais limitadas, sem morte ou espiral. Consumo de itens, descanso, estoque e custos reais de trocas.
2. Expandir o terreno/rodovia até 6 km com Leito Seco explorável, material de sal, ambiente quente, radiador sob pressão e áreas de menor aderência. A extensão é reconhecimento opcional; não pula a sequência dos sete Núcleos, nem cria Núcleos/biomas completos da Fase 4.
3. Três pontos de interesse com construção acessível e colisões, suprimentos coletáveis a pé, posto de Mãe Ivani com troca/descanso e registros persistidos. Ampliar somente as zonas de exploração próximas dessas estruturas.
4. Save schemaVersion 2: aceitar/migrar schemaVersion 1 da Fase 2, normalizar campos novos ao carregar, preservar todas as flags anteriores. Testar regressão da fatia, viagem e save/load dos recursos/estoques/coletas.
5. HUD/menus em PT-BR, testes unitários e e2e, capturas, build, relatório e commit. Entregar pacote atualizado pelo Drive já autorizado. Parar antes da Fase 4.

- Leito Seco é um ramo de reconhecimento após o primeiro Núcleo, sem antecipar entregas da sequência principal. Regiões restantes ficam como definições; não são declaradas construídas.
- Os estoques de comércio e os contêineres têm quantidades finitas e estado salvo. Nada reaparece ao fechar uma interface ou recarregar a partida.
- Comida/água são consumidas por decisão do jogador, repondo medidores; comida/água de manutenção e escambo competem pelos mesmos itens físicos.

## Correção 0.3.1 — saída do caminhão
- Relato do usuário na versão 0.3.0: F não mostrou resposta. A revisão encontrou uma restrição de saída por área que o HUD não comunicava, além do risco de criar o personagem fora do limite de caminhada.
- O Titã parado agora permite descer em qualquer trecho para circular num raio de 24 m ao redor dele. As áreas maiores de abrigo/Núcleo/estruturas permanecem; não foi iniciada a Fase 4.
- O indicador F também é um botão real. Enquanto o Titã se move, mostra a instrução de segurar Espaço para parar. A checagem de velocidade e a mesma ação são compartilhadas entre teclado e botão.
- A saída testa cinco posições ao redor da cabine com raycast e interseção de cápsula no Rapier, evitando criar Dante dentro de obstáculos. Se todas falharem, há mensagem para reposicionar o caminhão.
- Um save antigo que deixe Dante fora do limite permite caminhar de volta ao Titã. Schema e dados do save permanecem compatíveis.

- A regressão de frenagem também reproduziu rolamento residual com Espaço pressionado. O freio de estacionamento agora corta tração, aplica frenagem dianteira assistida abaixo de 3,2 m/s e mantém aderência em baixa velocidade. Um teste Rapier em inclinação de 1,5% protege essa imobilização; o teste de navegador verifica frear e descer.

## Ajustes de integração da Fase 4
- Carregar uma partida distante e o teleporte de diagnóstico preparam os nove setores/colliders antes de retomar a física, evitando uma queda durante a troca de região. A condução normal continua com streaming de um setor por frame.
- O objetivo inicial permanece a obtenção da primeira Semente, mesmo se o jogador explorar além de 3 km. A mensagem de fim da antiga demonstração não se aplica ao continente da Fase 4.
- Migração reconhece um Núcleo legado marcado ativo/falho com contador zero como uma tentativa, formato antes aceito pela validação; não altera o arquivo original.
- Nas rampas, segure Espaço enquanto pressiona F. O teste de travessia espera a suspensão assentar antes de conferir a parada, em vez de usar o zero instantâneo do teleporte como evidência de estacionamento.

### Integração da condução
- Novo jogo começa ao volante, com motor desligado e caixa em N. E liga o motor; W engata D e acelera. Isso substitui o arranque automático do aceite antigo, conforme a nova experiência de partida pedida. Saves antigos preservam o campo engineOn original.
- RPM/marcha são estados derivados: ao carregar uma partida parada, a caixa retorna a N e o motor assume o estado salvo. Não é necessário alterar schemaVersion 3 ou perder partidas.
- O freio de motor corta a tração ao soltar o acelerador. Sem esse corte, a cauda do filtro do pedal continuava empurrando o caminhão durante o início da desaceleração.
- A câmera interna acompanha a posição/orientação da cabine; apenas o olhar local e a transição de câmera são suavizados, evitando que o banco fique para trás durante a viagem.

- Se o Titã estiver em N mas rolando para a frente, W seleciona uma relação compatível com a velocidade. A segurança contra engatar o sentido contrário permanece; não é preciso parar um caminhão que já segue no sentido solicitado para sair do neutro.
