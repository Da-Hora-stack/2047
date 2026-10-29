> Especificação original de referência. O estado atual e as fases já realizadas estão em `STATUS_DO_PROJETO.md`. Não reinicie a Fase 1 nem avance de fase sem o pedido atual do usuário. Contém informações de roteiro para desenvolvimento.

# PROMPT MESTRE — 2047: REDE AURORA (versão final unificada)

---

## 0. COMO VOCÊ DEVE TRABALHAR (leia primeiro)

Você é uma equipe sênior de desenvolvimento de jogos 3D para navegador: game designer, desenvolvedor Three.js, desenvolvedor Next.js/JavaScript, especialista em física de veículos, level designer/environment artist, especialista em UX/UI de jogos e engenheiro de otimização WebGL.

Sua missão é desenvolver **"2047: Rede Aurora"**, um jogo 3D de sobrevivência pós-apocalíptica, **jogável e funcional** (movimentação, mecânicas reais, interatividade e progressão). Não é landing page, apresentação, protótipo estático nem demo técnica de Three.js.

**Regras de processo**

1. Trabalhe **diretamente nos arquivos de um repositório real**. Se não existir, crie `2047-rede-aurora/` e rode `git init`. Se existir, analise a estrutura, tecnologias e dependências antes de alterar qualquer coisa.
2. Desenvolva **uma fase por vez**. Comece **somente** pela Fase 1, mas construa a arquitetura pensando nas fases seguintes. Ao terminar uma fase, **pare**, entregue o relatório (seção 22) e aguarde minha autorização.
3. Antes de cada fase: defina a arquitetura necessária, divida o trabalho em tarefas objetivas e então implemente.
4. Faça um commit git por etapa verificada.
5. **Nada é "concluído" sem prova.** Prova = teste automatizado passando, saída real de comando ou screenshot gerado por teste headless. O que não puder ser verificado (ex.: sensação do volante) deve ser declarado "não verificado" e entrar em `CHECKLIST_MANUAL.md`.
6. **Nunca invente resultados de testes.** Mostre o comando e a saída relevante.
7. Não entregue exemplos isolados, pseudocódigo como funcionalidade, animações pré-renderizadas, imagem de fundo no lugar do mundo 3D, nem botões que apenas exibem mensagens no lugar de mecânicas.
8. Placeholders são permitidos **somente** se funcionais, e devem ser listados em `ASSETS_PENDENTES.md` com a indicação de substituição futura.
9. Não remova funcionalidades já operantes. Mantenha `npm run dev`, `npm run build` e `npm test` funcionando ao fim de cada etapa. Corrija erros de compilação e execução.
10. Se uma decisão técnica não estiver definida aqui, escolha a opção mais simples que funcione, registre em `DECISOES.md` e siga.
11. **Prioridade absoluta: qualidade real da experiência, não quantidade de funcionalidades declaradas.** Não avance para sistemas extensos antes de estabilizar controles, física, renderização e estrutura.

---

## 1. VISÃO E PILARES

**Gênero:** sobrevivência, exploração, aventura narrativa e simulação de veículos. **Modo:** single-player. **Plataforma:** navegador web (desktop como prioridade; adaptar a telas menores quando viável). **Perspectiva:** terceira pessoa com câmera de acompanhamento do caminhão, câmera interna e modo de exploração a pé. **Idioma do jogo:** português do Brasil, com todos os textos em `src/data/` prontos para tradução.

**Conceito:** atravessar um planeta destruído transportando a última esperança da humanidade. A experiência central **não é derrotar inimigos; é sobreviver à estrada e chegar ao destino**.

**Os três pilares (toda decisão de design, código e arte deve servi-los):**

> **O caminhão é o companheiro. A estrada é o desafio. A restauração é a recompensa.**

**Sensações-alvo:** solidão, vulnerabilidade, exploração, apego ao Titã, tensão, melancolia e esperança.

**Diferencial:** em outros survivals o mundo hostil permanece hostil. Aqui, a sobrevivência está ligada a **transformar o ambiente**. O jogador não explora só por recursos, mas para recuperar o que foi perdido; a restauração muda a experiência de explorar, não só a aparência.

**Referências (qualidades gerais, sem copiar mapas, interfaces, personagens ou modelos):** Subnautica (imensidão, descoberta), The Forest/DayZ (vulnerabilidade, estradas desoladas), Green Hell (consequências, mas sem burocracia), The Long Dark (solidão, ritmo contemplativo, arte estilizada), The Last of Us (narrativa ambiental), SnowRunner (peso do caminhão, terrenos difíceis, escolha de rota, sem a complexidade total), Pacific Drive (vínculo com o veículo, reparos), Death Stranding (carga frágil, importância do percurso), Rust (sucata, construções improvisadas).

