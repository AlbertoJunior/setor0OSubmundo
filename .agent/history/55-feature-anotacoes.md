# 55 - Feature Anotações (Player & NPC)

**Data:** 10/06/2026

## O que foi feito

Implementação da feature "Anotações" para fichas de Personagem (Player) e PNJ (NPC). Permite adicionar anotações breves com descrição curta e longa, visualizar em dialog read-only, editar e apagar.

### Player
- Seção "Anotações" na aba Extras, posicionada abaixo de "Especialidades"
- Container contraído por padrão, com expand/contract via chevron
- Listagem em single-column (uma por linha)
- Botões de adicionar (+), editar (lápis) e ver (olho)

### NPC
- Nova aba dedicada "Anotações" com ícone `fa-note-sticky`
- Mesma funcionalidade do Player (criar, editar, apagar, visualizar)
- Aba posicionada após "Equipamentos"

## Arquivos alterados

### Novos (4)
| Arquivo | Descrição |
|:---|:---|
| `module/data/field/actor-fields.mjs` | `NoteField` (SchemaField) adicionado |
| `module/creators/dialog/create-note-dialog.mjs` | Classe `CreateNoteDialog` |
| `templates/actors/dialog/note-dialog.hbs` | Template HBS do dialog |
| `module/base/sheet/actor/player/methods/note-methods.mjs` | Handler `handlerNoteEvents` |
| `templates/npc/notes.hbs` | Template da aba Anotações do NPC |

### Modificados (11)
| Arquivo | Descrição |
|:---|:---|
| `module/data/actor-data-model.mjs` | `anotacoes` em `BaseActorDataModel` |
| `module/enums/characteristic-enums.mjs` | Enum `NOTES` |
| `module/core/actor/actor-utils.mjs` | Método `getNotes()` |
| `module/helpers/actorLists.mjs` | Mapeamento `'notes'` |
| `module/base/sheet/actor/player/methods/sheet-methods.mjs` | Registro `notes: handlerNoteEvents` |
| `templates/actors/extras.hbs` | Bloco Anotações abaixo de Especialidades |
| `module/base/sheet/actor/player/actor-sheet.mjs` | mapEvents + expand + constructor |
| `templates/npc/npc-sheet.hbs` | Partial `{{> npcNotes this}}` |
| `module/base/sheet/actor/npc/npc-sheet.mjs` | Template + events |
| `lang/pt-br.json` | Bloco `Anotacao` |
| `lang/en.json` | Bloco `Anotacao` |

## Decisões técnicas

1. **BaseActorDataModel:** Campo `anotacoes` foi adicionado no `BaseActorDataModel` (não no Player/NPC) para que ambos herdem automaticamente.
2. **NoteField simplificado:** Sem campo de habilidade/custo — apenas `descricao_curta` e `descricao_longa`.
3. **Handler reutilizável:** `handlerNoteEvents` é importado tanto pelo Player quanto pelo NPC, evitando duplicação de lógica.
4. **Layout single-column:** Conforme solicitado, usa `S0-flex-col` em vez do grid 3 colunas das especialidades.
5. **NPC sem expand/contract:** Como é uma aba dedicada, não usa container contraído.

## Testes sugeridos

1. Player: Criar anotação → verificar listagem → visualizar (olho) → editar → apagar
2. NPC: Nova aba → mesmos testes de CRUD
3. Verificar que botões de edição só aparecem com `editable=true`
4. Verificar localização em pt-br e en
5. Verificar persistência do estado expand/contract entre re-renders no Player
