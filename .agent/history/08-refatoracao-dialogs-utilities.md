# Refatoração de Dialogs e Utilitários: Remoção de jQuery e Normalização

## Contexto
O sistema Setor 0 - O Submundo está em processo de migração para a V13 do Foundry VTT.
A V13 utiliza elementos DOM nativos (`HTMLElement`), enquanto a V12 e versões anteriores dependiam fortemente do jQuery.
O objetivo desta tarefa foi remover a dependência do jQuery de todos os diálogos do sistema e garantir que os métodos utilitários recebam sempre elementos nativos, independentemente da versão do Foundry em execução.

## Alterações Realizadas

### 1. Normalização na Camada de API (Overrides)
A estratégia adotada foi garantir que o objeto `html` passado para os métodos das Apps seja sempre um `HTMLElement`.
- **`v1.mjs` (Legacy)**: 
  - No método `makeClass`, o `activateListeners` foi interceptado para converter `html` (que vem como jQuery object na V1) para `HTMLElement` (`html[0]`) antes de chamar os métodos do sistema (`setupContent`, `configureSheet`, etc.).
  - No `createDialog`, o callback de renderização também foi normalizado.
- **`v2.mjs` (Modern)**:
  - Já trabalha nativamente com `HTMLElement`. Garantido que não há wrapping desnecessário de jQuery (ex: removido `$(html)`).

### 2. Refatoração de Utilitários
Com a garantia da normalização na entrada, os utilitários puderam ser limpos:
- **`HtmlJsUtils.mjs`**: Removidas verificações manuais de `instanceof HTMLElement`.
- **`DialogUtils.mjs`**: Removida verificação no `getDialogFormData`.

### 3. Eliminação do jQuery em Diálogos
Todos os diálogos abaixo foram refatorados para usar Vanilla JS (`querySelector`, `addEventListener`, etc.):
- `NpcDialog`
- `ActorRollDialog`
- `EquipmentSheet` (Parcialmente, apenas métodos de UI/Tabs)
- `AddEquipmentDialog`
- `UpdateEquipmentQuantityDialog`
- `SuperEquipmentEffectsDialog`
- `EnhancementDialog`
- `TraitDialog`
- `CreateRollTestDialog`
- `CreateFormDialog`

### 4. Correções Específicas e Bugs Resolvidos
- **`ActorRollDialog`**: Corrigido bug onde `html.closest('.window-content')` retornava nulo na V2, causando falha ao buscar o `#chat_select`. Implementado fallback para `html.querySelector()`.
- **`AddEquipmentDialog`**: Adicionado `event.preventDefault()` no botão de confirmação. Na V2 (`DialogV2`), botões dentro do form disparam o evento `submit` por padrão, o que causava um erro se não tratado/prevenido.
- **`RepertoryRepository` / `EquipmentRepository`**: Corrigidos bugs de referência (`EnhancementRepository` undefined) e limpeza de array.

## Próximos Passos Sugeridos
- Validar se há outros pontos no sistema (além de Sheets e Dialogs) que consomem `html` como jQuery.
- Monitorar logs de deprecation da V13 para garantir que nenhuma API removida está sendo usada.
