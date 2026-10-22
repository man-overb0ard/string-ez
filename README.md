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

As configurações recebem classificações qualitativas internas por fator. Um ou dois objetivos têm peso 5 pela média das notas; cada fator a preservar tem peso 2. Não há bônus por manter montagem/material atual. Desconforto dá peso adicional ao conforto, sem excluir poliéster. As duas primeiras posições seguem a pontuação, sem alternância obrigatória. Iniciantes recebem apenas full bed, com todos os materiais elegíveis, exceto tripa natural quando não informada no setup ativo. A terceira posição é uma configuração distinta de custo-benefício, identificada com selo. A ordenação é determinística e não é uma medição de laboratório.

A tensão parte do histórico informado por direção. As regras consideram objetivo, material anterior e proposto, conflito entre conforto/controle e padrão 18 × 20. Ao propor full bed após híbrido, a referência é a média arredondada das tensões atuais; híbridos preservam referências separadas. As sugestões ficam entre 30 e 69 lb e explicam quando esse limite afeta o ajuste. Histórico inválido não gera tensões inventadas.

**Limites:** a faixa de tensão do fabricante de cada raquete ainda não está validada. Os números são pontos de teste que precisam de confirmação do encordoador e do fabricante. O catálogo de cordas é inicial, sem preços, estoque ou consulta em tempo real. As regras e classificações precisam de revisão de um especialista antes de lançamento público. Nenhuma recomendação trata lesões. Não existe garantia de preservar simultaneamente fatores em conflito.

## Catálogo de raquetes

`src/rackets.ts` inclui Yonex, Babolat, Head, Wilson, Prince, Pro Kennex, Tecnifibre, Dunlop e Diadem. Não há opções “não sei”: a identificação exige marca, linha e modelo do catálogo. Modelos de padrão único pulam a pergunta; variantes oferecem os padrões cadastrados. Trocar marca, linha ou modelo limpa o padrão anterior. Algumas variantes abrangem gerações diferentes: ainda é necessário revisar e segmentar por ano. Marca/modelo identificam a raquete, mas não fornecem uma validação de tensão neste protótipo.

## Validação

Os testes em `tests/recommendations.test.ts` cobrem configurações únicas, produtos/tensões, filtros por dor/experiência, influência dos fatores preservados, transição para híbrido, cálculo por direção, limites, histórico inválido e padrões de raquetes. O teste combinado percorre 600 perfis.

O fluxo foi validado em Chromium com telas mobile e desktop, incluindo seleção múltipla, teclado de tensão, voltar, resumo e clipboard. O projeto pode futuramente ser empacotado com Capacitor para Android/iOS; isso ainda não está implementado.

## Identificar marca e modelo da corda atual

Em cada seleção de tipo de corda, “Quero informar o modelo exato” abre marca → modelo. O catálogo em `src/stringCatalog.ts` inclui Solinco, Yonex, Babolat, Tecnifibre, HEAD, Signum Pro, Robin Söderling (RS), Luxilon, Wilson, Prince, Kirschbaum, MSV, Dunlop, Toroline, ReString, Volkl, Weiss Cannon e Tourna. É um catálogo inicial de identificação, não um ranking de vendas, nem garantia de disponibilidade no Brasil. Ele não cobre todos os modelos, anos e calibres.

O material é identificado pelo modelo para o cálculo das recomendações. A marca/modelo atual entra no resumo e no texto copiado; o motor ainda não usa medições específicas de rigidez de cada produto. No híbrido, mains e crosses têm seleções independentes. Trocar tipo limpa marca/modelo; trocar marca limpa modelo; selecionar novamente a mesma opção preserva o preenchimento. O caminho simplificado por material continua disponível.


O teclado de tensão tem três colunas: 1–9 nas primeiras linhas e apagar, 0 e confirmar na última. O visor aceita até dois dígitos e só permite avançar com valores entre 30 e 69 lb. Tensões de mains e crosses são independentes; ao voltar, o valor confirmado é restaurado. As cores seguem o tema selecionado, incluindo o modo noturno.

