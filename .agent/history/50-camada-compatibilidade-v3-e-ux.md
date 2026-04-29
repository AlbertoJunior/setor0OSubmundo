# 53 - Camada de Compatibilidade V3 (Foundry V14) e Melhorias de UX

## O que foi feito
Implementada a camada de compatibilidade `v3` para prevenir quebras da atualização para o Foundry V14, blindando a criação de Efeitos Ativos em tempo de execução. Também foram realizadas correções de injeções obsoletas e melhorias de UX em diálogos da ficha (Traits).

## Arquivos Alterados
- `module/api/versions-overrides/v3.mjs` (NOVO)
- `module/api/versions-overrides/v2.mjs`
- `module/api/create-application.mjs`
- `module/api/foundry-api.mjs`
- `module/core/effect/active-effects-utils.mjs`
- `module/base/sheet/actor/player/methods/trait-methods.mjs`
- `module/creators/dialog/trait-dialog.mjs`

## Decisões Técnicas Relevantes
- Criação do método `FoundryApi.formatActiveEffectData(data)`. O método determina em *runtime* a versão em uso via `game?.release?.generation` e ajusta os dados do ActiveEffect. Se versão >= 14, ele converte `{ changes }` para `{ system: { changes } }`, assegurando total compatibilidade V12, V13 e V14 sem corromper nenhuma build.
- Remoção da injeção arbitrária não documentada de `statuses: [trait.id]` da criação de traços, favorecendo a arquitetura robusta já existente: busca do efeito pelo `Origin ID` com `ActiveEffectsUtils.getActorEffect(actor, itemId)`.
- Adição de suporte ao `closeDialog: false` nos Dialogs contínuos, garantindo fluidez no preenchimento na interface.

## Status de Migração
Migração v13 -> v14 em andamento: Compatibilidade com V14 (Efeitos Ativos) garantida.