---

## 2. STACK (obrigatória)

- **HTML5 + CSS3:** estrutura e estilo de menus, HUD e telas.
- **JavaScript ES2020+ (`.js`/`.jsx`), sem TypeScript.**
- **Next.js (versão estável atual, App Router):** aplicação, roteamento e backend.
- **Three.js + WebGL:** renderização, cenas, câmeras, luz, materiais, efeitos, animações e mundo.
- **API REST Web:** Route Handlers do Next.js, HTTP + JSON.
- **Física: Rapier** (`@dimforge/rapier3d-compat`) com `DynamicRayCastVehicleController`. Se inviável, registre em `DECISOES.md` e use modelo arcade próprio com raycasts de suspensão.
- **Persistência: libSQL (SQLite) via `@libsql/client`**, atrás de um módulo `repository` (o restante do código nunca importa o driver). Desenvolvimento: arquivo local (`file:local.db`). Produção (**deploy na Vercel**): **Turso**, via `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`. Não usar `better-sqlite3`, não gravar em disco no servidor, não guardar dados importantes só na memória do servidor. Incluir migração inicial e `npm run db:migrate`.
- **Testes:** Vitest (lógica) e Playwright (fumaça do navegador).
- Outras dependências apenas se justificadas em `DECISOES.md`; Three.js continua sendo o motor gráfico principal.

**Proibido:** TypeScript; Babylon.js, Unity, Unreal ou outro motor; jogo 2D; aplicativo desktop; dados fictícios simulando mecânicas que deveriam funcionar de verdade.

---

## 3. LORE OFICIAL (preservar nomes, relações e tom)

**O desastre de 2027.** Fragmentos de asteroide desencadearam tempestades de plasma por quase um ano. As cidades caíram, o mar recuou, a terra ficou estéril e quase tudo eletrônico parou. Em **2047 (vinte anos depois)** restam poucos milhões de pessoas, em abrigos que nem sabem se os outros ainda existem.

**A Rede Aurora.** Antes do desastre, cientistas construíram sete **Núcleos de Restauração**, dispositivos que, ativados **em sequência**, trazem a chuva de volta, limpam o solo e reacendem a atmosfera. Os Núcleos continuam de pé, desligados. Cada um precisa de uma **Semente de Ignição**: cilindro pesado e muito frágil.

**Regras internas da Rede (manter coerência):**
- Os Núcleos são **ressonadores atmosféricos**; sobreviveram por serem blindados e subterrâneos.
- A Semente é um **cristal de matriz de plasma**: seu retículo se desalinha com choque e vibração (por isso é frágil).
- A ativação é **em sequência** porque cada Núcleo usa o campo do anterior como âncora de fase; a ordem segue a rota.
- A restauração é **progressiva**: cada ativação recupera uma "faixa" da atmosfera.
- Eletrônica moderna falhou; **motores diesel totalmente mecânicos** continuam funcionando, por isso caminhões antigos são o transporte possível. Rádio de ondas curtas funciona (com interferência).

**Escala e geografia.** Os sete Núcleos formam um **arco dentro de um único continente**, que é o mundo jogável. Quando o sétimo é ativado, a restauração se propaga ao resto do planeta pela atmosfera (mostrado por rádio e pelo céu).

**Origem das Sementes.** Cada Núcleo tem um **Cofre de Semente**, blindado e subterrâneo, construído junto com ele. A sobrevivente do início traz a Semente do primeiro cofre. A Dra. Renata conhece a localização dos demais, e cada cofre tem um obstáculo próprio (mecanismo, acesso bloqueado, ocupação por Brutus, abrigo que cobra o acesso). **Conseguir a Semente é a missão que precede cada entrega.**

**O último transporte.** O protagonista é **Dante Rocha Negra**, caminhoneiro experiente que sobreviveu por estar num túnel durante as tempestades. Vive num barracão com o **Titã Rocha Clara**, caminhão de 2003 velho, barulhento e teimoso. Uma sobrevivente aparece com um mapa e uma Semente, dizendo que só ele e aquele caminhão chegam lá. **Dante não quer ser herói, mas é o único que tem o que precisa.**

**Fio condutor:** a viagem cruza regiões muito diferentes; as estradas estão quebradas e o jogador sempre escolhe entre o atalho perigoso e o caminho longo e seguro. Tudo é escasso (diesel, água, comida e peças funcionam como moeda; ninguém dá nada de graça). Os abrigos oferecem conserto, informação e missões extras; **quem você ajuda reaparece no mapa**. Quando um Núcleo é ativado, a região muda: volta a chover, aparece o verde, as estradas ficam mais seguras. O jogador vê o mundo renascer **pelo para-brisa**.

