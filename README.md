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
- A tensão usa um teclado numérico no estilo telefone, com dígitos de 0 a 9, apagar e confirmar. Aceita inteiros de **30 a 69 lb**, sem valor pré-selecionado. Também permite digitar pelo teclado e confirmar com Enter; voltar preserva o número.
- Full bed coleta um tipo de corda e uma tensão. Híbrido coleta tipos e tensões independentes para mains (verticais) e crosses (horizontais). Os cabeçalhos distinguem as direções por texto, setas e cores. Trocar a configuração limpa as respostas dependentes.
- Antes do objetivo, é possível marcar até três fatores a preservar, com contador e bloqueio de novas escolhas ao atingir o limite. Continuar confirma a seleção. “Nada em especial” é exclusivo e permite seguir sem fatores a preservar.
- As respostas permanecem em memória até recarregar; não são enviadas a serviços externos.

## Recomendações

`src/recommendations.ts` contém o catálogo de cordas e regras determinísticas. Não existe integração com ChatGPT.

Cada opção informa marca/modelo, material, calibre, full bed ou híbrido, cordas por direção, tensão sugerida em lb, comparação com a atual, motivos, pontos a preservar e concessões. O resumo copiado contém os mesmos detalhes.

As configurações recebem classificações qualitativas internas por fator. O usuário escolhe um ou dois objetivos, combinados com o mesmo peso. A média das classificações dos objetivos tem peso 5; cada fator a preservar tem peso 2. Há uma preferência pequena por manter configuração/material. Iniciantes recebem apenas configurações sem poliéster. Desconforto físico aumenta o peso do conforto, mas permite até uma alternativa com poliéster em tensão reduzida, acompanhada de pelo menos duas opções sem poliéster. Em alguns perfis de full bed, uma das três opções explora o híbrido. A ordenação é determinística, não é uma previsão de desempenho nem uma medição de laboratório.

A tensão parte do histórico informado por direção. As regras consideram objetivo, material anterior e proposto, conflito entre conforto/controle e padrão 18 × 20. Ao propor full bed após híbrido, a referência é a média arredondada das tensões atuais; híbridos preservam referências separadas. As sugestões ficam entre 30 e 69 lb e explicam quando esse limite afeta o ajuste. Histórico inválido não gera tensões inventadas.

**Limites:** a faixa de tensão do fabricante de cada raquete ainda não está validada. Os números são pontos de teste que precisam de confirmação do encordoador e do fabricante. O catálogo de cordas é inicial, sem preços, estoque ou consulta em tempo real. As regras e classificações precisam de revisão de um especialista antes de lançamento público. Nenhuma recomendação trata lesões. Não existe garantia de preservar simultaneamente fatores em conflito.

## Catálogo de raquetes

`src/rackets.ts` inclui Yonex, Babolat, Head, Wilson, Prince, Pro Kennex, Tecnifibre, Dunlop e Diadem. Não há opções “não sei”: a identificação exige marca, linha e modelo do catálogo. Modelos de padrão único pulam a pergunta; variantes oferecem os padrões cadastrados. Trocar marca, linha ou modelo limpa o padrão anterior. Algumas variantes abrangem gerações diferentes: ainda é necessário revisar e segmentar por ano. Marca/modelo identificam a raquete, mas não fornecem uma validação de tensão neste protótipo.

## Validação

Os testes em `tests/recommendations.test.ts` cobrem configurações únicas, produtos/tensões, filtros por dor/experiência, influência dos fatores preservados, transição para híbrido, cálculo por direção, limites, histórico inválido e padrões de raquetes. O teste combinado percorre 600 perfis.

O fluxo foi validado em Chromium com telas mobile e desktop, incluindo seleção múltipla, teclado de tensão, voltar, resumo e clipboard. O projeto pode futuramente ser empacotado com Capacitor para Android/iOS; isso ainda não está implementado.

## Identificar marca e modelo da corda atual

Em cada seleção de tipo de corda, “Quero especificar” abre marca → modelo. O catálogo em `src/stringCatalog.ts` inclui Solinco, Yonex, Babolat, Tecnifibre, HEAD, Signum Pro, Robin Söderling (RS), Luxilon, Wilson, Prince, Kirschbaum, MSV, Dunlop e Tourna. É um catálogo inicial de identificação, não um ranking de vendas, nem garantia de disponibilidade no Brasil. Ele não cobre todos os modelos, anos e calibres.

O material é identificado pelo modelo para o cálculo das recomendações. A marca/modelo atual entra no resumo e no texto copiado; o motor ainda não usa medições específicas de rigidez de cada produto. No híbrido, mains e crosses têm seleções independentes. Trocar tipo limpa marca/modelo; trocar marca limpa modelo; selecionar novamente a mesma opção preserva o preenchimento. O caminho simplificado por material continua disponível.


