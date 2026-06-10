# 56 - Anotações: Botão "Enviar no Chat"

**Data:** 10/06/2026

## O que foi feito

Adicionado o botão de "Enviar no Chat" (Send to Chat) no dialog de visualização de anotações (modo read-only/Ver).
Ao ser acionado, envia uma mensagem formatada ao chat representando o ator atual.
O conteúdo da mensagem é gerado a partir de um template Handlebars dedicado seguindo o padrão arquitetural `MessageCreator` do sistema.

### Formatação da Mensagem no Chat
- Container principal: `.S0-message-content`.
- Cabeçalho: **Anotação** (com classes `S0-block S0-font-bold`).
- Título da anotação: **[Descrição Curta]** em tag `h4` com classe `h4`.
- Conteúdo da anotação: **[Descrição Longa]** (se houver) em bloco com a classe `S0-message-simple-text`.

## Arquivos alterados

### Novos (2)
| Arquivo | Descrição |
|:---|:---|
| `module/creators/message/note-message.mjs` | Classe `NoteMessageCreator` seguindo o padrão arquitetural do sistema |
| `templates/messages/notes/note.hbs` | Template Handlebars para renderização do card de chat da anotação |

### Modificados (2)
| Arquivo | Descrição |
|:---|:---|
| `module/base/sheet/actor/player/methods/note-methods.mjs` | Passagem do parâmetro `actor` no método `#openViewDialog` |
| `module/creators/dialog/create-note-dialog.mjs` | Importação do `NoteMessageCreator`, recepção de `actor` em `view(note, actor)` e chamada ao MessageCreator na action do botão |

## Decisões técnicas

1. **Padrão MessageCreator:** Separação completa da lógica de renderização HTML e do Javascript usando templates `.hbs`.
2. **Reutilização de Ator:** O parâmetro `actor` é passado do handler para o criador do dialog, permitindo que a mensagem de chat seja associada corretamente ao ator ativo.
3. **Uso de ChatCreator:** Utilização do wrapper centralizado do sistema `ChatCreator.sendToChat` que garante conformidade com as APIs do Foundry VTT v12+.
4. **Internacionalização:** Uso da chave de tradução `S0.Enviar_No_Chat` para rotular o botão e `Anotacao.Anotacao` para o título no chat.

## Testes sugeridos

1. Abrir a aba de Extras (Player) ou Anotações (NPC).
2. Clicar no botão de visualização (ícone de olho) em uma anotação existente.
3. Verificar a presença do botão "Enviar no Chat".
4. Clicar no botão e verificar a formatação da mensagem no chat do Foundry VTT.
