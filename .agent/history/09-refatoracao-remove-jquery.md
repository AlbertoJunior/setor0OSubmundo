# 09-refatoracao-remove-jquery.md

## Resumo
Remoção de dependências de jQuery nos arquivos `enhancement-methods.mjs` e `Setor0ChatLog.mjs`, substituindo por métodos nativos do JavaScript (Vanilla JS).

## Arquivos Alterados
- `module/base/sheet/actor/player/methods/enhancement-methods.mjs`
- `module/core/chat/Setor0ChatLog.mjs`

## Decisões Técnicas
- **Enhancement Methods**: 
  - Substituição de `$(selector)` por `.querySelector()` ou `.querySelectorAll()`.
  - Substituição de `.prop('selectedIndex')` por atribuição direta `.selectedIndex`.
  - Substituição de `.trigger('change')` por `.dispatchEvent(new Event('change', { bubbles: true }))` para garantir que ouvintes delegados capturem o evento adequadamente.
  - Uso de `element.value` e `element.dataset` em vez de `.val()` e `.data()`.
- **Setor0ChatLog**:
  - Refatoração do método `updateButtonOnContent` para manipular o conteúdo da mensagem criando um elemento `div` temporário (`div.innerHTML = message.content`), permitindo o uso de `querySelector` e manipulação direta do DOM, eliminando a criação de objetos jQuery.
- **Verificação de Outros Arquivos**:
  - `html-js-utils.mjs`, `foundry-api.mjs`, `v1.mjs`: Analisados e constatados que contêm apenas comentários sobre jQuery ou wrappers de compatibilidade necessários para V1, sem uso ativo de métodos jQuery para lógica de negócio.
  - `dom-listeners.mjs`: Contém jQuery mas foi explicitamente excluído da refatoração conforme solicitação.
  - `element-creator-jscript.mjs`: Verificado como livre de jQuery.

## Testes Sugeridos
1. **Aprimoramentos**:
   - Abrir ficha de ator.
   - Adicionar/Remover aprimoramentos.
   - Alterar níveis de aprimoramento e verificar se a interface atualiza e se mensagens de erro/sucesso aparecem corretamente.
   - Testar o botão "Check" e "View" nos aprimoramentos.
2. **Chat Log**:
   - Realizar rolagens que gerem botões no chat (Consciência, Perseverança, Quietude).
   - Clicar nos botões e verificar se eles são desabilitados e se o texto muda para "Utilizada", persistindo a alteração no chat.