As linhas adicionadas ao catálogo de raquetes são Tecnifibre T-Fight, TF40, TF-X1 e Tempo; Dunlop CX, SX e FX; Diadem Elevate e Nova. As variantes de padrão seguem o fluxo condicional, incluindo TF40 305/315 e CX 200 Tour. O catálogo continua inicial e não diferencia todas as gerações.


## Dois objetivos, Spin e Snapback

A etapa de melhoria aceita um ou dois objetivos; pontos a preservar aceitam até três. `src/preferences.ts` centraliza opções e limites. “Preço” substitui “Custo-benefício” nos pontos a preservar, e “Spin” substitui “Efeito (spin)”. As duas perguntas incluem “Snapback”, explicado como o retorno das cordas à posição após o impacto. Os seletores de ângulo de saída foram removidos, assim como seus ajustes de tensão.

Snapback recebe uma classificação editorial própria de 1 a 5 por modelo em `src/recommendationStrings.ts`; híbridos usam uma aproximação ponderada dos dois perfis. Quando há ensaio correspondente, o atrito medido alimenta uma nota relativa; sem ensaio, a nota é qualitativa. Não há equivalência automática com spin. Desgaste, entalhes e técnica podem alterar o resultado. O fator participa da mesma ponderação dos outros objetivos e preferências, sem ajuste de tensão específico; cada resultado explica o potencial ou a concessão. Mantêm-se full bed para iniciantes, tripa natural somente para quem já usa e custo-benefício na opção 03.

`getHeadSize` fornece a área quando catalogada. Nome, padrão e área entram no contexto e na referência aproximada de densidade, sem medir espaçamento real ou validar a faixa de fábrica. O padrão 18 × 20 ainda recebe ajuste para conforto/potência. Os objetivos de controle (+2 lb) e conforto/potência (−2 lb) são combinados pela média, antes de material, histórico e limites.

## Desconforto físico

A pergunta considera desconforto durante ou após jogar, com respostas Sim/Não. Sim abre uma seleção múltipla obrigatória com cotovelo de tenista, cotovelo de golfista, dor no ombro e dor nos punhos. Voltar preserva as escolhas; mudar para Não limpa os detalhes e pula essa tela. Os relatos aparecem no resumo e na cópia. São autorrelatos, sem confirmação de diagnóstico. O conforto recebe peso adicional na pontuação quando há desconforto, sem ajustes clínicos ou tratamentos específicos por condição.


## Poliéster em tensão reduzida com desconforto

O relato de desconforto não exclui poliéster em nenhum nível e não limita sua quantidade entre as opções. A classificação ganha peso adicional de conforto (+2 × nota de conforto), sem penalidade fixa por material. Não há teto de 45 lb ou redução obrigatória de tensão por dor; os ajustes contextuais de objetivos, material e padrão permanecem.


Baixa tensão não elimina a rigidez do poliéster nem garante ausência de dor. A orientação é avaliar a configuração com o encordoador, respeitar a faixa do fabricante e interromper o teste se houver dor. Nenhum dos relatos físicos específicos gera uma prescrição clínica.

## Lançamentos conferidos em fontes oficiais

Defyer (Wilson), Fire (Tecnifibre), MUSE (Yonex), Squared (HEAD) e Axis (Diadem) estão disponíveis, totalizando 19 variantes técnicas. Os registros guardam padrão, tamanho da cabeça e URL oficial; as recomendações usam esses valores. A revisão também adicionou Wilson RF 01, completou variantes Q+ da Pro Kennex e corrigiu Pure Aero 98 para 16 × 20. Consulte [a revisão e suas fontes](docs/catalog-review.md) para escopo, especificações e limitações. Registros antigos sem fonte ainda não têm essa mesma verificação individual.

## Temas por outfit

A landing page oferece oito paletas com caricaturas inspiradas nas fotos de outfits fornecidas: Alcaraz (padrão claro/verde com turquesa), Guga (amarelo/marinho), Agassi (rosa/preto), Federer (all black, modo noturno), Nadal (lilás/coral), Djokovic (azuis/coral), Sinner (mostarda/oliva/preto) e Sampras (all white). No celular, o seletor desliza horizontalmente e mantém o tema escolhido visível. A paleta altera fundo, textos, botões, seleções, avisos, cartões, diagramas e a cor da barra do navegador, sem alterar regras ou respostas.

