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

As configurações recebem classificações qualitativas internas por fator. O usuário escolhe um ou dois objetivos, combinados com o mesmo peso. A média das classificações dos objetivos tem peso 5; cada fator a preservar tem peso 2. Não há bônus por manter montagem ou material atual na ordenação. Iniciantes recebem apenas configurações sem poliéster. Desconforto físico aumenta o peso do conforto, mas permite até uma alternativa com poliéster em tensão reduzida, acompanhada de pelo menos duas opções sem poliéster. Para intermediários e avançados, a primeira opção é a mais bem pontuada, a segunda é a melhor elegível na modalidade oposta e a terceira é de custo-benefício. Para iniciantes, as três são full bed, sem poliéster, com custo-benefício na terceira posição. A ordenação é determinística, não é uma previsão de desempenho nem uma medição de laboratório.

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

Snapback recebe uma classificação editorial própria de 1 a 5 por modelo em `src/recommendationStrings.ts`; híbridos usam uma aproximação ponderada dos dois perfis. Não são medições de atrito nem equivalência automática com spin. Desgaste, entalhes e técnica podem alterar o resultado. O fator participa da mesma ponderação dos outros objetivos e preferências, sem ajuste de tensão específico; cada resultado explica o potencial ou a concessão. Mantêm-se os filtros de iniciante/desconforto e uma alternativa de custo-benefício.

`getHeadSize` fornece a área quando catalogada. Nome, padrão e área entram no contexto e na referência aproximada de densidade, sem medir espaçamento real ou validar a faixa de fábrica. O padrão 18 × 20 ainda recebe ajuste para conforto/potência. Os objetivos de controle (+2 lb) e conforto/potência (−2 lb) são combinados pela média, antes de material, histórico e limites.

## Desconforto físico

A pergunta considera desconforto durante ou após jogar, com respostas Sim/Não. Sim abre uma seleção múltipla obrigatória com cotovelo de tenista, cotovelo de golfista, dor no ombro e dor nos punhos. Voltar preserva as escolhas; mudar para Não limpa os detalhes e pula essa tela. Os relatos aparecem no resumo e na cópia. São autorrelatos, sem confirmação de diagnóstico. Os filtros gerais de conforto continuam aplicados quando há desconforto, sem ajustes clínicos ou tratamentos específicos por condição.


## Poliéster em tensão reduzida com desconforto

O relato de desconforto não exclui automaticamente poliéster para jogadores intermediários/avançados. A classificação ganha peso adicional para conforto (+2 × classificação de conforto) e penaliza configurações com poliéster (−4). Até uma configuração com poliéster pode entrar entre as três opções, sem forçá-la quando as prioridades favorecem alternativas mais macias. O perfil iniciante continua excluindo poliéster.

Cada direção com poliéster e desconforto recebe uma referência de teste de no máximo 45 lb e pelo menos 4 lb abaixo da referência atual, respeitando o limite inferior de 30 lb do protótipo. Os demais ajustes continuam considerando objetivos, material e raquete. O valor de 45 lb é uma decisão heurística de produto para revisão, não uma faixa clinicamente segura nem homologada pelo fabricante. Se a tensão já está no mínimo, a regra explica o limite, sem inventar uma redução abaixo do seletor. Em híbridos, a redução aplica-se à direção com poliéster, preservando as referências independentes.

Baixa tensão não elimina a rigidez do poliéster nem garante ausência de dor. A orientação é avaliar a configuração com o encordoador, respeitar a faixa do fabricante e interromper o teste se houver dor. Nenhum dos relatos físicos específicos gera uma prescrição clínica.

## Lançamentos conferidos em fontes oficiais

Defyer (Wilson), Fire (Tecnifibre), MUSE (Yonex), Squared (HEAD) e Axis (Diadem) estão disponíveis, totalizando 19 variantes técnicas. Os registros guardam padrão, tamanho da cabeça e URL oficial; as recomendações usam esses valores. A revisão também adicionou Wilson RF 01, completou variantes Q+ da Pro Kennex e corrigiu Pure Aero 98 para 16 × 20. Consulte [a revisão e suas fontes](docs/catalog-review.md) para escopo, especificações e limitações. Registros antigos sem fonte ainda não têm essa mesma verificação individual.

## Temas por outfit

A landing page oferece oito paletas com caricaturas inspiradas nas fotos de outfits fornecidas: Alcaraz (padrão claro/verde com turquesa), Guga (amarelo/marinho), Agassi (rosa/preto), Federer (all black, modo noturno), Nadal (lilás/coral), Djokovic (azuis/coral), Sinner (mostarda/oliva/preto) e Sampras (all white). No celular, o seletor desliza horizontalmente e mantém o tema escolhido visível. A paleta altera fundo, textos, botões, seleções, avisos, cartões, diagramas e a cor da barra do navegador, sem alterar regras ou respostas.

