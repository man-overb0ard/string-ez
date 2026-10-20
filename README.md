# String EZ

Aplicação mobile-first em português para explorar encordoamentos de tênis. React + TypeScript + Vite, sem backend, cadastro, chave de API ou custo de IA.

## Desenvolvimento

Node.js 24 e npm 11.

```sh
cd /workspace/string-ez
npm ci --cache /workspace/.npm-cache
npm run dev -- --host 0.0.0.0
```

```sh
npm run build
npm run lint
npm test
```

## Fluxo

Boas-vindas → marca → linha → modelo → padrão, quando necessário → nível → full bed/híbrido → tipo de corda e tensão atuais → fatores a preservar → objetivo → desconforto → três configurações → copiar resumo.

- A seleção única avança ao toque ou à ativação pelo teclado. Voltar permite revisar e selecionar novamente a mesma resposta.
- A tensão é uma cartela de **30 a 60 lb**, só com inteiros. Não há kg, slider nem valor pré-selecionado. Tocar no número avança; voltar preserva o número.
- Full bed coleta um tipo de corda e uma tensão. Híbrido coleta tipos e tensões independentes para mains (verticais) e crosses (horizontais). Os cabeçalhos distinguem as direções por texto, setas e cores. Trocar a configuração limpa as respostas dependentes.
- Antes do objetivo, é possível marcar vários fatores a preservar. Continuar confirma a seleção. “Nada em especial” é exclusivo e permite seguir sem fatores a preservar.
- As respostas permanecem em memória até recarregar; não são enviadas a serviços externos.

## Recomendações

`src/recommendations.ts` contém o catálogo de cordas e regras determinísticas. Não existe integração com ChatGPT.

Cada opção informa marca/modelo, material, calibre, full bed ou híbrido, cordas por direção, tensão sugerida em lb, comparação com a atual, motivos, pontos a preservar e concessões. O resumo copiado contém os mesmos detalhes.

As configurações recebem classificações qualitativas internas por fator. O objetivo tem peso 5; cada fator a preservar, peso 2. Há uma preferência pequena por manter configuração/material. Iniciantes e pessoas com desconforto recebem apenas configurações sem poliéster. Em alguns perfis de full bed, uma das três opções explora o híbrido. A ordenação é determinística, não é uma previsão de desempenho nem uma medição de laboratório.

A tensão parte do histórico informado por direção. As regras consideram objetivo, material anterior e proposto, conflito entre conforto/controle e padrão 18 × 20. Ao propor full bed após híbrido, a referência é a média arredondada das tensões atuais; híbridos preservam referências separadas. As sugestões ficam entre 30 e 60 lb e explicam quando esse limite afeta o ajuste. Histórico inválido não gera tensões inventadas.

**Limites:** a faixa de tensão do fabricante de cada raquete ainda não está validada. Os números são pontos de teste que precisam de confirmação do encordoador e do fabricante. O catálogo de cordas é inicial, sem preços, estoque ou consulta em tempo real. As regras e classificações precisam de revisão de um especialista antes de lançamento público. Nenhuma recomendação trata lesões. Não existe garantia de preservar simultaneamente fatores em conflito.

## Catálogo de raquetes

`src/rackets.ts` inclui Yonex, Babolat, Head, Wilson, Prince e Pro Kennex. Não há opções “não sei”: a identificação exige marca, linha e modelo do catálogo. Modelos de padrão único pulam a pergunta; variantes oferecem os padrões cadastrados. Trocar marca, linha ou modelo limpa o padrão anterior. Algumas variantes abrangem gerações diferentes: ainda é necessário revisar e segmentar por ano. Marca/modelo identificam a raquete, mas não fornecem uma validação de tensão neste protótipo.

## Validação

Os testes em `tests/recommendations.test.ts` cobrem configurações únicas, produtos/tensões, filtros por dor/experiência, influência dos fatores preservados, transição para híbrido, cálculo por direção, limites, histórico inválido e padrões de raquetes. O teste combinado percorre 480 perfis.

O fluxo foi validado em Chromium com telas mobile e desktop, incluindo seleção múltipla, cartela, voltar, resumo e clipboard. O projeto pode futuramente ser empacotado com Capacitor para Android/iOS; isso ainda não está implementado.