`src/themes.ts` define as opções; `src/themes.css` centraliza as variáveis de cor; `src/ThemePicker.tsx` apresenta a seleção acessível com botões de estado `aria-pressed`. A preferência é salva apenas no navegador em `string-ez-theme`. Falha de armazenamento não impede a troca de tema, e valores inválidos retornam ao Alcaraz. “Começar de novo” reinicia as respostas e preserva o tema. As caricaturas de Alcaraz, Guga, Agassi e Nadal usam a imagem transparente `src/assets/player-outfits.png`; Federer usa `src/assets/federer-black.png`, com outfit all black da nova referência. As imagens são reutilizadas por CSS sem chamadas a serviços de imagem durante o uso. O tema Federer aplica `color-scheme: dark`, fundo carvão, superfícies escuras, textos claros e botões prateados. Os demais temas usam `color-scheme: light`.

Validação em Chromium: cinco paletas, persistência/fallback de armazenamento, asset, fluxo híbrido até resultados, layouts 320/390/1440 e contraste ≥4,5 nas combinações principais de texto/fundo e botões (incluindo hover). A mudança de tema não interfere nos testes do motor de recomendações.

## Custo-benefício e redução de custo

O motor mantém somente três restrições de recomendação: tripa natural exige uso atual desse material; iniciantes recebem apenas full bed; a opção 03 tem classificação de Preço ≥4 e o selo **Custo-benefício**. As primeiras duas são as configurações mais bem pontuadas, sem alternância obrigatória de modalidade. Não há exclusão de poliéster para iniciantes, limite de uma opção com poliéster por desconforto, obrigação de cordas principais diferentes ou preferência adicional por custo inferior na reserva da terceira. As três configurações são distintas.

**Reduzir o custo** continua sendo um objetivo selecionável e participa da pontuação. A comparação com o setup atual informa se a faixa é inferior, igual ou superior, sem prometer economia quando não há evidência.

`src/cost.ts` define faixas qualitativas de corda (baixa, média, alta e premium). Nylon usa faixa baixa, poliéster/multifilamento genéricos usam média e tripa natural usa premium. Os modelos X-One Biphase, NRG2, NXT, ALU Power e 4G têm ajuste indicativo para faixa alta. Em híbridos, a referência é a média das faixas das duas cordas, sem supor que a compra de dois sets inteiros custa a metade. Os modelos informados em “Quero informar o modelo exato” entram na comparação.

Cada recomendação informa sua faixa em relação ao setup inicial: inferior, igual ou superior. Se o atual já está na mesma faixa baixa da opção econômica, o app diz que não há economia demonstrada. A comparação e suas limitações também entram na cópia para o encordoador. **Não são cotações**: os custos reais dependem de loja, disponibilidade, set/rolo, mão de obra, durabilidade e frequência de troca. Sem esses valores, não há cálculo de economia em R$ nem de custo por hora. As faixas são heurísticas a revisar, não preços atuais do mercado brasileiro.

As opções textuais do questionário, incluindo marcas, linhas e modelos de raquetes e cordas, aparecem em ordem alfabética em português, com comparação numérica natural (98 antes de 100). O teclado de tensão, o seletor de temas e os níveis mantêm sua ordem própria. “Quero informar o modelo exato” fica sempre por último, com destaque na paleta do tema. Os níveis seguem Iniciante (NTRP 1.0 a 3.0), Intermediário (3.5 a 4.5) e Avançado (5.0 a 7.0); são faixas de referência aproximadas para a seleção no app.

O tema Djokovic usa azul-celeste e cobalto do outfit de referência, com coral nos detalhes das horizontais. A caricatura transparente está em `src/assets/djokovic-blue.png`. O seletor inicial oferece oito tenistas; a seleção de Djokovic persiste no navegador e é aplicada antes da primeira renderização.

O tema Sinner combina mostarda, oliva e preto da foto de referência. A caricatura em `src/assets/sinner-mustard.png` usa um arquivo individual transparente para evitar trechos de outros tenistas no recorte. A seleção persiste no navegador e participa da aplicação antecipada do tema.