O teclado de tensão tem três colunas: 1–9 nas primeiras linhas e apagar, 0 e confirmar na última. O visor aceita até dois dígitos e só permite avançar com valores entre 30 e 69 lb. Tensões de mains e crosses são independentes; ao voltar, o valor confirmado é restaurado. As cores seguem o tema selecionado, incluindo o modo noturno.

As linhas adicionadas ao catálogo de raquetes são Tecnifibre T-Fight, TF40, TF-X1 e Tempo; Dunlop CX, SX e FX; Diadem Elevate e Nova. As variantes de padrão seguem o fluxo condicional, incluindo TF40 305/315 e CX 200 Tour. O catálogo continua inicial e não diferencia todas as gerações.


## Dois objetivos e ângulo de saída

A etapa de melhoria é uma seleção de um ou dois objetivos, com confirmação. `src/preferences.ts` centraliza as opções e as restrições. Tanto nos fatores a preservar quanto nos objetivos, “Ângulo de saída baixo” e “Ângulo de saída alto” se substituem: não é possível escolher ambos no mesmo grupo. Prioridades opostas entre preservar e melhorar são permitidas e explicitadas como conflito nos resultados.

Ângulo de saída é a inclinação inicial da trajetória ao deixar as cordas; não equivale a spin. As classificações e ajustes são heurísticas, não medições dos produtos. A regra testa +2 lb para buscar saída mais baixa e −2 lb para mais alta, antes de ajustes de material, preferências, perfil e limites. Com dois objetivos, usa a média dos ajustes. Se o usuário quer preservar um ângulo, a parcela de ajuste dos objetivos é limitada a ±1 lb, exceto quando ele explicitamente busca o mesmo ângulo. Mudanças de material continuam podendo alterar a resposta.

`getHeadSize` em `src/rackets.ts` retorna a área da cabeça somente para identificações disponíveis no catálogo sem distinguir uma geração. A recomendação recebe nome completo, padrão e área quando disponível. Contagem de cordas normalizada por área fornece apenas uma referência aproximada de densidade: ≥342 cordas por 100 pol² é tratada como mais densa; ≤310, como mais aberta. A regra adiciona 1 lb ao ajuste de saída baixa em configuração mais aberta e reduz mais 1 lb para saída alta em configuração mais densa. Sem área conhecida, usa a contagem por referência de 100 pol² e informa a limitação. Isso não mede espaçamento real, ângulo, rigidez do aro ou potência específica de uma marca. A faixa de tensão de fábrica continua sem validação automática.

Cada cartão explica os objetivos combinados, as características de raquete usadas e os compromissos de tensão. Técnica, ponto de impacto, material e atrito também afetam o ângulo; testar em quadra é necessário. O desconforto limita as tensões sugeridas e o perfil iniciante mantém a exclusão de poliéster. Essas restrições prevalecem sobre pedidos de maior firmeza ou ângulo mais baixo.

## Desconforto físico

A pergunta considera desconforto durante ou após jogar, com respostas Sim/Não. Sim abre uma seleção múltipla obrigatória com cotovelo de tenista, cotovelo de golfista, dor no ombro e dor nos punhos. Voltar preserva as escolhas; mudar para Não limpa os detalhes e pula essa tela. Os relatos aparecem no resumo e na cópia. São autorrelatos, sem confirmação de diagnóstico. Os filtros gerais de conforto continuam aplicados quando há desconforto, sem ajustes clínicos ou tratamentos específicos por condição.


## Poliéster em tensão reduzida com desconforto

O relato de desconforto não exclui automaticamente poliéster para jogadores intermediários/avançados. A classificação ganha peso adicional para conforto (+2 × classificação de conforto) e penaliza configurações com poliéster (−4). Até uma configuração com poliéster pode entrar entre as três opções, sem forçá-la quando as prioridades favorecem alternativas mais macias. O perfil iniciante continua excluindo poliéster.

Cada direção com poliéster e desconforto recebe uma referência de teste de no máximo 45 lb e pelo menos 4 lb abaixo da referência atual, respeitando o limite inferior de 30 lb do protótipo. Os demais ajustes continuam considerando objetivos, material e raquete. O valor de 45 lb é uma decisão heurística de produto para revisão, não uma faixa clinicamente segura nem homologada pelo fabricante. Se a tensão já está no mínimo, a regra explica o limite, sem inventar uma redução abaixo do seletor. Em híbridos, a redução aplica-se à direção com poliéster, preservando as referências independentes.

Baixa tensão não elimina a rigidez do poliéster nem garante ausência de dor. A orientação é avaliar a configuração com o encordoador, respeitar a faixa do fabricante e interromper o teste se houver dor. Nenhum dos relatos físicos específicos gera uma prescrição clínica.

## Lançamentos conferidos em fontes oficiais

