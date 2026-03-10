# Correção do Bug de jQuery em Diálogos V1

**Data:** 09/03/2026

## O que foi feito
- Aplicação do padrão de normalização de HTMLElement na fronteira de compatibilidade V1.
- Correção do erro `TypeError: html.closest(...)?.querySelector is not a function` ao interagir com o `ActorRollDialog` ou com diálogos construídos na V13 mas renderizados no ambiente V12.

## Arquivos alterados
- `module/api/versions-overrides/v1.mjs`: Centralizada a normalização dentro da função `parseButtons` convertendo instâncias jQuery em `HTMLElement` nativo antes de realizar a injeção do objeto no método `onClick` configurado pelos novos botões Vanilla JS.

## Decisões Técnicas Relevantes
- Seguimos o padrão técnico definido no nosso _Learning Hub_ de transição híbrida (jQuery/Vanilla) e _Normalização na fronteira_. A alteração previne futuros erros como `TypeError` e garante a migração segura para o v13 sem quebrar retrocompatibilidade.

## Testes Sugeridos
- Abrir um diálogo customizado Vanilla, como o `ActorRollDialog` através de algum ator, e acionar o botão "Rolar". Confirmar que não ocorrem logs de erros pelo console e que a rotina interna (`bt.onClick`) processa com sucesso o encapsulamento.