`src/themes.ts` define as opções; `src/themes.css` centraliza as variáveis de cor; `src/ThemePicker.tsx` apresenta a seleção acessível com botões de estado `aria-pressed`. A preferência é salva apenas no navegador em `string-ez-theme`. Falha de armazenamento não impede a troca de tema, e valores inválidos retornam ao Alcaraz. “Começar de novo” reinicia as respostas e preserva o tema. As caricaturas de Alcaraz, Guga, Agassi e Nadal usam a imagem transparente `src/assets/player-outfits.png`; Federer usa `src/assets/federer-black.png`, com outfit all black da nova referência. As imagens são reutilizadas por CSS sem chamadas a serviços de imagem durante o uso. O tema Federer aplica `color-scheme: dark`, fundo carvão, superfícies escuras, textos claros e botões prateados. Os demais temas usam `color-scheme: light`.

Validação em Chromium: cinco paletas, persistência/fallback de armazenamento, asset, fluxo híbrido até resultados, layouts 320/390/1440 e contraste ≥4,5 nas combinações principais de texto/fundo e botões (incluindo hover). A mudança de tema não interfere nos testes do motor de recomendações.

## Custo-benefício e redução de custo

A terceira opção sempre recebe o selo **Custo-benefício**, independentemente dos objetivos, com classificação de Preço ≥4. As primeiras duas posições não são substituídas para acomodar essa reserva. Quando a primeira já é econômica, a terceira usa outra configuração acessível, mesmo que a faixa indicativa seja maior; a comparação explicita isso. As três configurações continuam distintas. Para intermediários/avançados, a segunda é a melhor na modalidade oposta à primeira, respeitando o limite global de poliéster para desconforto. Para iniciantes, todas são full bed: reserva-se a terceira econômica e escolhe-se a melhor restante para a segunda.

**Reduzir o custo** é um objetivo selecionável, combinado com outro dentro do limite de dois. Para pontuação, usa a classificação de custo-benefício. Se houver uma alternativa acessível em faixa inferior à atual, ela é priorizada para a vaga econômica. Isso não altera tensão para prometer economia; mudanças de tensão continuam relacionadas a material, histórico e outros objetivos.

`src/cost.ts` define faixas qualitativas de corda (baixa, média, alta e premium). Nylon usa faixa baixa, poliéster/multifilamento genéricos usam média e tripa natural usa premium. Os modelos X-One Biphase, NRG2, NXT, ALU Power e 4G têm ajuste indicativo para faixa alta. Em híbridos, a referência é a média das faixas das duas cordas, sem supor que a compra de dois sets inteiros custa a metade. Os modelos informados em “Quero informar o modelo exato” entram na comparação.

Cada recomendação informa sua faixa em relação ao setup inicial: inferior, igual ou superior. Se o atual já está na mesma faixa baixa da opção econômica, o app diz que não há economia demonstrada. A comparação e suas limitações também entram na cópia para o encordoador. **Não são cotações**: os custos reais dependem de loja, disponibilidade, set/rolo, mão de obra, durabilidade e frequência de troca. Sem esses valores, não há cálculo de economia em R$ nem de custo por hora. As faixas são heurísticas a revisar, não preços atuais do mercado brasileiro.

As opções textuais do questionário, incluindo marcas, linhas e modelos de raquetes e cordas, aparecem em ordem alfabética em português, com comparação numérica natural (98 antes de 100). O teclado de tensão, o seletor de temas e os níveis mantêm sua ordem própria. “Quero informar o modelo exato” fica sempre por último, com destaque na paleta do tema. Os níveis seguem Iniciante (NTRP 1.0 a 3.0), Intermediário (3.5 a 4.5) e Avançado (5.0 a 7.0); são faixas de referência aproximadas para a seleção no app.

O tema Djokovic usa azul-celeste e cobalto do outfit de referência, com coral nos detalhes das horizontais. A caricatura transparente está em `src/assets/djokovic-blue.png`. O seletor inicial oferece oito tenistas; a seleção de Djokovic persiste no navegador e é aplicada antes da primeira renderização.

O tema Sinner combina mostarda, oliva e preto da foto de referência. A caricatura em `src/assets/sinner-mustard.png` usa um arquivo individual transparente para evitar trechos de outros tenistas no recorte. A seleção persiste no navegador e participa da aplicação antecipada do tema.

Os diagramas de encordoamento usam cores fixas para facilitar a comparação: full bed em azul, híbrido com verticais azuis e horizontais laranjas, sobre fundo claro. Na seleção, legendas com setas identificam as duas direções. As cores são ilustrativas e independentes do tema e da cor real das cordas.

### Preferências de cor e formato

“Cor da corda” e “Formato (Redondo, Hexagonal, etc.)” contam dentro do limite de três pontos a preservar. Cada seleção abre um seletor na mesma etapa; é obrigatório informar o detalhe para continuar. Desmarcar limpa o detalhe, e voltar mantém as escolhas confirmadas. As preferências aparecem no resumo e no texto copiado.