Os diagramas de encordoamento usam cores fixas para facilitar a comparação: full bed em azul, híbrido com verticais azuis e horizontais laranjas, sobre fundo claro. Na seleção, legendas com setas identificam as duas direções. As cores são ilustrativas e independentes do tema e da cor real das cordas.

### Preferências de cor e formato

“Cor da corda” e “Formato (Redondo, Hexagonal, etc.)” contam dentro do limite de três pontos a preservar. Cada seleção abre um seletor na mesma etapa; é obrigatório informar o detalhe para continuar. Desmarcar limpa o detalhe, e voltar mantém as escolhas confirmadas. As preferências aparecem no resumo e no texto copiado.

`src/stringAppearance.ts` mantém variantes de referência de cor base e seção (incluindo formatos redondos e perfilados) para os produtos recomendáveis. O motor soma até 7 pontos por preferência: 5 pela correspondência nas verticais e 2 nas horizontais. São preferências de ordenação, sem excluir os demais modelos apenas por não corresponderem à preferência. HEAD Lynx Tour participa sempre do conjunto de candidatos, assim como os demais modelos do catálogo. Cada resultado informa as variantes sugeridas por direção e explicita quando não preserva cor ou formato. As cores agrupam tons próximos; estoque e variantes por calibre precisam ser confirmados com o encordoador. Cor não altera a regra de tensão nem recebe promessa de desempenho; formato não garante spin.

Toroline (Caviar, Enso Pro, O-Toro, Super Toro, Toro Toro, Wasabi, Wasabi X) e ReString (Zero, Sync) estão disponíveis em “Quero informar o modelo exato”, como identificação do setup atual, incluindo verticais/horizontais independentes. Esses modelos são classificados como poliéster. Não são novos candidatos recomendáveis com medições próprias. A lista é inicial; os sites oficiais não puderam ser consultados nesta atualização devido ao bloqueio de rede.

O retrato do criador acima do crédito no cabeçalho é um easter egg: clique para ativar a vibe secreta inspirada em Donkey Kong Country (selva, madeira e amarelo-banana). O tema `jungle` fica fora dos oito outfits, persiste no navegador e acompanha o questionário. Clique novamente no retrato para retornar ao Alcaraz ou escolha qualquer outfit na landing. O avatar individual transparente tem proporção 1:1, exibido em 56 × 56 px com recorte circular, e está em `src/assets/joao-caricature.png`.

O wordmark `string-ez` usa Sora variável servida localmente (`src/assets/fonts`), com “string” em peso 800 e “-ez” em 400. A licença OFL acompanha o arquivo. O logo não tem subtítulo.

“Pocketing” também está nos dois questionários, explicado como a sensação de a bola afundar e ser abraçada pelas cordas no impacto. Recebe uma classificação independente por combinação (1–5), ponderada como os demais fatores, sem ajuste de tensão próprio. Os resultados explicitam potencial ou concessão; não há medição de tempo de contato ou garantia da sensação. Os limites continuam em três pontos a preservar e dois objetivos.

Tripa natural só entra nas recomendações quando o setup atual já contém esse material: full bed de tripa ou ao menos uma direção do híbrido. O filtro exclui tanto Touch VS em full bed quanto híbridos com tripa para os demais usuários, antes da ordenação por objetivos/cor/formato. Dados de uma configuração anterior inativa não liberam tripa. Mantêm-se três opções e uma de custo-benefício.

## Vercel Web Analytics

`@vercel/analytics` é montado uma única vez com `<Analytics />` em `src/main.tsx`. Web Analytics precisa estar habilitado no projeto Vercel. Após o deploy, registra as métricas padrão de acesso; não foram adicionados eventos personalizados nem envio das respostas do questionário. As etapas usam estado React sem mudar de URL, portanto não são contadas como páginas separadas. Em desenvolvimento, o pacote usa modo de depuração. Para validar no deploy, abra o site, navegue e confira Analytics na Vercel; bloqueadores de conteúdo podem impedir a coleta.