**Mensagem:** um motorista comum, um caminhão velho e muita teimosia bastam para recomeçar o mundo. Melancólico, mas com esperança. A estrada é solitária, o rádio chia (o chiado é a assinatura sonora da Voz) e a paisagem é só destruição, mas cada quilômetro rodado devolve um pouco de vida ao mundo.

### Personagens (nomes oficiais)

- **Dante Rocha Negra:** protagonista, caminhoneiro e sobrevivente.
- **Titã Rocha Clara:** caminhão de 2003, quase um segundo protagonista; cada peça trocada e cada pane faz parte da história da viagem.
- **Dra. Renata Final Boss:** última engenheira da Rede Aurora; orienta Dante por rádio de ondas curtas.
- **Mãe Ivani:** dona do maior abrigo-parada; informação, serviços e atalhos, tudo caro.
- **Brutus, vulgo Garcia:** líder de saqueadores que quer as Sementes; deve ter **motivo humano e conflito moral** (definido na Fase 5).
- **A Voz (apelido Lucas Ichiro Honda):** sinal misterioso no rádio que sabe onde Dante está e o que vem pela frente. **Não revelar a identidade antes do final.**

### Os quatro finais (condições; registrar flags desde a Fase 2)

- **Renascimento:** sete Núcleos ativados com sucesso e Titã funcional na entrega final. Dante vê **a primeira chuva em vinte anos**.
- **Renascimento parcial:** pelo menos um Núcleo falhou e não foi reativado; parte do mundo fica cinza para sempre.
- **Último destino:** sete Núcleos ativados, mas o Titã chega em estado crítico à entrega final **e** o jogador escolhe forçá-lo; Dante termina a viagem a pé.
- **Segredo da Voz:** a Voz é o próprio Dante, de outra linha do tempo, tentando garantir que dessa vez ele chegue. Exige coletar os **fragmentos da Voz** ao longo do jogo (possíveis em qualquer partida) e uma escolha final no 7º Núcleo. É **exclusivo** dos outros três.

Todas as escolhas e acontecimentos são registrados pelo sistema de progressão e salvos.

---

## 4. DIREÇÃO ARTÍSTICA (especificação de produção)

Objetivo: **indie 3D estilizado, com acabamento de pintura digital e foco em silhueta**. Mistura de concept art independente, ilustração digital, texturas de pintura manual e paleta limitada. **Não** hiper-realista, **não** com aparência genérica de IA.

*Histórico:* as capas anteriores foram rejeitadas por serem realistas demais e carregadas de elementos (caminhão, personagem, ruínas, tempestade, Núcleo futurista, tudo numa só composição). O mundo jogável deve traduzir a identidade das capas estilizadas para Three.js. A mensagem visual: **um caminhão velho, um planeta destruído, uma última viagem para salvar o mundo.**

**Paleta (hex orientativo):** chumbo `#4A4D52`, terra `#6B5844`, areia empoeirada `#B8A688`, laranja-ferrugem `#B4572B`, azul frio (sombras/céu) `#5E7A8C`, verde de restauração `#7E9A5B` (**somente** em áreas restauradas; sem verde antes disso). Dessaturada.

**Materiais:** `MeshStandardMaterial`, `roughness` 0,8–1,0, `metalness` ≤ 0,2. Sem aparência plástica ou brilhante.
**Texturas:** geradas em código via `canvas` (ruído, manchas de ferrugem, riscos, poeira acumulada nas bases) combinadas com vertex colors; aspecto de pintura manual, variação de tom por face, bordas levemente irregulares.
**Geometria:** formas marcantes, complexidade baixa a moderada, chanfros e perfis (`ExtrudeGeometry` com bevel, `LatheGeometry`, cilindros). **Proibido usar caixa pura como solução final** de qualquer objeto principal.
**Luz:** `HemisphereLight` fria + `DirectionalLight` baixa e quente (sol rasante), sombras suaves com câmera de sombra ajustada ao jogador. Sem neon.
**Atmosfera:** `FogExp2` por região, céu em gradiente (shader simples ou esfera com vertex colors), partículas de poeira **limitadas** (≈ 500, em `Points`). Céus dramáticos sem exagero.
**Pós-processamento:** no máximo vinheta e granulação leve. **Sem bloom.**
**Composição:** a estrada guia o olhar; detalhes ambientais posicionados com intenção (poste caído, tanque enferrujado no horizonte, carcaça de ônibus), nunca espalhados ao acaso. Cada região tem **uma silhueta dominante própria**. Vegetação inicialmente escassa, retornando conforme a progressão. O cenário comunica a história mesmo sem diálogos.

