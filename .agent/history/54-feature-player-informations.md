# 54 — Feature: Player Informations no Menu Setor 0

## O que foi feito
Implementação de uma nova ferramenta exclusiva para GM no menu lateral Setor 0 (Scene Controls), chamada **"Informações dos Jogadores"**. A ferramenta consiste em:

1. **Botão no Scene Controls** — Ícone `fas fa-users`, visível apenas para GM, order 500.
2. **Dialog de Listagem** (ApplicationV2 + Handlebars) — Lista todos os usuários do mundo com:
   - Indicador visual de status online (verde com glow) / offline (cinza)
   - Avatar, nome, personagem padrão e cor do jogador
   - Indicativo `(GM)` para o mestre do jogo
3. **Dialog de Detalhes** (ApplicationV2 + Handlebars) — Ao clicar em um jogador, exibe:
   - Cabeçalho com avatar, nome, status e cor
   - Personagem padrão atribuído (clicável para abrir a ficha)
   - Lista de todos os actors com permissão LIMITED, OBSERVER ou OWNER (com ícones: `fa-eye-slash`, `fa-eye`, `fa-crown` — padrão do ShareDocumentDialog)
   - Flags do sistema (setor0OSubmundo) em formato flat com caminho pontilhado, em destaque
   - Outras flags (módulos/core) agrupadas por namespace em seções minimizadas (`<details>`/`<summary>`)
4. **Gerenciamento de Flags (GM Only)**:
   - Edição inline: Clique no valor de qualquer flag para abrir um input editável, e salve via `user.setFlag()`.
   - Remoção: Botão de lixeira com confirmação via `DialogV2` que aciona `user.unsetFlag()`.
   - Adição: Botão `+` no cabeçalho de cada grupo para inserir uma nova flag (chave e valor) naquele namespace.

## Arquivos alterados

| Ação | Arquivo | Descrição |
|:---|:---|:---|
| MODIFY | `module/hooks/scene-control-buttons.mjs` | Import + botão GM + método `#mountPlayerInformationsButton` |
| NEW | `module/creators/dialog/player-informations-dialog.mjs` | Dialog de listagem de jogadores |
| NEW | `module/creators/dialog/player-detail-dialog.mjs` | Dialog de detalhes com lógica de gerenciar/editar flags |
| NEW | `templates/dialog/player-informations.hbs` | Template da listagem |
| NEW | `templates/dialog/player-detail.hbs` | Template de detalhes com formulários de edição |
| MODIFY | `lang/pt-br.json` | Traduções PT-BR (CONTROL.PLAYER_INFORMATIONS_BUTTON) e chaves de edição |
| MODIFY | `lang/en.json` | Traduções EN (CONTROL.PLAYER_INFORMATIONS_BUTTON) e chaves de edição |
| MODIFY | `styles/components/styles-dialog.css` | Estilos S0-player-*, tabelas dinâmicas e inputs S0-flag-* |

## Decisões técnicas relevantes

- **Ícones de permissão** reutilizados do `ShareDocumentDialog` (`fa-crown` = Owner, `fa-eye` = Observer, `fa-eye-slash` = Limited).
- **Flags em formato flat** com caminho pontilhado (`darkMode → true`) conforme solicitado pelo usuário.
- **Gerenciamento de Flags API**: A API `setFlag` e `unsetFlag` funciona sem restrições em documentos do tipo `User` quando executada por GMs, dispensando a necessidade de sockets.
- **Parse automático de tipos**: Adicionado um helper privado `#parseValue` no dialog para tentar converter inputs de string do GM em `boolean`, `number` ou `JSON objects/arrays` antes de salvar no banco de dados.
- **Agrupamento dinâmico**: Flags agora são coletadas dinamicamente e agrupadas iterando pelas keys, com suporte para adicionar novas flags diretamente em namespaces já existentes.

## Testes sugeridos

1. Iniciar como GM e verificar botão `fa-users` no menu Setor 0
2. Clicar no botão e confirmar listagem com todos os users
3. Verificar ícone online/offline (conectar segundo jogador)
4. Clicar em um jogador e validar o dialog de detalhes
5. Verificar personagem padrão e lista de actors acessíveis
6. Confirmar tabela de flags do sistema e seção "Outras Flags" minimizada
7. Clicar em "Abrir Ficha" nos actors e confirmar que a sheet abre
8. Testar alternância PT-BR / EN nas traduções
