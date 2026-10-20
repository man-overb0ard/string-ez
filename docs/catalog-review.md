# Revisão do catálogo de raquetes — 20/10/2026

O acesso HTTPS aos fabricantes foi restabelecido. As cinco linhas solicitadas foram consultadas nas páginas oficiais e incluídas com padrão e tamanho da cabeça explícitos em `src/rackets.ts`. Cada modelo conferido guarda o URL da ficha em `source`; seus valores não são derivados do padrão genérico do catálogo antigo.

## Linhas solicitadas

| Marca / linha | Modelos incluídos | Padrão | Cabeça (pol²) | Fonte oficial |
| --- | --- | --- | --- | --- |
| Wilson Defyer V1 | 98 Pro | 16 × 20 | 98 | [Ficha](https://www.wilson.com/en-us/products/defyer-98-pro-v1-tennis-racket-wr21530) |
| Wilson Defyer V1 | 100, 100L, 100UL | 16 × 19 | 100 | [Família](https://www.wilson.com/en-us/collections/defyer-tennis-rackets) |
| Tecnifibre Fire | 305S | 16 × 19 | 98 | [Ficha](https://www.tecnifibre.com/products/fire-305s) |
| Tecnifibre Fire | 300, 285, 270, 255 | 16 × 19 | 100 | [Família](https://www.tecnifibre.com/collections/raquettes-de-tennis-fire) |
| Tecnifibre Fire | 260 OS | 16 × 19 | 110 | [Ficha](https://www.tecnifibre.com/products/fire-260-os) |
| Yonex MUSE | 98 | 16 × 18 | 98 | [Ficha](https://www.yonex.com/tennis/racquets/muse-98) |
| Yonex MUSE | 100, 100L, 100SL | 16 × 18 | 100 | [Família](https://www.yonex.com/tennis/racquets/muse) |
| Yonex MUSE | 107 | 16 × 18 | 107 | [Ficha](https://www.yonex.com/tennis/racquets/muse-107) |
| HEAD Squared | Squared | 16 × 18 | 100 | [Ficha](https://www.head.com/en_US/product/squared-232606) |
| Diadem Axis | 98 | 16 × 20 | 98 | [Ficha](https://diademsports.com/products/axis-98) |
| Diadem Axis | 100, Team | 16 × 19 | 100 | [Axis 100](https://diademsports.com/products/axis-100), [Team](https://diademsports.com/products/axis-team) |

São 19 variantes técnicas nas cinco famílias. A Axis 98 de assinatura/cor especial não foi tratada como outra configuração técnica.

## Complementos e correções da revisão

- Wilson **RF 01**: RF 01, Pro e Future, todos 98 pol² e 16 × 19. [Coleção oficial](https://www.wilson.com/en-us/collections/tennis-roger-federer). As três fichas estão registradas no código.
- Pro Kennex **Q+**: adicionados 5 Pro (100 pol², 16 × 20), 20 (110 pol², 16 × 19) e 30 (119 pol², 16 × 19). As fichas também confirmaram 5 (100, 16 × 20), 15 (105, 16 × 19), Tour (98, 16 × 19) e Tour Pro atual (98, 18 × 20). Ki e Q+ continuam separadas. [Navegação oficial](https://prokennex.com/), [Tour Pro](https://prokennex.com/products/q-tour-pro), [Q+30](https://prokennex.com/products/q-31).
- Babolat **Pure Aero 98**: corrigido o padrão para 16 × 20, em vez do 16 × 19 que o registro antigo herdava. [Ficha Gen9](https://www.babolat.com/us/pure-aero-98-gen9-unstrung/101567.html).
- O cálculo aceita a cabeça verificada de 119 pol² da Q+30; isso não valida a faixa de tensão de fábrica nem transforma a densidade aproximada em uma medição de launch angle.

## Alcance da conferência

Foram consultadas as páginas das cinco marcas solicitadas, a coleção RF da Wilson, as fichas Q+ da Pro Kennex, o catálogo Babolat e a listagem atual da Dunlop em https://dunlopsports.com/en-gb/tennis/rackets. O site https://princetennis.com/ encaminha a compra para um varejista externo; não foi feita revisão integral desse catálogo.

Essa revisão cobre os registros explícitos acima. Não certifica exaustividade de todas as marcas, linhas recreativas, modelos juniores, edições cosméticas ou gerações anteriores. Os registros antigos sem `source` continuam precisando de revisão individual. A aplicação permanece sem validação automática de faixa de tensão do fabricante.

## Validação

Build, lint e testes das variantes, padrões, áreas de cabeça e preservação dos modelos antigos passaram. No Chromium, as 19 variantes solicitadas foram selecionadas, com supressão da pergunta de padrão único; um fluxo completo por família confirmou que os padrões e áreas chegam aos resultados e às explicações de tensão. Também foram conferidos o resumo copiado, a Q+30 e layouts de 320, 390 e 1440 px.