**Evitar:** hiper-realismo fotográfico, excesso de bloom/neon, cenários brilhantes demais, texturas plásticas, modelos genéricos sem identidade, paisagens repetitivas, excesso de elementos futuristas, detalhes sem propósito.

---

## 5. MUNDO 3D

Um continente em arco, **cinco biomas** conectados por estradas e rotas alternativas, com **sete Núcleos**. Cada bioma tem identidade **visual e mecânica própria** (não são só trocas de cor).

| Região | Identidade | Mecânicas | Núcleos |
|---|---|---|---|
| **Mar de Cinzas** | Planícies de poeira e cinzas | Tempestades de areia/cinzas, visibilidade reduzida, desgaste do motor, obstrução de filtros, estradas parcialmente soterradas, abrigos isolados | 1 |
| **Cidades Esqueleto** | Metrópoles destruídas | Viadutos quebrados, túneis parcialmente alagados, estradas bloqueadas, busca por diesel e peças, exploração a pé de estruturas acessíveis | 2 |
| **Leito Seco** | Fundo de oceano desaparecido | Planícies de sal, rotas de alta velocidade, superaquecimento do radiador, desorientação, poeira salina, áreas instáveis | 1 |
| **Cordilheira Vítrea** | Montanhas de rocha alterada pelo calor | Estradas estreitas, terreno escorregadio, rampas íngremes, perda de tração, quedas, problemas de transmissão/motor | 2 |
| **Zonas de Tempestade** | Plasma residual | Interferência no rádio, visibilidade variável, eventos climáticos perigosos, rotas imprevisíveis, preparação obrigatória | 1 |

**Construção:** terrenos 3D por heightmap com ruído e **seed fixa** (determinístico), materiais, vegetação, rochas, sucata, construções, pontes e estruturas industriais. **Carregamento por setores (chunks)**, sem renderizar o continente inteiro. Na Fase 1, uma grade 3×3 de setores basta. O mundo precisa transmitir sensação de jornada sem inviabilizar o projeto (mundo semiaberto, setores interligados, escala condensada onde necessário).

---

## 6. O TITÃ ROCHA CLARA

**Modelo 3D (procedural, sem copiar marcas):** caminhão diesel de trabalho dos anos 2000, com cabine alta de quina arredondada e robusta, para-brisa dividido, grade frontal com ferrugem, para-lamas amassados, pneus grandes com perfil e calotas, suspensão visível (eixos e molas respondem à física), tanque cilíndrico lateral, escapamento vertical com fumaça, carroceria adaptada ao transporte com travas e compartimento de carga, retrovisores, faróis **funcionais**, lataria desgastada. Peças externas (para-choque, retrovisor, escapamento) podem sofrer dano e se soltar. Na versão final, nunca um cubo ou provisório sem detalhes.

**Física e dirigibilidade (parâmetros iniciais ajustáveis em `src/data/config.js`):**
- Aceleração progressiva, frenagem, ré, direção, freio de mão, peso e inércia, atrito dos pneus, influência do terreno, suspensão simplificada, colisões, dano por impacto, velocidade máxima, superaquecimento, consumo de combustível.
- Alvo: 0→60 km/h em ~12 s sem carga e ~16 s com carga; velocidade máxima ~90 km/h em asfalto; raio de curva de caminhão pesado.
- Coeficientes de atrito iniciais: asfalto 1,0; terra 0,8; areia 0,55; sal 0,7; lama 0,45; rocha vítrea 0,6 (escorregadia quando molhada).
- **Passo fixo de 1/60 s** com acumulador; Three.js renderiza a interpolação; considerar delta time.
- Não precisa ser um simulador profissional, mas deve ser consistente, divertida e permitir dirigir com precisão.

**Manutenção (consequências reais).** Componentes com condição de 0 a 100%: motor, radiador, pneus, suspensão, transmissão, tanque de combustível, filtros, estrutura da carroceria. Efeitos mensuráveis, por exemplo:
- Radiador < 40% → temperatura sobe mais rápido (superaquecimento).
- Pneus < 40% → atrito × 0,8.
- Suspensão danificada → mais vibração da carga.
- Motor desgastado → falhas e perda de potência.
- Tanque danificado → consumo maior ou perda de diesel.
- Filtros sujos → perda de potência.

Reparo **emergencial** em campo (parcial, gasta peças) e **completo** em abrigos (gasta materiais/moeda de escambo). Interface de inspeção mecânica integrada ao jogo.

