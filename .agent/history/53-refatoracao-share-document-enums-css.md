# Refatoração do Share Document

## O que foi feito
- Criação do Enum `SocketEvent` em `socket-enums.mjs` para padronizar o envio e recebimento de ações socket (substituindo a string hardcoded `"showDocument"`).
- Refatoração do `SocketHandler`, `SocketUtils` e `ShareDocumentDialog` para utilizar o novo enum.
- Extração dos botões de controle de janela de compartilhamento para o `SocketUtils.shareDocumentActions`.
- Injeção explícita do `actions: SocketUtils.shareDocumentActions` no `SHEET_CONFIG` das planilhas:
  - `BaseActorSheet` (refatorado)
  - `npc-sheet` (adicionado)
  - `equipment-sheet` (adicionado)
  - `trait-sheet` (adicionado)
- Refatoração do formato de `actions` nos cabeçalhos das fichas para usar exclusivamente uma lista (array) de objetos em vez de um objeto plano mapeado por chaves.
- Remoção de estilos inline (inline styles) no template `templates/dialog/share-document.hbs`, os substituindo por classes CSS utilitárias mapeadas (ex: `.S0-flex`, `.S0-mb-8`, `.S0-gap-6`).

## Arquivos alterados
- `module/enums/socket-enums.mjs` (criado)
- `module/core/socket/socket-handler.mjs`
- `module/core/socket/socket-utils.mjs`
- `module/api/versions-overrides/v2.mjs`
- `module/creators/dialog/share-document-dialog.mjs`
- `module/base/sheet/actor/BaseActorSheet.mjs`
- `module/base/sheet/actor/npc/npc-sheet.mjs`
- `module/base/sheet/equipment/equipment-sheet.mjs`
- `module/base/sheet/trait/trait-sheet.mjs`
- `templates/dialog/share-document.hbs`

## Decisões técnicas relevantes
- **Configurações via SHEET_CONFIG**: Para garantir que janelas de Item e NPCs recebessem os botões de controle de janela (`window.controls` no AppV2), a constante exportada `SocketUtils.shareDocumentActions` foi injetada no `SHEET_CONFIG` de cada janela.
- **Processamento de Ações via Array no AppV2**: O método `_initializeApplicationOptions` em `v2.mjs` foi modificado para ler `SHEET_CONFIG.actions` exclusivamente como array de objetos. Ele mescla as ações ao longo da cadeia de protótipos (herança filho-para-pai) usando um `Map` indexado pelo `id`, garantindo que a classe filha tenha prioridade sobre a pai.

## Testes sugeridos
1. Abrir um personagem de jogador, confirmar que os botões "Compartilhar" (todos e específico) estão visíveis no cabeçalho.
2. Abrir um NPC, Item ou Equipamento e confirmar que os botões aparecem e funcionam corretamente.
3. Clicar no botão para "Mostrar para Específicos" e verificar se o Modal renderiza corretamente utilizando o CSS das classes utilitárias (sem estar visualmente quebrado).
4. Compartilhar um Item/NPC com outro jogador logado e garantir que a janela se abre para ele, certificando a ação do Socket.
5. Verificar se é possível estender o array de ações em uma ficha (ex: `[...SocketUtils.shareDocumentActions, customAction]`) e se a nova ação é renderizada.