Defyer (Wilson), Fire (Tecnifibre), MUSE (Yonex), Squared (HEAD) e Axis (Diadem) estão disponíveis, totalizando 19 variantes técnicas. Os registros guardam padrão, tamanho da cabeça e URL oficial; as recomendações usam esses valores. A revisão também adicionou Wilson RF 01, completou variantes Q+ da Pro Kennex e corrigiu Pure Aero 98 para 16 × 20. Consulte [a revisão e suas fontes](docs/catalog-review.md) para escopo, especificações e limitações. Registros antigos sem fonte ainda não têm essa mesma verificação individual.

## Temas por outfit

A landing page oferece sete paletas com caricaturas inspiradas nas fotos de outfits fornecidas: Alcaraz (padrão claro/verde com turquesa), Guga (amarelo/marinho), Agassi (rosa/preto), Federer (all black, modo noturno) Nadal (lilás/coral), Djokovic (azuis/coral) e Sinner (mostarda/oliva/preto). No celular, o seletor desliza horizontalmente e mantém o tema escolhido visível. A paleta altera fundo, textos, botões, seleções, avisos, cartões, diagramas e a cor da barra do navegador, sem alterar regras ou respostas.

`src/themes.ts` define as opções; `src/themes.css` centraliza as variáveis de cor; `src/ThemePicker.tsx` apresenta a seleção acessível com botões de estado `aria-pressed`. A preferência é salva apenas no navegador em `string-ez-theme`. Falha de armazenamento não impede a troca de tema, e valores inválidos retornam ao Alcaraz. “Começar de novo” reinicia as respostas e preserva o tema. As caricaturas de Alcaraz, Guga, Agassi e Nadal usam a imagem transparente `src/assets/player-outfits.png`; Federer usa `src/assets/federer-black.png`, com outfit all black da nova referência. As imagens são reutilizadas por CSS sem chamadas a serviços de imagem durante o uso. O tema Federer aplica `color-scheme: dark`, fundo carvão, superfícies escuras, textos claros e botões prateados. Os demais temas usam `color-scheme: light`.

Validação em Chromium: cinco paletas, persistência/fallback de armazenamento, asset, fluxo híbrido até resultados, layouts 320/390/1440 e contraste ≥4,5 nas combinações principais de texto/fundo e botões (incluindo hover). A mudança de tema não interfere nos testes do motor de recomendações.

## Custo-benefício e redução de custo

Uma das três opções sempre recebe o selo **Custo-benefício**, independentemente dos objetivos. A seleção usa as opções acessíveis do catálogo com classificação de custo-benefício ≥4, respeita o perfil iniciante e o limite de poliéster para desconforto, e preserva a única alternativa híbrida quando já selecionada. As três configurações continuam distintas.

**Reduzir o custo** é um objetivo selecionável, combinado com outro dentro do limite de dois. Para pontuação, usa a classificação de custo-benefício. Se houver uma alternativa acessível em faixa inferior à atual, ela é priorizada para a vaga econômica. Isso não altera tensão para prometer economia; mudanças de tensão continuam relacionadas a material, histórico e outros objetivos.

`src/cost.ts` define faixas qualitativas de corda (baixa, média, alta e premium). Nylon usa faixa baixa, poliéster/multifilamento genéricos usam média e tripa natural usa premium. Os modelos X-One Biphase, NRG2, NXT, ALU Power e 4G têm ajuste indicativo para faixa alta. Em híbridos, a referência é a média das faixas das duas cordas, sem supor que a compra de dois sets inteiros custa a metade. Os modelos informados em “Quero especificar” entram na comparação.

Cada recomendação informa sua faixa em relação ao setup inicial: inferior, igual ou superior. Se o atual já está na mesma faixa baixa da opção econômica, o app diz que não há economia demonstrada. A comparação e suas limitações também entram na cópia para o encordoador. **Não são cotações**: os custos reais dependem de loja, disponibilidade, set/rolo, mão de obra, durabilidade e frequência de troca. Sem esses valores, não há cálculo de economia em R$ nem de custo por hora. As faixas são heurísticas a revisar, não preços atuais do mercado brasileiro.

As opções textuais do questionário, incluindo marcas, linhas e modelos de raquetes e cordas, aparecem em ordem alfabética em português, com comparação numérica natural (98 antes de 100). O teclado de tensão, o seletor de temas e os níveis mantêm sua ordem própria. “Quero especificar” fica sempre por último, com destaque na paleta do tema. Os níveis seguem Iniciante (NTRP 1.0 a 3.0), Intermediário (3.5 a 4.5) e Avançado (5.0 a 7.0); são faixas de referência aproximadas para a seleção no app.

O tema Djokovic usa azul-celeste e cobalto do outfit de referência, com coral nos detalhes das horizontais. A caricatura transparente está em `src/assets/djokovic-blue.png`. O seletor inicial oferece sete tenistas; a seleção de Djokovic persiste no navegador e é aplicada antes da primeira renderização.

O tema Sinner combina mostarda, oliva e preto da foto de referência. A caricatura em `src/assets/sinner-mustard.png` usa um arquivo individual transparente para evitar trechos de outros tenistas no recorte. A seleção persiste no navegador e participa da aplicação antecipada do tema.