**Câmeras:** (1) externa atrás do caminhão, amortecida; (2) interna na cabine; (3) externa livre/orbitável. Transições suaves.

---

## 7. CONTROLES

Usar `event.code`. O **contexto de entrada** define o que cada tecla faz; teclas só funcionam quando apropriadas ao estado atual (dirigindo, a pé, menu).

| Contexto | Teclas |
|---|---|
| **Dirigindo** | W acelera · S freia/ré · A/D direção · Espaço freio de mão · C alterna câmera · **E liga/desliga motor** · **F sai do caminhão / interage** · M mapa · R rádio · Tab inventário · Esc pausa |
| **A pé** | WASD movimento · mouse (pointer lock) · Shift corre · Espaço pula · **F interage / entra no caminhão** |
| **Menu/UI** | Mouse e teclado; pointer lock desativado; Esc volta |

*Ajuste em relação ao rascunho original: o `E` fazia duas coisas (ligar motor e entrar no caminhão). Agora `E` só liga/desliga o motor e `F` entra/sai/interage.* Criar a alternância correta entre personagem e veículo. Registrar e remover listeners corretamente.

---

## 8. SOBREVIVÊNCIA, RECURSOS E INVENTÁRIO

**Recursos:** **diesel** (movimenta o caminhão), **água** (sobrevivência e certas manutenções), **comida**, **peças mecânicas** (reparos), **materiais recuperados** (trocas e melhorias).

**Equilíbrio:** a escassez importa, mas **sem microgerenciamento** que atrapalhe a exploração. Água e comida caem **lentamente e só durante a viagem**; nunca criam espiral de morte (ao zerar, penalidades graduais, com aviso prévio). Prioridade de pressão: diesel e peças.

**Inventário:** nome e ícone (SVG inline em estilo único), quantidade, peso/espaço, descrição, utilização, transferência para o caminhão.

**Sistemas complementares:** coleta, trocas com sobreviventes, compra e venda em abrigos, descanso, exploração de estruturas abandonadas, reparos de equipamentos.

**Exploração a pé:** é um sistema próprio (controlador de personagem, colisão, câmera). Nas Fases 1–2 limite-se a abrigo e Núcleo, com controlador simples; amplie nas fases seguintes.

---

## 9. SEMENTE DE IGNIÇÃO (carga principal)

Integridade de **0 a 100%**.

**Fórmula de dano (deve ser testável sem renderização):**
- Medir aceleração vertical e lateral **filtrada (passa-baixa)** na posição da carga.
- Dano **somente acima de uma zona morta**, crescendo de forma quadrática acima dela. **Movimentos normais não causam dano.**
- Colisões: dano proporcional à velocidade de impacto acima de um mínimo.
- Frenagem brusca: só acima de um limite de desaceleração.
- Teto de dano por segundo (evita perder tudo em um frame).
- Fontes: colisões, buracos, vibração excessiva, frenagens bruscas, acidentes, percursos agressivos.

**Ativação do Núcleo:** integridade ≥ 80% = sucesso garantido; entre 30% e 80% a chance cresce linearmente; < 30% = falha provável. **A chance é mostrada antes de acionar.** "Calibração" no Núcleo gasta peças e recupera parte da integridade. O jogador precisa entender os riscos e ter chances de preparar e reparar; nada de resultado arbitrário ou oculto.

**HUD:** indicador de integridade e alertas visuais e sonoros quando a carga estiver em risco.

---

## 10. OS SETE NÚCLEOS E A TRANSFORMAÇÃO DO MUNDO

Cada Núcleo possui: identificador, localização, região, estado de ativação, requisitos, Semente correspondente (e seu Cofre), etapa de restauração.

**Fluxo de ativação:** localizar o Núcleo → obter a Semente (Cofre) → transportá-la superando os obstáculos da região → estacionar na área de entrega → interagir com o mecanismo → (opcional) calibrar → iniciar a ativação → acompanhar as consequências.

**Transformação (alterações reais nos objetos, materiais, efeitos e estados do mundo 3D; nunca só uma mensagem):** céu menos opaco e névoa mais clara; chuva retornando (partículas + som); pequenas plantas surgindo e vegetação se expandindo (`InstancedMesh` com animação de crescimento); qualidade ambiental melhor; novas rotas liberadas e estradas mais seguras; sobreviventes reagindo. As transformações são **persistidas** no save.

---

## 11. NPCs, MISSÕES E DECISÕES

**Diálogo:** caixa estilizada, nome do personagem, retrato ou identificação visual, texto progressivo, opções de resposta, escolhas narrativas, aceitar ou recusar missões.

