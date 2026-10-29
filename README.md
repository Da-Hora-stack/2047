# 2047: Rede Aurora

Jogo 3D de navegador em JavaScript, Next.js, Three.js e Rapier. Versão atual: **0.5.0 — Fase 1 da reformulação realista: condução**. O mundo, a sobrevivência e a Rede com sete Núcleos da versão 0.4 foram preservados.

## Condução 0.5.0

Novo jogo começa ao volante com **motor desligado e caixa em N**. Pressione **E** para ligar; **W** engata avanço e acelera. **S** freia em movimento; parado, segure S por um breve intervalo para engatar ré. Em ré, W freia antes de permitir o retorno ao avanço. **Espaço**, mantido pressionado, é o freio de estacionamento; mantenha-o até pressionar **F** para descer. F também permite entrar e interagir.

O motor agora tem curva de torque, RPM, oito marchas automáticas, ré e freio de motor. A carga acrescenta massa/inércia reais ao Rapier. Cascalho/areia/sal/rocha têm resistências distintas; o esterçamento é limitado com a velocidade. Desgaste de suspensão, pneus, motor, transmissão e temperatura afetam o comportamento.

A cabine tem instrumentos 3D ligados ao veículo: velocidade, RPM, diesel, temperatura e marcha, com volante animado. C alterna acompanhamento, cabine e órbita livre; arraste o mouse para olhar/orbitar e use a roda para zoom nas câmeras externas. As câmeras externas respeitam colisores do cenário. Nas configurações é possível ajustar resposta da direção, distância externa e movimento da cabine. A câmera interna permanece no banco durante o deslocamento.

Parâmetros de simulação: `src/data/truck-tuning.js`. Benchmark reproduzível: `node scripts/benchmark-drive.js --output evidence/reformulation-1/driving-0.5.0.json`. Relatório: [RELATORIO_REFORMULACAO_FASE_1.md](RELATORIO_REFORMULACAO_FASE_1.md). Roteiro vigente: [docs/REFORMULACAO_REALISTA.md](docs/REFORMULACAO_REALISTA.md).

**Direção artística atual: realismo ambiental**, substituindo a especificação estilizada antiga. A reforma gráfica com arquivos reais do Poly Haven, remodelagem externa completa, estradas/terreno e iluminação é a Fase 2 deste novo roteiro. Nesta entrega foram corrigidos condução/câmeras e instrumentos; nenhum asset externo foi instalado. As seções e relatórios abaixo registram as fases históricas e as funcionalidades preservadas.


## Fase 4 — Um continente em resposta (0.4.0)

A rota tem 21 km em escala condensada: Mar de Cinzas → Cidades Esqueleto (dois Núcleos) → Leito Seco → Cordilheira Vítrea (dois Núcleos) → Zonas de Tempestade. A enseada de sal dos km 3,2–5,8 permanece para preservar o trecho explorável das versões anteriores.

Depois do Núcleo 1, siga o objetivo do HUD. Localize o Cofre, estacione a até 35 m, desligue o motor, desça mantendo Espaço pressionado até usar F e procure o mecanismo. Os custos vêm do compartimento do Titã. Transporte a Semente até a área de balizadores do Núcleo seguinte, desligue o motor e use o terminal. O mapa mostra a sequência e os desvios; J abre o caderno de missões, R abre o boletim e as transmissões.

Cada Semente exige a ancoragem anterior. Os seis Cofres seguintes têm custos/mecanismos próprios; o sétimo exige radiador e filtros a pelo menos 50% e transmissão a 40%. Falhas preservam a carga para calibração e nova tentativa. A chance é visível e fica garantida a partir de 80% de integridade.

Lia (km 6), Afonso (km 10,2) e Noêmia (km 12,8) oferecem missões secundárias com custos e recompensas; Joel recebe viajantes no km 17,8. Os quatro abrigos têm comércio e estoque próprio. Depósitos próximos aos Cofres têm suprimentos finitos. Recompensas respeitam o limite da mochila/compartimento. Lia reaparece na Última Parada após receber ajuda; a bomba e o repetidor mudam a travessia e o rádio.

