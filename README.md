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

O catálogo inicial em `src/rackets.ts` inclui Yonex, Babolat, Head, Wilson, Prince e Pro Kennex. Marcas e linhas fora da lista permitem digitação do modelo; modelos não listados têm opção “Outro modelo / não sei”. O catálogo não diferencia gerações nem fornece especificações técnicas. Trocar a marca limpa linha e modelo; trocar a linha limpa o modelo.