**Tipos de missão:** transporte de suprimentos, recuperação de peças, busca por sobreviventes, reparo de caminhos, investigação de sinais de rádio, negociação com abrigos, obtenção e entrega das Sementes.

**Escolhas morais (com mudanças perceptíveis em história, recursos, relações e possibilidades):** ajudar um abrigo ou preservar combustível; arriscar um atalho ou fazer a viagem longa; negociar com Brutus ou evitar o confronto; sacrificar uma peça do Titã para ajudar alguém. **Personagens ajudados reaparecem em outras regiões.** NPCs não são entregadores de tarefas repetitivas: têm motivações e participam da história.

---

## 12. RÁDIO

Rádio de ondas curtas dentro do caminhão, com interface própria, efeitos sonoros e **interferência que varia conforme região e fenômenos atmosféricos** (máxima nas Zonas de Tempestade). Funções: instruções da Dra. Renata, transmissões de sobreviventes, alertas de perigo, missões, pistas narrativas e interação com a Voz. **Não revelar antecipadamente a identidade da Voz.**

---

## 13. INTERFACE UX/UI

Interface de **jogo de sobrevivência**, nunca de dashboard administrativo ou site corporativo. Painéis com aparência de chapa/papel envelhecido na paleta da seção 4; tipografia sans condensada.

**Menu principal:** Novo jogo, Continuar, Carregar partida, Configurações, Créditos, Sair para o menu. **Cena 3D animada ao fundo**: o Titã estacionado numa paisagem devastada, com atmosfera, luz e animações discretas.

**HUD (limpo, legível, ocupando pouco da tela, contextual):** velocímetro e combustível sempre visíveis; temperatura do motor, condição do caminhão e integridade da Semente quando relevantes ou em alerta; objetivo atual; informações contextuais; indicador de interação.

**Outras telas:** mapa do mundo, inventário, manutenção do caminhão, registro de missões, rádio, configurações, pausa, conclusão de missão.

**UX:** navegação intuitiva por teclado e mouse, feedback claro, botões consistentes, animações discretas, identidade uniforme, **legendas, ajustes de volume, configurações gráficas** (Baixo/Médio/Alto), opção para daltonismo na fase de polimento.

---

## 14. API (Route Handlers, JSON)

| Método e rota | Função |
|---|---|
| `GET /api/game/config` | Configurações gerais |
| `GET /api/world/regions` | Regiões, identificadores e estados persistidos |
| `GET /api/game/missions` | Definições das missões |
| `GET /api/game/items` | Catálogo de recursos, materiais e peças |
| `GET /api/saves` | Lista os slots do jogador (necessário para "Carregar partida") |
| `POST /api/saves` | Cria partida |
| `GET /api/saves/[slot]` | Recupera partida |
| `PUT /api/saves/[slot]` | Atualiza o progresso |
| `DELETE /api/saves/[slot]` | Apaga o slot |

**Identidade:** cookie anônimo `playerId` emitido pelo servidor (`Secure`, `HttpOnly`, `SameSite`); cada save pertence a um `playerId`.
**Dados do save:** `schemaVersion`; posição do jogador e do caminhão; estado mecânico de cada componente; combustível e recursos; inventário; missões concluídas; decisões narrativas e flags; integridade das Sementes; Núcleos ativados; transformações do mundo; progresso geral.
**Qualidade:** validação de entrada, limite de tamanho do corpo, erros padronizados (`400` validação, `404` inexistente, `409` conflito de versão, `500` genérico sem vazar detalhes). **Sem requisições HTTP por frame**: a API só é usada para carregar dados, salvar (manual e checkpoint) e carregar.

---

## 15. ARQUITETURA

```text
2047-rede-aurora/
├── public/ (models, textures, audio, images)
├── src/
│   ├── app/            # page.js (menu), game/, settings/, api/**/route.js, layout.js, globals.css
│   ├── components/     # game/, hud/, menus/, ui/  (React finos, sem lógica de jogo)
│   ├── game/
│   │   ├── core/       # Game, loop de passo fixo + interpolação, estados, eventos
│   │   ├── input/      # mapeamento por event.code e contextos
│   │   ├── render/     # renderer, câmeras, luz, atmosfera, pós-processamento
│   │   ├── world/      # terreno, estrada, biomas, props, setores
│   │   ├── vehicle/    # modelo procedural, física do Titã, componentes mecânicos
│   │   ├── player/     # personagem a pé
│   │   ├── cargo/      # Semente: integridade, medição de vibração
│   │   ├── physics/    # integração Rapier
│   │   ├── survival/   # combustível, temperatura, recursos
│   │   ├── missions/   # missões, rotas, Núcleos, ativação
│   │   ├── narrative/  # diálogos, flags, rádio, finais
│   │   ├── audio/      # Web Audio procedural
│   │   └── persistence/# serialização, validação, cliente da API
│   ├── data/           # itens, missões, regiões, diálogos, config
│   └── lib/            # server: repository libSQL, validação, cookie playerId
├── tests/ (unit/ e e2e/)
├── CHECKLIST_MANUAL.md · DECISOES.md · ASSETS_PENDENTES.md · README.md
├── package.json · next.config.js
```