Os desafios alteram a condução: viaduto bloqueado, túnel com água/arrasto e risco ao motor, sal instável/calor, rampas e menor aderência na cordilheira, frentes com rajadas/interferência e fragmentos que fecham a passagem central. Os arcos a leste são vias físicas; selecioná-los no mapa não teleporta o caminhão. A restauração remove os bloqueios, drena o túnel, melhora a atmosfera e faz crescer vegetação por faixa. O relógio climático avança só durante o jogo e é salvo; menus o pausam.

Saves 1 e 2 são carregados e atualizados para schemaVersion 3, preservando a primeira entrega, inventários, coletas e decisões. O novo formato registra os sete Núcleos, Cofres/Sementes, comércio, missões e clima. A sétima ancoragem não escolhe um dos quatro finais: narrativa e finais são a Fase 5.

O projeto está no repositório privado https://github.com/renataaap/2047. Consulte [CONTINUAR_NO_CELULAR.md](CONTINUAR_NO_CELULAR.md) para retomar esta conversa em outro aparelho e [STATUS_DO_PROJETO.md](STATUS_DO_PROJETO.md) para o estado do desenvolvimento.

## Correção 0.3.1 — descer do Titã

Com o caminhão parado, pressione **F** ou clique no botão **F · Descer do caminhão** na tela. Em movimento, segure **Espaço** para frear antes de descer. Agora é possível circular até 24 m ao redor do Titã em qualquer trecho; abrigos, Núcleo e estruturas mantêm suas áreas maiores de exploração. Para entrar, aproxime-se do caminhão e use F ou o botão correspondente.

Para atualizar no Windows: feche o terminal da versão antiga antes de iniciar a nova. Extraia o ZIP corrigido numa pasta nova e confira **0.5.0** no menu. Se já tem saves, copie os arquivos **local.db** e, se existirem, **local.db-wal** e **local.db-shm** da pasta antiga para a nova, sem apagar os originais, e use o mesmo navegador e endereço http://localhost:3000.

## Windows
1. Instale Node.js LTS em https://nodejs.org.
2. Extraia o ZIP inteiro e abra a pasta que contém package.json.
3. Dê dois cliques em **INICIAR_JOGO.bat**. Na primeira execução, a instalação usa Internet e pode levar alguns minutos.
4. O iniciador abre http://localhost:3000 depois de o servidor responder. Mantenha a janela aberta enquanto joga. Se o navegador não abrir automaticamente, acesse esse endereço manualmente.

A execução do arquivo .bat em Windows ainda requer verificação humana; os comandos internos foram usados no ambiente Linux de desenvolvimento.

## Instalação manual / Linux / macOS

```sh
npm ci
npm run db:migrate
npm run dev
```

Requer Node.js 20.9+ (verificado com 24.19.0) e navegador desktop com WebGL2. Abra http://localhost:3000.

## Primeira viagem

Novo jogo começa ao volante com o motor desligado, caixa em N e diesel na reserva. E liga o motor; W engata avanço. Pare, pressione F e caminhe até a sobrevivente no abrigo. F abre o diálogo; aceite a Semente. Transfira diesel e peças ao compartimento do Titã pelo inventário, abasteça e repare radiador/suspensão. M abre as rotas: desvio pavimentado a leste, atalho irregular a oeste. No Núcleo, estacione no retângulo de balizadores, desligue o motor, desça e use o terminal. Confira a chance e calibre se precisar. A primeira ativação não permite avançar fora da sequência dos sete Núcleos.