`src/stringAppearance.ts` mantém variantes de referência de cor base e seção (incluindo formatos redondos e perfilados) para os produtos recomendáveis. O motor soma até 7 pontos por preferência: 5 pela correspondência nas verticais e 2 nas horizontais. São preferências de ordenação, sem filtrar os requisitos de iniciante, desconforto ou custo-benefício. HEAD Lynx Tour entra no conjunto de candidatos quando há preferência hexagonal, cinza ou laranja. Cada resultado informa as variantes sugeridas por direção e explicita quando não preserva cor ou formato. As cores agrupam tons próximos; estoque e variantes por calibre precisam ser confirmados com o encordoador. Cor não altera a regra de tensão nem recebe promessa de desempenho; formato não garante spin.

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

`src/weeklyPlay.ts` define pesos adicionais de manutenção de tensão/durabilidade/preço: até 2 h = 1/0/0; 2–5 h = 0,25/0,25/0,25; 5–10 h = 0,5/1/0,5; mais de 10 h = 0,5/1/1. São ajustes heurísticos de ordenação, sem cálculo de vida útil ou custo/hora e sem modificar diretamente as tensões. Não liberam poliéster para iniciantes nem tripa para quem não usa, e mantêm a exceção de desconforto e a organização das três opções. Para compatibilidade com consumidores anteriores, o motor permite ausência do campo; valores informados inválidos são rejeitados. O fluxo do app exige a escolha antes de avançar.

## Trajetória da bola

Após as horas semanais, a pergunta “Como costuma ser a trajetória da sua bola?” oferece três cartões, em ordem de altura: Mais reta; Com arco e topspin; Mais alta e profunda. `src/ShotStyleOption.tsx` desenha trajetórias pontilhadas com uma rede de referência e uma bola; a opção de topspin inclui um indicador de rotação. A explicação deixa claro que uma bola alta também pode ter muito topspin. A seleção avança ao toque, pode ser revisada e aparece no resumo/cópia.

`src/shotStyle.ts` acrescenta pesos heurísticos à pontuação: mais reta = controle 1 + manutenção 0,25; topspin = Spin 0,75 + Snapback 0,5 + durabilidade 0,25; alta/profunda = potência 0,75 + controle 0,5. Não há penalidade de Spin para bola alta nem ajuste direto de tensão. São preferências complementares, não medidas de velocidade/rotação, e preservam os filtros de material e a ordem das três opções. A justificativa do estilo aparece em cada recomendação. O motor mantém compatibilidade com entradas sem esse campo, mas rejeita valores informados inválidos; o fluxo exige a escolha.

O tema Sampras inverte a proposta monocromática do Federer: fundo branco, texto escuro, botões pretos e superfícies cinza claras, inspirado no outfit all white. A caricatura individual transparente está em `src/assets/sampras-white.png`. É a oitava opção pública, com persistência e aplicação antecipada do tema; o tema secreto permanece separado.


## Catálogo completo de recomendações

O motor considera os mesmos **107 modelos de 18 marcas** disponíveis na identificação do setup atual. `src/recommendationStrings.ts` mantém avaliações editoriais individuais de conforto, controle, potência, spin, durabilidade, preço, manutenção de tensão, snapback e pocketing (1–5). A inicialização falha se um novo modelo de identificação não tiver perfil, evitando que o catálogo cresça sem entrar nas recomendações. Esses números são estimativas qualitativas revisáveis: não foram obtidos de ensaios de laboratório, cotações ou uma verificação atual do catálogo dos fabricantes. Não devem ser apresentados como resultados medidos.

Todos os modelos participam como full bed; os híbridos cruzam cada modelo elegível com um conjunto limitado de horizontais de multifilamento, nylon e poliéster redondo. São **569 configurações candidatas**, não 569 produtos. Híbridos usam uma aproximação de 65% verticais / 35% horizontais para os fatores de jogo; o preço usa a menor nota das duas cordas para não classificar como econômica uma combinação com componente caro. Essa aproximação não mede o atrito ou a compatibilidade real da combinação. Os textos explicam a necessidade de testar desgaste e resposta em quadra.

A ordenação continua determinística: as mesmas respostas geram os mesmos resultados. Ampliar candidatos não significa que todos terão a mesma frequência de indicação. A terceira alternativa prioriza uma corda principal diferente das duas anteriores quando houver candidata econômica elegível; não há sorteio nem rotação de marcas para simular diversidade. Iniciantes continuam apenas com full bed sem poliéster; tripa natural só entra se já existir no setup ativo; desconforto permite no máximo uma configuração com poliéster e mantém os ajustes de tensão. As avaliações de cor, formato e calibres são variantes de referência, sem garantia de estoque local.

Os testes cobrem paridade integral dos dois catálogos, participação das marcas em híbridos, perfis completos, unicidade, variedade entre respostas e todas as regras de nível, desconforto, natural gut, custo e modalidade. Os testes antigos de recomendação foram ajustados para verificar propriedades e objetivos, em vez de exigir os mesmos poucos modelos da lista anterior.

Auditoria de referência: em 864 combinações de objetivo, ponto a preservar, nível, desconforto e frequência, 22 modelos distintos ocuparam a primeira posição e 31 apareceram nas três opções. Isso verifica variedade entre perfis, não valida desempenho das cordas em quadra.