**Requisitos:**
- Separar renderização, física, entrada, áudio e regras de jogo; módulos reutilizáveis; sem componentes React gigantes nem lógica concentrada num arquivo.
- **O jogo roda fora do React.** React monta o `<canvas>` e a UI. A classe `Game` é criada em `useEffect` num componente `'use client'` carregado com `next/dynamic` e `ssr: false` (evita erros de SSR com WebGL).
- `dispose()` deve remover listeners, cancelar o `requestAnimationFrame`, liberar geometrias, materiais, texturas e renderer, e destruir o mundo Rapier.
- Estado de jogo em módulos puros (testáveis sem WebGL); o HUD lê o estado a ~10 Hz, não a cada frame.
- Expor `window.__GAME_DEBUG__` (somente fora de produção): leitura de posição, velocidade, combustível, integridade, FPS e nº de draw calls, com `setInput` e `teleport` para testes.

---

## 16. PERFORMANCE

Meta: **~60 FPS** em GPU integrada atual a 1080p no preset Médio (sem prometer em qualquer dispositivo); orçamento de **≤ 300 draw calls** e **≤ 500 mil triângulos** em tela. Implementar: carregamento progressivo, culling por frustum e setor, `InstancedMesh` para props repetidos, geometrias/materiais compartilhados, texturas otimizadas, LOD simples para objetos distantes, distância de renderização configurável, sombras de qualidade ajustável, partículas limitadas, escala de resolução configurável. Presets **Baixo, Médio e Alto**, persistidos em `localStorage`.

---

## 17. ÁUDIO

Sistema em **Web Audio procedural** (sem arquivos protegidos por direitos autorais): motor diesel (marcha lenta, aceleração, RPM acoplada à física), frenagem, pneus por terreno, vento, tempestades, chuva, ruídos mecânicos, rádio com estática, ambientes abandonados, música ambiente discreta. Iniciar o áudio após o primeiro clique no menu (política de autoplay). Qualquer arquivo final necessário entra em `ASSETS_PENDENTES.md`. A experiência sonora reforça a solidão.

---

## 18. FASES (cada uma termina com relatório e PARE)

### FASE 1 — Base jogável 3D (**comece aqui**, prioridade máxima)
1. Projeto Next.js com a stack e a estrutura da seção 15; scripts `dev`, `build`, `test`, `test:e2e`.
2. Menu principal em PT-BR com cena 3D animada (Titã estacionado no Mar de Cinzas); Continuar/Carregar podem ficar desabilitados até a Fase 2.
3. Mundo inicial: setores 3×3, terreno com ruído, estrada de asfalto quebrado (~3 km), abrigo improvisado, estruturas industriais no horizonte, neblina e céu conforme a seção 4.
4. Titã procedural completo (seção 6) com suspensão e rodas animadas.
5. Física Rapier: aceleração progressiva, freio, ré, direção, freio de mão, atrito por terreno (asfalto, terra, areia), colisões com o cenário.
6. Três câmeras com transição suave.
7. Motor liga/desliga com `E`; áudio procedural do motor.
8. HUD: velocímetro, combustível (consumo simples), temperatura, objetivo, indicador de interação, pausa.
9. `window.__GAME_DEBUG__`.

**Aceite (mensurável):** `npm run build` e `npm test` passam; teste Playwright abre `/`, clica em Novo jogo, mantém `W` por 8 s e verifica velocidade > 40 km/h, combustível reduzido, **nenhum erro no console**, FPS médio reportado e screenshot salvo; testes unitários de consumo de combustível e curva de atrito por terreno; itens de sensação (volante, câmera, colisão com rocha, sair da estrada) listados em `CHECKLIST_MANUAL.md`. **Não considere concluída se o caminhão apenas aparecer sem permitir dirigir.**

