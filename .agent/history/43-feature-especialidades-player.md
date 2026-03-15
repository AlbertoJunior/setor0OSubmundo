# 43 - Feature: Especialidades na Ficha do Player

**Data:** 15/03/2026

## O que foi feito
Implementação completa da feature de **Especialidades** na ficha do Actor "Player", permitindo que personagens adquiram especializações em habilidades em que possuam nível base ≥ 4. A feature inclui interface para criação, visualização, edição e exclusão, com um sistema robusto de armazenamento e localização.

## Arquivos Alterados

### Novos
- `module/data/field/actor-fields.mjs` — Adicionado `SpecialtyField` (SchemaField).
- `module/creators/dialog/create-specialty-dialog.mjs` — Nova classe para gerenciar os diálogos de Especialidade (view, edit, create).
- `module/base/sheet/actor/player/methods/specialty-methods.mjs` — Handlers de eventos simplificados que delegam para a nova classe de diálogo.
- `templates/actors/dialog/specialty-dialog.hbs` — Template unificado para todos os modos do diálogo (readOnly dinâmico).

### Modificados
- `module/data/actor-data-model.mjs` — Registro de `especialidades` no `PlayerDataModel`.
- `module/enums/characteristic-enums.mjs` — Novo enum `SPECIALTIES`.
- `module/core/actor/actor-utils.mjs` — Adicionado `getSpecialties(actor)` para retornar dados enriquecidos e ordenados.
- `module/helpers/actorLists.mjs` — Registro do mapper `'specialties'` utilizando `ActorUtils`.
- `module/base/sheet/actor/player/actor-sheet.mjs` — Refatoração do sistema de expansão de containers (`#presetSheetExpandContainers` e `#verifyAndExpandContainers`) para ser mais genérico e robusto.
- `templates/actors/shortcuts.hbs` — Inclusão da seção de Especialidades com suporte a grid de 3 colunas e botões de ação (Ver/Editar).
- `templates/actors/status.hbs` — Limpeza de IDs de ícones para seguir o novo padrão genérico de expansão.
- `lang/pt-br.json` & `en.json` — Localização completa do namespace `Especialidade`.

## Decisões Técnicas
- **Refatoração para Classe Dedicada:** Toda a lógica de UI dos diálogos foi movida para `CreateSpecialtyDialog`, seguindo o padrão de design do projeto (`CreateRollableTestDialog`).
- **Eliminação do helper `keyLang`:** Substituído por processamento prévio em `ActorUtils.getSpecialties()`, melhorando a performance e legibilidade dos templates.
- **Sistema de Expansão Genérico:** O `actor-sheet.mjs` agora utiliza uma lógica genérica para detectar ícones de expansão (`[data-action=view] i`), eliminando a necessidade de IDs únicos por ícone.
- **UX Refinada:** 
    - No modo visualização (Eye icon), o diálogo não exibe botões.
    - No modo edição (Pencil icon), o diálogo exibe botões "Apagar" e "Editar".
    - Exclusão protegida por `ConfirmationDialog`.
    - Placeholders específicos para descrição curta e longa.
- **Textarea Fix:** Corrigido problema onde o placeholder da `textarea` não aparecia devido a espaços em branco; agora utiliza condicional Handlebars interno.

## Testes Sugeridos
1. **Criação:** Abrir aba Atalhos (Edição) -> Botão `+` -> O combo deve listar apenas skills ≥ 4 -> Preencher e salvar.
2. **Visualização:** Clicar no ícone de olho -> Diálogo abre em modo leitura, sem botões de ação.
3. **Edição:** Clicar no ícone de lápis -> Alterar descrição ou custo -> Salvar e verificar atualização na grid.
4. **Exclusão:** No modo edição -> Botão "Apagar" -> Confirmar no diálogo de segurança -> Item removido do Actor.
5. **Expansão:** Clicar no chevron do título "Especialidades" -> Container deve expandir/contrair e o ícone deve alternar (up/down).
6. **Persistência:** Fechar e reabrir a ficha -> Verificar se o estado de expansão de cada container foi mantido.
