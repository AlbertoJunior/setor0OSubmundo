# Changelog - Preparação para Migração V13

ref: #227cfbbe-ecee-410a-98ea-081ffb315872

## Resumo
Refatoração da camada de compatibilidade da API (`v2.mjs`) e utilitários (`HtmlJsUtils`) para remover dependências estritas do jQuery e preparar o terreno para a migração para Foundry VTT V13.

## Alterações Realizadas

### `module/utils/html-js-utils.mjs`
- **[MODIFICADO]** `setupContent(html)`: Atualizado para aceitar tanto `HTMLElement` (nativo) quanto jQuery Objects.
- **[MODIFICADO]** `setupHeader(html)`: Atualizado para aceitar tanto `HTMLElement` (nativo) quanto jQuery Objects.

### `module/api/versions-overrides/v2.mjs`
- **[MODIFICADO]** `makeClass`:
  - `_postRender`: Refatorado para usar `this.element` (nativo) como fonte primária. Mantém wrapper jQuery `$(this.element)` apenas para chamadas a métodos legados (`configureSheet`, `postRenderConfiguration`).
- **[MODIFICADO]** `createDialog`:
  - `render` listener: Refatorado para obter o elemento da janela via `dialog.element.closest` (nativo), garantindo compatibilidade futura.

## Decisões Técnicas
- **Abordagem Híbrida em Utilitários:** Em vez de duplicar código ou forçar uma migração completa imediata de todos os sheets (V1 e V2), optou-se por tornar o `HtmlJsUtils` polimórfico. Isso garante que sheets legados (V1) continuem funcionando sem alterações, enquanto novos sheets (V2/V13) podem passar elementos DOM nativos.
- **Wrappers Pontuais:** No `v2.mjs`, a conversão para jQuery foi movida para o ponto de chamada dos métodos que *sabidamente* exigem jQuery (`Setor0BaseSheet`), limpando o restante do fluxo para usar Vanilla JS.

## Testes Sugeridos
1.  **V2 Actors:** Abrir sheets V2 e verificar renderização, Dark Mode e controles de cabeçalho.
2.  **V1 Legacy:** Abrir sheets legados para garantir não regressão.
3.  **Dialogs:** Confirmar funcionamento de janelas de diálogo do sistema.

## Status de Migração V12 -> V13

### Correções de Bugs (Pós-Refatoração)
- **[CRÍTICO] Sobrecarga Negativa:** Corrigido bug onde a característica `sobrecarga` recebia valores negativos ou incorretos.
  - *Solução:* Atualizado `actor-data-model.mjs` para usar `NumberField` estrito com `min: 0` e validação adequada.
- **[CRÍTICO] Trait Dialog (Adicionar Traço):** Corrigido `TypeError: html.find is not a function`.
  - *Solução:* Refatorado `trait-dialog.mjs` para usar API nativa (`querySelector`, `addEventListener`), removendo dependência de jQuery.
- **[CRÍTICO] NPC Sheet (Drag & Drop):** Corrigido erro ao arrastar itens em fichas de NPC.
  - *Solução:* Normalização de entrada em `dragabble-methods.mjs` para aceitar tanto jQuery (V1) quanto HTMLElement (V2).
- **[CRÍTICO] Drag & Drop (Desequipar):** Corrigido falha ao arrastar item de Equipado para Mochila.
  - *Solução 1:* Ajustado CSS da `.S0-drop-container` para ter `min-height`, garantindo área de drop válida mesmo vazia.
  - *Solução 2:* Configurado `SortableJS` com `draggable: "li:not(.S0-label-drop-container)"` para ignorar elementos de placeholder.
  - *Solução 3:* Refinado `swapThreshold` e `emptyInsertThreshold` para melhorar usabilidade.