### FASE 2 — Ciclo central completo (fatia vertical, ~10–15 min)
Abrigo inicial → introdução narrativa de Dante → primeiro contato de rádio com a Dra. Renata → recebimento da Semente → preparação do Titã (reparo e abastecimento) → planejamento de rota → viagem pelo Mar de Cinzas (tempestade de poeira, filtros) → obstáculo significativo (estrada soterrada) → **escolha entre dois caminhos** (curto e perigoso × longo e seguro) → chegada ao Núcleo 1 → estacionar → calibrar (opcional) → ativação com chance visível → **transformação real do ambiente** → salvar e carregar via API.
Inclui: Semente com integridade e HUD, manutenção básica dos 8 componentes, consumo e danos, colisões, temperatura, inventário simples, recursos coletáveis, saída a pé limitada, API completa e testes de save/load.
**Aceite:** teste e2e que percorre a fatia usando `__GAME_DEBUG__` (teleportes permitidos), valida a mudança de estado do mundo e a recarga do save; checklist manual da fatia. **O jogador precisa administrar recursos para continuar viajando.**

### FASE 3 — Sobrevivência e exploração ampliadas
Água e comida, coleta ampliada, pontos de interesse, trocas em abrigos, exploração a pé de estruturas, superaquecimento no Leito Seco, mais terrenos.

### FASE 4 — Sistemas de mundo
Cinco biomas, sete Núcleos com Cofres de Semente, abrigos, trocas, NPCs, missões secundárias, rádio narrativo, eventos climáticos, transformações persistentes.

### FASE 5 — Narrativa e finais
Decisões importantes, consequências persistentes, desenvolvimento dos personagens, conflitos com Brutus, mistério da Voz, quatro finais, progressão narrativa completa.

### FASE 6 — Polimento
Refinamento artístico, melhorias do modelo do Titã, animações, efeitos sonoros, otimização, revisão de UX/UI, acessibilidade, testes, correção de bugs, **preparação e validação do deploy na Vercel** (variáveis do Turso, `next build` em produção, cookie `playerId` seguro).

---

## 19. TESTES E QUALIDADE

Após cada fase, verificar e **provar**: a aplicação inicia; o Three.js renderiza; a câmera acompanha; os controles respondem; colisões básicas funcionam; sem erros críticos no console; o loop roda sem travamentos; menus abrem e fecham; a API responde corretamente; dados persistidos são recuperados; `npm run build` compila.

- **Vitest** para regras sem renderização: consumo de recursos, dano, integridade da Semente, inventário, missões e serialização/validação do save.
- **Playwright** headless com WebGL por software (SwiftShader) para fumaça: carregar, simular teclas via `__GAME_DEBUG__`, capturar screenshot e conferir o console.
- **`CHECKLIST_MANUAL.md`** com os itens 3D que dependem de percepção humana.

---

## 20. RELATÓRIO AO FINAL DE CADA FASE

1. O que foi implementado. 2. Arquivos criados/alterados. 3. Comandos executados e saídas reais. 4. Testes e resultados. 5. Problemas existentes e itens **não verificados**. 6. Como executar o projeto. 7. Próximos passos propostos.

---

## 21. O QUE NÃO PODE SER ALTERADO SEM JUSTIFICATIVA

O nome 2047 e a Rede Aurora; o desastre de 2027; o cenário de 2047; Dante Rocha Negra; o Titã Rocha Clara como caminhão e personagem; as Sementes de Ignição; os sete Núcleos; a recuperação ambiental como consequência da progressão; a escassez e a manutenção; a exploração de estradas destruídas; os personagens principais e suas funções; o mistério da Voz; as escolhas com consequências; os quatro conceitos de final; a atmosfera de melancolia e esperança; o desenvolvimento 3D para navegador com a stack obrigatória. Melhorias são bem-vindas desde que preservem o conceito.

---

## 22. PRINCÍPIO CENTRAL E RESULTADO ESPERADO

**2047: Rede Aurora é uma jornada sobre recuperar a esperança em um mundo que já desistiu de sobreviver.** Dante não salva o mundo por ser soldado, cientista ou herói predestinado: ele tem um caminhão que ainda funciona, conhece a estrada e decide continuar dirigindo. O Titã não é só um veículo; as estradas não são só caminhos entre objetivos; a restauração não é só recompensa visual.

Ao abrir o jogo, o jogador deve ver uma estrada antiga atravessando um território devastado, céu carregado, estruturas industriais no horizonte e o Titã parado perto de um abrigo improvisado. Pode observar o ambiente, entrar no caminhão, ligar o motor e viajar; a câmera acompanha, o motor responde, o rádio transmite, o combustível diminui, a estrada irregular afeta o caminhão, e o cenário se estende além de uma pequena área de demonstração, com um objetivo concreto.

**A primeira experiência deve parecer o início de um verdadeiro jogo indie de sobrevivência em 3D, e não uma demonstração técnica do Three.js.**

**Comece agora pela FASE 1.**