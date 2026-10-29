# Reformulação realista — roteiro vigente

Resumo operacional do novo pedido do usuário, de 29/10/2026. A conversa contém o texto completo. Este roteiro substitui a direção artística e a ordem de trabalho do prompt estilizado histórico; não reinicia o projeto nem apaga os sistemas já entregues.

## Direção e stack
- Realismo ambiental de simulador pós-apocalíptico; Euro Truck Simulator 2 e SnowRunner são referências funcionais, sem copiar assets, modelos, mapas ou interfaces proprietárias.
- Preservar Next.js/App Router, JavaScript, Three.js/WebGL, API REST e módulos fora do React. Rapier e libSQL existentes são mantidos. Nada de TypeScript ou substituição do motor.
- O caminhão é o companheiro, a estrada é o desafio e a restauração é a recompensa. Preservar nomes/lore, sete Núcleos em sequência, Sementes frágeis, escassez, personagens e os quatro conceitos de final. O segredo da Voz fica fora da interface até o momento narrativo apropriado.
- Preservar o continente/rotas, sobrevivência, inventário, manutenção, NPCs, missões, exploração e saves 1–3 existentes. Refinar progressivamente a qualidade; não declarar essas funcionalidades recriadas do zero.

## Fases atuais
1. **Diagnóstico e condução**: passo fixo, forças/massa, curva de torque/RPM, câmbio automático, direção, freios, suspensão e câmeras. Instrumentos/áudio ligados ao veículo. Entrega 0.5.0; consultar relatório antes de prosseguir.
2. **Reformulação gráfica**: arquivos reais Poly Haven/PBR, terreno, estradas, iluminação, ambiente, exterior/interior do Titã e desgaste. Materiais locais com qualidade mensurável, sem filtros exagerados.
3. **Primeira região completa**: refinar o Mar de Cinzas com rotas, posto, oficina, abrigo, POIs, clima, obstáculos e recursos.
4. **Survival/exploração**: validar/refinar os sistemas existentes de recursos, danos, manutenção, inventário, interação e NPCs.
5. **Primeira entrega completa**: estabilizar a fatia recebimento → preparo → rotas → transporte → estacionamento → Núcleo → transformação → persistência.
6. **Expansão**: melhorar as demais regiões/Núcleos, desenvolver narrativa, decisões, personagens e finais após estabilizar a base.

Ao finalizar cada fase, entregar resumo, arquivos modificados, assets instalados, sistemas funcionais, testes/resultados, capturas reais, problemas, pendências e próxima etapa. Não declarar concluído o que não foi implementado/verificado. Fazer commits por etapa verificada.

## Poly Haven — obrigação da Fase 2

Usar https://polyhaven.com, API https://api.polyhaven.com e documentação https://github.com/Poly-Haven/Public-API. Oito materiais obrigatórios:

| ID | Aplicação |
| --- | --- |
| road_damaged_2 | Rodovia danificada |
| gravel_road | Cascalho |
| mud_cracked_dry_03 | Solo rachado |
| dirt | Solo/trilhas/acostamentos |
| rocky_terrain_03 | Relevo rochoso |
| rusty_metal_05 | Sucata/ferrugem |
| rust_coarse_01 | Metal deteriorado |
| corrugated_iron | Telhados/oficinas/abrigos |

- Criar script Node que confira existência, consulte `/files/{id}`, selecione mapas/resolução, baixe URLs efetivamente retornadas, valide arquivos e gere manifesto. Evitar novo download de arquivos válidos. Registrar falhas e continuar com o disponível, sem anunciar instalação que falhou.
- Priorizar 2K, permitir 4K apenas com orçamento. Não baixar 8K/16K indiscriminadamente. Manter arquivos em `public/assets/polyhaven/{id}`; jogo usa arquivos locais, sem chamadas ao Poly Haven por sessão/frame.
- Base color em sRGB; normal/roughness/metalness/AO/height como dados. Preferir normal OpenGL. Conferir canais de ARM/ORM, UV/AO conforme o Three instalado, escala física/repetição, anisotropia e descarte/cache.
- Misturar terreno por relevo/inclinação/solo/distância da via/região; evitar uma única textura para tudo. Buracos grandes têm geometria/collider, não só normal map. Física/visual devem concordar.
- Registrar origem CC0 dos assets e cumprir termos/crédito da API. Materiais não são instalados por apenas colocar seus nomes no código.

## Requisitos visuais e funcionais seguintes
- Titã detalhado: exterior/chassi/rodas/eixos/grade/tanque/luzes/espelhos/estribos/carga; pintura preservada e desgaste por máscaras, borracha/vidro/metal distintos. Cabine reconhecível com instrumentos reais, volante e suspensão; retrovisores refletivos quando viável. Sem aceitar poucas caixas como modelo final.
- Sol/sombras/ambiente/HDRI quando viável, exposição e espaços de cor corretos; ciclo manhã/meio-dia/entardecer/noite, nuvens e clima que influenciem condução/exploração. Sem bloom/contraste excessivo.
- Estradas modulares com curvas naturais, acostamentos, erosão, pontes/viadutos, buracos, sinais e alternativas. Cinco biomas distintos em geometria, materiais, perigos e mecânicas. Streaming, instâncias, LOD, culling, texturas/qualidade/distância configuráveis e descarte de recursos.
- Controles sem conflitos, remapeamento e gamepad quando viável, câmeras com suavização/colisão, instrumentos/navegação coerentes com a lore. Navegação futura deve usar a rede de vias e estimar riscos/custos, sem GPS global sem justificativa.
- Áudio original/licenciado e dinâmico; consumo/mecânica/carga/entrega conectados. Backend persiste progresso, não comanda cada frame. Saves/decisões/restauração recuperáveis após reiniciar.
- Validar lógica/física em diferentes ritmos de frames, assets, API, build, console, colisão e persistência. Screenshots são da renderização real, não arte promocional. Sensação humana/hardware não acessível deve permanecer no checklist manual.
