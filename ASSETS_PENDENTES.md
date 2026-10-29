# Assets pendentes — Fase 1

Nenhum arquivo remoto é necessário para rodar. As geometrias, texturas e o áudio existentes são funcionais, produzidos em código.

| Asset funcional atual | Substituição/refinamento futuro |
| --- | --- |
| Titã procedural com cabine chanfrada, vidros, grade, rodas com sulcos, molas/eixos, tanque, retrovisores, faróis e caçamba | Revisão artística de proporções e desgaste localizado; para-lamas mais orgânicos e peças externas destacáveis nas fases de danos/polimento |
| Ruído, riscos, ferrugem e poeira em CanvasTexture | Pintura por peça, poeira acumulada nas bases e maior variação de face na revisão de arte |
| Abrigo aberto, reservatório elevado e ruínas industriais procedurais | Interiores exploráveis e narrativa ambiental detalhada nas fases de mundo |
| Motor diesel e vento em Web Audio | Refinar timbre de diesel, marcha e ruídos mecânicos por escuta humana; rádio, tempestade, chuva e música em fases posteriores |
| Rochas instanciadas de baixa complexidade | Conjuntos de rochas com silhuetas regionais distintas na expansão do continente |

Não há imagens de fundo substituindo o mundo 3D, animações pré-renderizadas ou marcas de caminhão copiadas.

## Fase 2
- Sobrevivente representada por avatar procedural funcional (cápsula, cabeça, tecido), com diálogo real. Retrato/gestos/voz humana permanecem para polimento.
- Núcleo 1 e terminal feitos de geometrias procedurais; modelo funcional de primeira passagem, a refinar artisticamente.
- A Semente possui cilindro, tampas e berço reais, com estado de integridade e consequências. Refinar pintura e efeitos de cristal no polimento.
- Placas de bifurcação são silhuetas sem texto sobre a geometria; o mapa e o rádio identificam as direções. Pintura de sinalização e detalhes de percurso permanecem pendentes.

## Fase 3
- Oficina, posto e estação são estruturas procedurais com entrada, paredes, cobertura, piso, colisão e interação no interior. Refinar interiores, objetos de história e pintura regional no polimento.
- Mãe Ivani usa avatar procedural de primeira passagem; estoque, preços e descanso são reais. Retrato, atuação e voz final pendentes.
- Leito Seco inclui material de sal, planície baixa, crosta instável e costelas de casco encalhado como silhueta. É uma extensão de reconhecimento; cidades intermediárias, demais Núcleos e continente completo permanecem para a Fase 4.

## Fase 4
- Cofres blindados, ressonadores, depósitos e quatro abrigos têm modelos procedurais funcionais; substituir/refinar mecanismos, sinalização e silhuetas em revisão artística. Não há animação humana final ou vozes gravadas.
- Ruínas urbanas e torres residuais usam instâncias; montanhas são heightmap e rochas estilizadas. Refinar viadutos, montanhas, transições e interiores na Fase 6 sem remover colisores/rotas funcionais.
- Chuva, vegetação e alterações atmosféricas são reais; qualidade perceptiva do crescimento e diferenças entre as faixas ainda exigem avaliação humana.

## Reformulação realista — Fase 1 (0.5.0)
A nova direção realista substitui a especificação estilizada anterior. As listas anteriores são históricas.

- Instalados nesta fase: **nenhum asset externo**. Instrumentos usam geometrias e texturas Canvas originais; áudio continua procedural, agora ligado a RPM/trocas. Isso não equivale a materiais Poly Haven ou gravações reais.
- Fase 2 obrigatória: baixar pela API oficial, validar e integrar arquivos locais dos IDs road_damaged_2, gravel_road, mud_cracked_dry_03, dirt, rocky_terrain_03, rusty_metal_05, rust_coarse_01 e corrugated_iron, começando em 2K.
- Criar downloader idempotente e manifesto com URLs efetivamente retornadas por /files/{id}, hashes, resolução, dimensões e créditos/termos. Conectar corretamente mapas de cor e dados, normais OpenGL, UVs, escala física e AO.
- Remodelar exterior do Titã, máscaras de pintura/desgaste, pneus/vidros e espelhos com reflexão quando viável. A cabine atual ficou oca e ganhou instrumentos funcionais, mas não é o modelo final realista.
- HDRI, ciclo solar, céu/nuvens, terreno/estradas modulares, mistura PBR e reconstrução inicial são próximos passos do novo roteiro.
- Remapeamento completo de teclas, gamepad, transmissão manual e áudio gravado/licenciado continuam pendentes; não foram anunciados como implementados nesta fase.