O catálogo de identificação inclui Luxilon Element Soft IR, Volkl (Cyclone, Cyclone Tour, V-Pro, V-Torque, V-Torque Tour, V-Star, Power Fiber II e Classic Synthetic Gut) e Weiss Cannon (Ultra Cable, Silverstring, Scorpion, Black 5 Edge, Red Ghost, TurboTwist, Mosquito Bite e Explosiv!). Power Fiber II e Explosiv! são multifilamentos, Classic Synthetic Gut é nylon e os demais são classificados como poliéster. Esses modelos identificam o setup atual e também participam do catálogo de recomendações, sem medições próprias ou garantia de disponibilidade local.

Volkl está no catálogo de raquetes com as linhas Vostra, V-Cell, C10 e Power Bridge. A inclusão da Mizuno foi cancelada. As variantes V8 usam referência 16 × 18, as demais novas entradas 16 × 19. As áreas são metadados de referência, não validação de geração ou faixa de tensão. Não houve consulta ao vivo às fichas da Volkl devido ao bloqueio de rede, e a lista não é exaustiva. O logotipo da Volkl foi adicionado a partir da referência enviada pelo usuário, mantendo o nome acessível.

A etapa de nível mostra a seção “Está em dúvida?” abaixo das três escolhas. A tabela em `src/NtrpGuide.tsx` usa as faixas aprovadas no app: iniciante 1.0–3.0, intermediário 3.5–4.5 e avançado 5.0–7.0, com descrições em português. No celular, cada linha agrupa nível e NTRP acima da descrição para evitar rolagem horizontal. A referência não muda a seleção automática nem as regras de recomendação.

## Frequência semanal

Após o nível, “Quantas horas por semana você costuma jogar?” oferece, em ordem crescente: até 2 horas, mais de 2 até 5, mais de 5 até 10 e mais de 10. A seleção avança automaticamente; voltar preserva a resposta. A frequência aparece no resumo, na cópia e na justificativa de cada recomendação.

`src/weeklyPlay.ts` define pesos adicionais de manutenção de tensão/durabilidade/preço: até 2 h = 1/0/0; 2–5 h = 0,25/0,25/0,25; 5–10 h = 0,5/1/0,5; mais de 10 h = 0,5/1/1. São ajustes heurísticos de ordenação, sem cálculo de vida útil ou custo/hora e sem modificar diretamente as tensões. Não liberam tripa para quem não usa e preservam full bed para iniciantes e custo-benefício na opção 03. Para compatibilidade com consumidores anteriores, o motor permite ausência do campo; valores informados inválidos são rejeitados. O fluxo do app exige a escolha antes de avançar.

## Trajetória da bola

Após as horas semanais, a pergunta “Como costuma ser a trajetória da sua bola?” oferece três cartões, em ordem de altura: Mais reta; Com arco e topspin; Mais alta e profunda. `src/ShotStyleOption.tsx` desenha trajetórias pontilhadas com uma rede de referência e uma bola; a opção de topspin inclui um indicador de rotação. A explicação deixa claro que uma bola alta também pode ter muito topspin. A seleção avança ao toque, pode ser revisada e aparece no resumo/cópia.

`src/shotStyle.ts` acrescenta pesos heurísticos à pontuação: mais reta = controle 1 + manutenção 0,25; topspin = Spin 0,75 + Snapback 0,5 + durabilidade 0,25; alta/profunda = potência 0,75 + controle 0,5. Não há penalidade de Spin para bola alta nem ajuste direto de tensão. São preferências complementares, não medidas de velocidade/rotação, e preservam os filtros de material e a ordem das três opções. A justificativa do estilo aparece em cada recomendação. O motor mantém compatibilidade com entradas sem esse campo, mas rejeita valores informados inválidos; o fluxo exige a escolha.

O tema Sampras inverte a proposta monocromática do Federer: fundo branco, texto escuro, botões pretos e superfícies cinza claras, inspirado no outfit all white. A caricatura individual transparente está em `src/assets/sampras-white.png`. É a oitava opção pública, com persistência e aplicação antecipada do tema; o tema secreto permanece separado.


## Catálogo completo de recomendações

O motor considera os mesmos **107 modelos de 18 marcas** disponíveis na identificação do setup atual. `src/recommendationStrings.ts` mantém avaliações editoriais individuais de conforto, controle, potência, spin, durabilidade, preço, manutenção de tensão, snapback e pocketing (1–5). A inicialização falha se um novo modelo de identificação não tiver perfil, evitando que o catálogo cresça sem entrar nas recomendações. Esses números são a base editorial revisável. Na ordenação, os fatores com ensaio correspondente usam as notas relativas da integração TWU; os demais continuam estimados. As notas calculadas também não são medições diretas de desempenho em quadra. Não há cotações atuais.

