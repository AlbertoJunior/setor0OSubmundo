# Changelog - Migração V13 Fase 2: Actor Sheet Sem jQuery

ref: #227cfbbe-ecee-410a-98ea-081ffb315872

## Resumo
Remoção completa da dependência de jQuery na `ActorSheet` (V2) e seus componentes auxiliares. O código foi refatorado para utilizar Vanilla JS (`querySelector`, `addEventListener`), mantendo compatibilidade com V1 através de handlers híbridos.

## Alterações Realizadas

### Core & Base Sheets
- **`Setor0BaseSheet.mjs`**: Refatorado `configureSheetEvents` para usar `querySelectorAll` e suportar tanto `HTMLElement` quanto jQuery Objects na injeção de eventos.
- **`Setor0BaseActorSheet.mjs`**:
    - `presetStatusVitality`: Refatorado para usar `querySelector`.
    - `presetStatusProtect`: Refatorado para usar `querySelector`.
    - `setupTabs`: Refatorado para usar `querySelector`.

### Actor Sheet V2
- **`actor-sheet.mjs`**:
    - `configureSheet` e `postRenderConfiguration`: Agora aceitam e normalizam para `HTMLElement`.
    - `presetSheet` e métodos privados: Substituído todo uso de `html.find()` por `querySelector()`/`querySelectorAll()`.
    - `SheetActorDragabbleMethods` chamado com elemento nativo.

### Utilities & Helpers
- **`dragabble-methods.mjs`**:
    - Substituído `html.find()` por `querySelector()`.
    - Substituído `.on('drop')` por `.addEventListener('drop')`.
    - Uso de `element.style` nativo em vez de css jquery.
- **`html-js-utils.mjs`**:
    - `setupTabs`: Reescrevfe lógica de criação de abas e binders para Vanilla JS.
    - `presetAllDragEvents`: Suporte híbrido atualizado.
- **`dialog-utils.mjs`**:
    - `getDialogFormData`: Atualizado para aceitar `HTMLElement` ou jQuery.

### API Overrides
- **`v2.mjs`**: Removidos os wrappers `$(html)` que eram usados para compatibilidade temporária. O fluxo V2 agora é "jQuery-free" por padrão.

## Impacto
- Sheets V2 agora são compatíveis com a especificação "No jQuery" do Foundry V13.
- Sheets V1 (se houver) continuam funcionando graças à normalização de input nos métodos base.
