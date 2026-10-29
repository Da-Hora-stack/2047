# Checklist manual — Fase 1

Todos os itens abaixo estão **não verificados por uma pessoa**. Testes automáticos de movimento e colisão não substituem avaliação de sensação.

- [ ] Peso e inércia do Titã ao acelerar, fazer curva e frear; ajustar força, esterço e aderência se necessário.
- [ ] Curva larga de caminhão pesado, recuperação do volante e comportamento ao usar o freio de mão.
- [ ] Câmera externa: suavidade, leitura da estrada e ausência de desconforto em lombadas.
- [ ] Câmera interna: visibilidade do para-brisa e sensação de escala.
- [ ] Câmera livre: arrastar o mouse e aproximar/afastar com a roda.
- [ ] Colidir com a rocha a 11 m à direita e 32 m à frente; avaliar resposta e ausência de travamento.
- [ ] Sair do asfalto para terra e areia; avaliar diferença de aderência e suspensão.
- [ ] Dirigir os 3 km completos, atravessar as transições de setores e retornar ao abrigo.
- [ ] Ouvir o motor em marcha lenta/aceleração; avaliar volume, timbre e repetição.
- [ ] Verificar faróis com L e suspensão/rodas visíveis em movimento.
- [ ] Revisar legibilidade do HUD em um monitor real; navegação dos menus com teclado.
- [ ] Medir FPS em GPU integrada a 1920×1080, preset Médio. O SwiftShader dos testes não representa essa máquina.
- [ ] Avaliar arte e atmosfera em conjunto: paleta seca sem verde, silhuetas, materiais e escala.
- [ ] Verificar em Firefox e Safari; executar prolongadamente por pelo menos 30 minutos.

## Escopo
Exploração a pé, interação F, rádio narrativo, Sementes, manutenção, inventário, mapas e saves pertencem à Fase 2 ou posteriores e não foram declarados funcionais nesta fase.

# Fase 2 — avaliação humana ainda não verificada
- [ ] Completar a fatia em ritmo normal (estimativa de 10–15 min); cronometração humana ainda pendente.
- [ ] Parar e descer com F, olhar por pointer lock, correr/pular e verificar limites do abrigo/Núcleo.
- [ ] Receber a Semente, transferir peças/diesel e preparar radiador/suspensão antes de viajar.
- [ ] Percorrer as duas rotas inteiras: pavimento longo a leste e ondulações a oeste; avaliar legibilidade da bifurcação.
- [ ] Verificar visibilidade na tempestade, desgaste de filtros, consumo, superaquecimento e alertas de carga.
- [ ] Ouvir diesel, vento, estática e chuva em caixas/fones reais.
- [ ] Calibrar antes de uma tentativa arriscada e avaliar clareza da chance exibida.
- [ ] Observar chuva/plantas/céu/estrada liberada após ativar e após recarregar.
- [ ] Abrir INICIAR_JOGO.bat em Windows com Node LTS; o ambiente de teste é Linux.

# Fase 3 — avaliação humana ainda não verificada
- [ ] Reconhecer os 6 km completos e avaliar transição visual Mar de Cinzas → Leito Seco.
- [ ] Viajar por 20–30 min e avaliar ritmo de água, comida e fadiga, sem microgerenciamento.
- [ ] Conferir avisos antes de zerar reservas e recuperação após beber/comer.
- [ ] Entrar a pé na oficina e estação pela porta, testar paredes/colisões, salto e pointer lock.
- [ ] Negociar no posto de Mãe Ivani, testar preços/estoques/capacidade e descanso.
- [ ] Comparar radiador avariado e reparado no Leito Seco; parar e esfriar o motor antes de uma pane.
- [ ] Sair da rota de sal para a crosta instável, avaliar aderência e leitura visual.
- [ ] Confirmar que chuva e verde do primeiro Núcleo permanecem no Mar de Cinzas, sem restaurar o Leito Seco.
- [ ] Abrir um save da Fase 2 no pacote da Fase 3 e conferir preservação das decisões (migração automatizada também testada).

# Correção 0.3.1
- [ ] Confirmar F e botão de saída no Windows, com teclado real e o navegador em foco.
- [ ] Testar portas próximas a rochas, muros e terreno muito inclinado; a saída deve escolher espaço livre ou orientar a reposicionar.
- [ ] Confirmar atualização preservando local.db e cookies da instalação anterior.

# Fase 4 — avaliação humana ainda não verificada
- [ ] Percorrer os 21 km sem teleportes; avaliar diesel, peças, suprimentos e oportunidades de reabastecimento.
- [ ] Identificar os cinco biomas pelo para-brisa e os desvios a leste/oeste sem consultar coordenadas.
- [ ] Estacionar nas rampas mantendo Espaço até pressionar F; entrar/sair nas sete áreas de entrega e Cofres.
- [ ] Avaliar curvas/rampas da cordilheira, passagem na água, vento e visibilidade da frente.
- [ ] Conferir que Lia é reconhecível na Última Parada e que seus diálogos soam naturais.
- [ ] Conferir rádio, avisos, menu de missões e mapa em telas diferentes; sem revelar a identidade da Voz.
- [ ] Medir ~60 FPS em GPU integrada a 1080p; os testes SwiftShader não validam essa meta.
- [ ] Testar INICIAR_JOGO.bat no Windows e abertura desta conversa/GitHub no celular real.
- [ ] Abrir saves 0.2/0.3 reais no mesmo navegador e verificar inventários/decisões após salvar em 0.4.

# Reformulação realista — Fase 1 (0.5.0)
- [ ] Testar em Windows real: novo jogo em N/motor desligado, E para partida, W, frenagem S e ré após parada.
- [ ] Avaliar sensação de peso, progressão do acelerador, pressão do freio, retorno da direção e trocas automáticas no teclado real.
- [ ] Comparar viagem vazia/carregada, subidas/descidas, cascalho/areia e suspensão reparada/avariada.
- [ ] Conferir ergonomia dos instrumentos, volante e visibilidade em diferentes proporções de tela; também testar olhar na cabine.
- [ ] Avaliar ruído de partida, frequência do motor, trocas e freio de motor com caixas/fones reais. O teste headless só valida nós/valores do Web Audio.
- [ ] Medir desempenho em GPU real e 15/30/60/120 FPS reais. O teste automatizado varia o ritmo de frames simulado com passo fixo; não substitui a percepção humana.
- [ ] Fazer travessia humana completa dos 21 km para reequilibrar consumo/manutenção após a mudança da simulação.
- [ ] Conferir oclusão da câmera em muros, encostas, tetos baixos e posições muito próximas; a esfera considera colisores fixos, não todos os detalhes decorativos sem colisor.