Todos os modelos participam como full bed; os híbridos cruzam cada modelo elegível com um conjunto limitado de horizontais de multifilamento, nylon e poliéster redondo. São **569 configurações candidatas**, não 569 produtos. Híbridos usam uma aproximação de 65% verticais / 35% horizontais para os fatores de jogo; o preço usa a menor nota das duas cordas para não classificar como econômica uma combinação com componente caro. Essa aproximação não mede o atrito ou a compatibilidade real da combinação. Os textos explicam a necessidade de testar desgaste e resposta em quadra.


Os testes cobrem paridade integral dos dois catálogos, participação das marcas em híbridos, perfis completos, unicidade, variedade entre respostas e todas as regras de nível, desconforto, natural gut, custo e modalidade. Os testes antigos de recomendação foram ajustados para verificar propriedades e objetivos, em vez de exigir os mesmos poucos modelos da lista anterior.


### Restrições simplificadas

Os fatores informados (objetivos, preferências, horas, trajetória e conforto) continuam ponderando a pontuação. O desconforto dá peso ao conforto, sem penalidade fixa de poliéster. Foram retiradas as reduções e os tetos de tensão obrigatórios por nível/desconforto. Os ajustes de tensão por objetivos, troca de material e padrão de raquete permanecem, assim como a validação de entrada e o intervalo de 30–69 lb. A UI continua identificando exclusivamente a opção 03 como custo-benefício e o texto copiado também mantém essa identificação.

A revisão de conforto relativo de Mach-10, Poly Tour Pro e Luxilon Element e suas fontes estão em [docs/string-comfort-review.md](docs/string-comfort-review.md). Esses modelos seguem elegíveis para quem relata dor; os playtests não demonstram segurança clínica nem uma tensão universal.

## Calibre personalizado

`src/stringGauge.ts` escolhe o calibre após a ordenação dos modelos, com base nas variantes em `src/gaugeVariants.ts`. São 83 modelos com variantes consultadas na Tennis Warehouse; os outros 24 continuam elegíveis, com calibre **A confirmar**. Fontes, medidas e limites da consulta estão em [docs/string-gauge-review.md](docs/string-gauge-review.md). Não há consulta de estoque em tempo real.

Poliéster parte da medida confirmada mais próxima de 1,25 mm. Outros materiais usam a mais próxima de 1,30 mm. Durabilidade pode favorecer medida maior; prioridades de resposta/sensação podem favorecer medida menor quando combinadas com frequência menor ou padrão mais denso. Prioridades conflitantes mantêm uma referência intermediária. Horas de jogo não são interpretadas como histórico de rompimentos. Controle isoladamente não seleciona 1,20 mm, e maior calibre não promete melhor manutenção de tensão.

As duas direções do híbrido são avaliadas independentemente e o full bed usa uma medida única. Cada cartão tem “Por que esse calibre?”, incluído também no texto copiado. Não há ajuste automático de tensão só por calibre, porque o calibre anterior ainda não é coletado. A seleção não altera a ordem dos modelos nem as três restrições existentes (tripa natural exige uso atual; iniciantes somente full bed; opção 03 identificada como custo-benefício).

## Preservar e melhorar sem sobreposição

A etapa de melhorias usa `availableImprovementFactors`: fatores marcados para preservar ficam ocultos em vez de desabilitados. “Preço” corresponde a “Reduzir o custo”; cor e formato não retiram objetivos sem relação, e “Nada em especial” deixa todos disponíveis. Ao voltar e alterar os pontos a preservar, `reconcileImprovementGoals` remove somente melhorias que passaram a conflitar. Desmarcar uma preferência torna a melhoria disponível novamente, sem selecioná-la automaticamente. Os limites seguem três pontos a preservar e dois objetivos. O fluxo no navegador cobre ocultação, limpeza ao voltar, contagem de seleção, reaparecimento e geração das três recomendações.

## Gerar novas três opções

