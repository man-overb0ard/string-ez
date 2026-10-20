# String EZ

Protótipo mobile-first em português para recomendar encordoamentos de tênis. React + TypeScript + Vite, sem backend, cadastro, chave de API ou custo de IA.

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

## Fluxo e limites

Boas-vindas → marca → linha → modelo → perfil e histórico → três recomendações → copiar resumo para um encordoador. As respostas permanecem em memória até recarregar. Não há integração com ChatGPT.

As regras usam nível, objetivo e desconforto para selecionar famílias de cordas. Marca/modelo, padrão, corda e tensão anteriores ficam no resumo para consulta ao encordoador; ainda não existe catálogo validado de raquetes nem cálculo personalizado de tensão. Confirme sempre a faixa do fabricante. As recomendações são educativas e precisam de revisão técnica antes de lançamento público; não tratam lesões.

A interface web pode futuramente ser empacotada com Capacitor para Android/iOS. Esse empacotamento ainda não está implementado.

O catálogo inicial em `src/rackets.ts` inclui Yonex, Babolat, Head, Wilson, Prince e Pro Kennex, com padrões por modelo. Não há opções “não sei”: a identificação exige marca, linha e modelo do catálogo. Para um padrão único, a pergunta é suprimida e o padrão entra automaticamente no resumo. Para múltiplos padrões, o usuário escolhe entre as variantes cadastradas. Trocar marca, linha ou modelo limpa o padrão anterior. Algumas variantes abrangem gerações diferentes: o catálogo ainda precisa de revisão e segmentação por ano antes de ser considerado completo.

As opções de múltipla escolha avançam ao toque ou à ativação pelo teclado, sem botão Continuar. Voltar permite revisar e selecionar novamente a mesma resposta. A tensão atual usa um seletor deslizante de 30 a 60 lb, em incrementos de 0,5 lb, com alternância de exibição entre lb e kg sem alterar a tensão física. O valor inicial de 45 lb é apenas a posição inicial do controle, não uma recomendação. Continuar confirma a seleção; voltar preserva valor e unidade.

Antes de escolher o tipo de corda atual, o usuário seleciona Full bed ou Híbrido, com diagramas de cores ilustrativas. Full bed pergunta um tipo de corda para toda a raquete; Híbrido pergunta separadamente mains (verticais) e crosses (horizontais), permitindo a mesma família de material nas duas direções. Trocar a configuração limpa os tipos anteriores. O resumo e a cópia incluem apenas as perguntas do caminho selecionado. Essa informação compõe o histórico; o motor de recomendações segue usando nível, objetivo e desconforto. No híbrido, há seletores independentes de tensão para mains e crosses, com valores e unidades próprios. Cabeçalhos em destaque identificam verticais (verde, ↕) e horizontais (laranja, ↔) nas perguntas de corda e tensão. Voltar preserva ambas as seleções; trocar a configuração limpa as tensões anteriores. Full bed mantém um único seletor. O resumo e o texto copiado incluem as duas tensões do híbrido.