| Tecla | Ação |
| --- | --- |
| W / S, A / D | Acelerar/frear/ré e direção; a pé, caminhar |
| Espaço | Freio de mão; a pé, pular |
| Shift | Correr a pé |
| F | Descer parado, entrar ou interagir com alvo próximo |
| E | Motor (somente dirigindo) |
| C | Externa → cabine → livre |
| Arrastar / roda do mouse | Orbitar / zoom na câmera livre |
| Clique no mundo / mouse | Olhar a pé, com pointer lock |
| L | Faróis |
| M / R / Tab / V / H | Mapa / rádio / inventário / inspeção / sobrevivência |
| Esc | Pausa / voltar |

A pausa contém salvar/carregar, ajustes, resgate e retorno ao menu. Resgate cobra diesel e integridade para não devolver recursos consumidos. Ajustes gráficos/volume/legendas são locais; progresso usa API e libSQL.

## Fase 3 — reconhecimento e sobrevivência

Após a primeira ancoragem, siga ao sul. A estrada/rota tem 6 km: o Leito Seco começa perto do km 3,2. Essa extensão é reconhecimento opcional; as entregas seguintes da Rede continuam na sequência, a implementar na Fase 4.

- H abre hidratação, saciedade e fadiga. Água/comida caem devagar apenas em viagem; beber/comer gasta itens reais. A falta de suprimento reduz o vigor gradualmente, sem morte instantânea. Menus e caminhão parado não esgotam os medidores.
- Oficina abandonada no km 1,65 (oeste), posto de Mãe Ivani no km 3,48 (oeste) e estação meteorológica no km 5,1 (leste). Pare perto, desça com F, entre pela porta e use F no alvo no interior.
- Mãe Ivani troca materiais por diesel, água, comida e peças; também compra peças e oferece descanso com custo. Os estoques são finitos e salvos.
- Suprimentos coletados vão para a mochila (40 kg). Se encher, volte ao lado do Titã, use Tab e transfira itens ao compartimento (240 kg). Coletas não reaparecem ao recarregar.
- No Leito Seco, sal reduz aderência, crosta instável é ainda mais escorregadia e calor sobrecarrega o radiador. Reduza a velocidade, repare e use água no radiador; pare com o motor desligado para esfriar.
- Saves schemaVersion 1 (Fase 2) são migrados para schemaVersion 2 ao carregar, com sobrevivência e estoque inicializados. Flags e decisões anteriores são preservadas.

## Testes e produção

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
# Alternativa com Chromium de sistema:
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

Em produção, configure TURSO_DATABASE_URL (libsql:// ou https://) e TURSO_AUTH_TOKEN antes de `npm start`. Disco local é recusado em produção. SAVE_COOKIE_SECRET pode assinar o cookie anônimo (use segredo aleatório forte e estável). HttpOnly e SameSite=Strict sempre; Secure em HTTPS/produção. No localhost HTTP de desenvolvimento, Secure fica desativado para funcionar no Windows.

O banco file:local.db é criado no projeto, atrás de src/lib/repository.js, e deve ser preservado para continuar partidas locais. Não vem no ZIP; não substitua seu banco ao instalar uma atualização. O GitHub guarda o projeto e o histórico, mas não transfere partidas locais entre computadores. O cookie identifica o dono: apagar cookies ou trocar localhost por 127.0.0.1 muda a identidade e pode ocultar seus slots. Use sempre o mesmo navegador e endereço.

GET /api/game/config, /api/game/items, /api/game/missions, /api/world/regions?slot=1; GET/POST /api/saves; GET/PUT/DELETE /api/saves/[slot]. Limite 128 KiB; erros padronizados; revisão otimista. Não há HTTP por frame: API apenas para catálogo/listagem, carregar e salvar manual/checkpoint.

O jogo roda fora do React. Passo fixo 1/60 s, interpolação, HUD 10 Hz, janela móvel 3×3, instâncias e LOD. window.__GAME_DEBUG__ existe somente em desenvolvimento. Cada fase tem relatório com provas e limitações. Consulte CHECKLIST_MANUAL.md, DECISOES.md e ASSETS_PENDENTES.md. Sessões humanas longas, sensação dos controles e ~60 FPS em GPU integrada a 1080p permanecem não verificados.
