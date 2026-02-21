# Refatoração e Controles de Compêndios

## O que foi feito
- Refatorado o método de exportação de compêndios (`CompendiumExport.exportCompendiumsToJson`) para gerar JSONs mais limpos: 
  - Propriedades de `_stats` foram removidas tanto dos items individuais quanto das pastas (folders) e movidas para uma propriedade agrupada no root chamada `stats` afim de minimizar verbosidade em conjuntos gigantes.
- Refatorado o método de importação (`CompendiumSync.syncDefaultCompendiums`):
  - Ao carregar jsons, o utilitário agora preenche adequadamente essa mesma `stats` em `_stats` na document creation do Foundry para reter as metadata.
  - Implementado calculador de profundidade (GetDepth) na hora da criação de hierarquia de Folders, permitindo que pastas de N níveis fossem recriadas com sucesso mantendo-se a ordem topológica nas chaves dependentes.
- Modificado o menu de cena "Setor 0: Configurações" do GM (`scene-control-buttons.mjs`):
  - **Exportar Compêndios do Sistema:** Acessa rapidamente a função de exportação atual de compêndios sem necessidade de rodar macros avulsas.
  - **Sincronizar Compêndios (Apagar & Recriar):** Exibe um menu de confirmação (`ConfirmationDialog.open`) que avisa o GM sobre perdas antes de destruir e recarregar os items do mundo com os base packages.

## Arquivos Alterados
- `module/core/pack/compendium-export.mjs`
- `module/core/pack/compendium-sync.mjs`
- `module/hooks/scene-control-buttons.mjs`

## Decisões Técnicas
- A visibilidade restrita destas opções da Interface de Cena apenas para o GM (`game.user.isGM`) e o tipo delas (`button: true`) previne cliques engajados de "toggle" persistente de ferramentas e mantém a interface livre de entulhos pros jogadores limitados que sofreriam Error Permissions se estivessem visíveis.
- Substituída a chamada padrão do sistema Foundry `Dialog.confirm` por `ConfirmationDialog.open`, reaproveitando o framework base da versão do Setor 0 O Submundo, o que garante padronização na aparência do alerta com botões `S0-button-delete` na cor de perigo.

## Testes Sugeridos
- Validar se exportar compêndios retorna tudo corretamente na nova estrutura usando a interface de cena no Foundry (Setor 0 > Botão de Exportar).
- Clicar no importador usando o Dialog Customizado, confirmar a limpeza e conferir o refresh da tela e a correta importação de Pastas Recursivas (Drogas > Substâncias).