Na tela final, “Gerar novas 3 opções” mantém as respostas e apresenta o próximo conjunto, sem repetir configurações já exibidas nessa sequência. A ordenação continua seguindo a pontuação; cada conjunto mantém full bed para iniciantes, tripa natural somente para quem já informou uso e custo-benefício identificado na opção 03. Uma mesma corda pode participar de configurações diferentes, por exemplo full bed e híbrido.

`recommend` aceita uma lista opcional de IDs a excluir. Antes de apresentar a próxima rodada, verifica se há três candidatas distintas e uma opção econômica. Na última rodada possível, reserva a candidata econômica para a terceira posição. Quando não há um conjunto completo elegível, o botão é desabilitado, o motivo é exibido e as opções atuais permanecem disponíveis. Revisar respostas ou começar de novo limpa o histórico. Histórico e respostas ficam somente na memória da sessão.

O botão de copiar usa sempre o conjunto visível e seu estado de confirmação é reiniciado ao gerar alternativas. A nova rodada é anunciada, recebe foco no título e retorna ao topo. Testes cobrem exclusão acumulada, esgotamento, reserva econômica, regras por perfil, respostas preservadas e conteúdo da área de transferência no navegador.

## Dados laboratoriais TWU

A planilha fornecida pelo usuário foi incorporada como fonte de medições: **788 registros na origem, 199 registros utilizáveis de 94 modelos do catálogo**, todos a 51 lb / Fast. As notas de conforto relativo, manutenção de tensão, spin e snapback usam proxies das medidas quando há correspondência de modelo/calibre/cor. Os fatores sem medida continuam qualitativos. Cada resultado informa sua base e permite consultar valores, condições e limitações; a cópia para o encordoador inclui essa procedência. Híbridos continuam estimados, não são apresentados como combinações medidas.

A escolha de calibre precede a ordenação. Não se emprestam medidas de outro calibre nem se extrapolam números para a tensão recomendada. As variantes medidas complementam o catálogo de calibres, sem garantir disponibilidade atual. O banco e o código de importação são locais; não há chamada à TWU durante o uso, nem envio de respostas.

Veja [a metodologia, auditoria e reprodução da importação](docs/twu-integration.md). A documentação histórica de reviews e calibres registra as consultas anteriores; os números de cobertura atuais estão nessa integração.

## Nomes e explicações dos fatores

Os campos usam rótulos voltados à percepção do jogador: Conforto no impacto, Controle de profundidade, Potência fácil, Spin, Resistência ao rompimento, Consistência ao longo do uso, Retorno das cordas — Snapback e Sensação de encaixe — Pocketing. Cada um tem uma descrição breve. Os identificadores internos permanecem estáveis para a classificação e a integração TWU; `preferenceLabel` traduz rótulos nas perguntas, na ordenação alfabética, no resumo e nos textos das recomendações.

Consistência ao longo do uso (identificador `Manutenção de tensão`) está tanto em preservar como em melhorar e usa a avaliação de perda de tensão quando há ensaio correspondente. Ela é apresentada separadamente da resistência ao rompimento. A amarração continua baseada nos identificadores: preservar um fator o oculta nas melhorias, inclusive consistência, e alterar preferências ao voltar limpa somente objetivos conflitantes. Preço/cor/formato e os limites de seleção permanecem como antes.

## Contribuição voluntária por Pix

A tela final inclui uma seção abaixo das recomendações e ações, com a mensagem de gratuidade permanente para a comunidade e contribuição opcional de qualquer valor. `src/PixContribution.tsx` apresenta somente o QR Code, sem nome ou CPF impressos. O código em `src/assets/pix-qr.png` codifica os mesmos dados Pix da imagem fornecida pelo usuário; o checksum e a ausência de valor fixo foram verificados. O QR Code pode revelar os dados necessários ao pagamento quando lido pelo banco, e não representa anonimização da chave Pix.

A imagem original com os textos pessoais não foi adicionada ao repositório. O QR Code é servido como asset independente para permitir abertura ampliada, mantém fundo branco em todos os temas e carrega sob demanda. Não há integração bancária, envio de pagamento ou coleta de dados no app. A seção aparece apenas nos resultados e permanece única ao gerar novas opções.
