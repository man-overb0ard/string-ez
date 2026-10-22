# Integração da planilha TWU

## Origem e reprodução

Arquivo fornecido pelo usuário: **Tennis Warehouse DB.xlsx**, incorporado em 22/10/2026. A planilha não informa a data dos ensaios; a data de incorporação não significa atualização dos testes. O SHA-256 do XLSX está em `data/twu/import-report.json`. Não houve consulta ao vivo à TW University.

`data/twu/source.json` preserva cabeçalho e valores das 788 linhas de dados, sem metadados pessoais do arquivo Excel. `data/twu/model-map.json` explicita a correspondência dos nomes originais com o catálogo do app. O mapeamento não agrupa Soft, Round, Rough ou Power no produto original. Diferenças de nomenclatura como RPM Rough / RPM Blast Rough e Touch VS / VS Touch estão registradas por nome completo, sem busca aproximada em tempo de execução.

Para reconstruir os arquivos normalizados e o módulo usado no navegador, na raiz do repositório:

```sh
python scripts/import_twu.py
```

O importador usa apenas a biblioteca padrão de Python. Gera `data/twu/normalized.json`, `data/twu/import-report.json` e `src/twuData.ts`. Preserva o arquivo original de valores e nunca executa texto de células.

## Cobertura e qualidade

- 788 registros e 787 nomes distintos na origem; o nome repetido Diadem Solstice Pro 16L (1.25) fica fora dos dados de execução, sem escolher arbitrariamente uma das linhas.
- 94 dos 107 modelos do app mapeados; 199 registros utilizáveis por variante, na condição **51 lb / Fast**. Os demais modelos continuam elegíveis com estimativas.
- Campo nominal de calibre precisa estar entre 1,00 e 1,60 mm. Valores como 0, 16, 1275 e 1251 são colocados em quarentena. Só há recuperação quando o nome original contém uma medida explícita em mm; nunca se converte 16/17/18 automaticamente.
- Diâmetro medido (`Gauge Acutal`) não substitui calibre nominal. Valores como 315 e 38 são isolados; os demais campos válidos da linha não são descartados por esse erro.
- Ausências e `NA` viram `null`, nunca zero. Perdas estáticas ou de estabilização fora de 0–51 lb são isoladas (por exemplo, 641,65 e −617,26 lb). Elas não entram na classificação.
- Verificações de plausibilidade não comprovam que todo valor restante esteja correto. As linhas, nomes e valores de origem continuam disponíveis para revisão.

As variantes medidas complementam o catálogo de calibres. Um ensaio histórico não comprova estoque atual ou equivalência entre gerações. Na referência inicial, 79 modelos encontram ensaio no calibre de referência e 99 têm ao menos um calibre conhecido; a cobertura efetiva depende do calibre e da cor selecionados.

## Uso na pontuação

A escolha contextual do calibre ocorre **antes** de ordenar as recomendações. Só se usa uma medida quando modelo e calibre nominal coincidem. Uma Mach-10 1,30 mm não fornece medições para a versão 1,25 mm. A cor explícita também é respeitada: o ensaio Poly Tour Pro Yellow 1,25 não é atribuído a uma preferência Preta. Quando a cor do registro não é informada, essa limitação permanece no nome de origem.

As quatro notas abaixo são proxies relativos, não notas diretamente medidas pela TWU:

| Fator do app | Medida usada | Conversão |
|---|---|---|
| Conforto relativo | Rigidez dinâmica, lb/in | Menor rigidez → maior nota relativa |
| Manutenção de tensão | Perda de tensão, % | Menor perda → maior nota relativa |
| Spin | Índice de potencial de spin do ensaio | Maior índice → maior nota relativa |
| Snapback | Atrito corda/corda (COF) | Menor atrito → maior nota relativa |

Conversão linear para a escala 1–5, com limites calculados dos valores válidos do arquivo completo na mesma condição. Atualmente: rigidez 74,3–314,3; perda 9,6–68%; índice de spin 1,2–11,9; COF 0,057–0,314. Fórmula crescente: `1 + 4 × (valor − mínimo) / (máximo − mínimo)`; fatores inversos usam `1 + 4 × (1 − fração)`. A nota é limitada a 1–5 e arredondada a duas casas. O mapeamento linear é uma decisão editorial, não validação científica da escala.

Em empate de pontuação, dá-se preferência à maior cobertura de medições para os objetivos e fatores a preservar informados. Não há bônus genérico por marca ou simples presença de uma linha no banco; só contam métricas correspondentes às prioridades. Sem medidas, o candidato continua elegível. Uma estimativa ainda pode superar uma opção medida; a procedência fica visível no resultado.

Se falta uma medida, preserva-se a nota editorial apenas daquele fator. Potência, controle, pocketing, preço e resistência ao rompimento continuam qualitativos: retorno de energia não equivale a potência em quadra, tempo de contato não equivale à sensação subjetiva de pocketing, e perda de tensão não mede tempo até romper. O índice de spin e o atrito são relacionados, não evidências independentes de resultado em quadra. O banco não informa preços no Brasil.

## Híbridos e limites

Cada direção consulta o ensaio correspondente à sua corda/calibre. A combinação de notas continua sendo uma aproximação editorial de 65% verticais / 35% horizontais; o preço usa a menor nota dos dois componentes. Não há medição do híbrido montado nem coeficiente de atrito entre cordas diferentes. Esse limite aparece no cartão e no texto copiado.

Os valores numéricos exibidos são exclusivamente os ensaios a 51 lb/Fast. Não há interpolação/extrapolação para as tensões recomendadas, swings lentos, outros calibres ou cores. Rigidez menor e tensão reduzida não demonstram segurança clínica para quem relata dor.

As três restrições permanecem: tripa natural exige uso atual; iniciantes somente full bed (poliéster elegível); opção 03 identificada como custo-benefício. Os modelos sem dados não são excluídos. A geração de novas três opções e a exclusão acumulada de configurações continuam funcionando.

## Validação

Testes verificam fonte, quarentena, correspondência exata de variantes, separação de cores, ausência de empréstimo de medidas de outro calibre, preenchimento parcial por estimativas, utilização das notas no ranking e procedência no texto copiado. A suíte também percorre perfis, restrições, calibres e esgotamento das alternativas. Os textos antigos que afirmavam ausência total de medições foram atualizados.
