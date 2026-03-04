# 27 - Organização de Macros de Personagem

## 📋 O que foi feito
- Criação e abstração da lógica de gerenciamento de pastas de Macros e Journals no VTT utilizando um novo utilitário centralizado (`FolderUtils`).
- Refatoração da criação de Macros (`MacroUtils.createMacro` e `RollTestUtils.createMacroByRollTestData`) para inserir macros dinamicamente na pasta "Jogadores -> [Nome do Personagem]", caso estejam vinculadas a um ator.
- Melhoria na segurança e padronização do script `MacroSync` e `MacroInstaller` ao extrair constantes (`ROLE_GM`, `ROLE_USER`) e flexibilizar as checagens com *optional chaining*.

## 📂 Arquivos Alterados
- `module/core/rolls/roll-test-utils.mjs`: Delegação da construção e retorno de pastas para o novo utilitário.
- `module/core/macro/macro-utils.mjs`: Adição do parâmetro `folder` ao payload estrito de `FoundryApi.Macro.create`.
- `module/base/sheet/equipment/methods/equipment-item-roll-methods.mjs`: Injeção de `actor: item.actor` ao acionar a criação de macro de um item equipado.
- `module/utils/folder-utils.mjs`: **(Novo arquivo)** Responsável por pesquisar, criar e organizar pastas genéricas, incluindo dinâmicas de donos e ID.
- `module/core/macro/macro-sync.mjs`: Centralização da chamada de criação genérica no compêndio base `macros` delegando o `folder` via `FolderUtils` atrelado aos *safety checks*.
- `module/core/macro/macro-installer.mjs`: Refatorado usando `getSystemFlag` para a checagem coesa do ID Fonte (*Source ID*).
- `module/utils/flags-utils.mjs`: Remoção do utilitário fixo `getMacroFlag`, unificando as buscas pelo `getSystemFlag`.
- `module/constants.mjs`: Adicionado as constantes globais vinculadas a regras (`ROLE_GM`, `ROLE_USER`) e `CHARACTER_ID`.

## 🛠 Decisões Técnicas Relevantes
- **Clean Code e SRP:** A manipulação direta da API do Foundry (criação e validação do objeto Pasta/Folder) foi extraída inteiramente e isolada em `FolderUtils`. Dessa forma, o utilitário de testes de rolagem se isenta desse conhecimento e foca na sua responsabilidade original.
- **Null Safety/Blindagem:** Todos os sub-aninhamentos de *flags* foram protegidos com `?.` (Optional Chaining) e sanados através de `.filter(Boolean)` no `.map()` para estancar problemas causados por relíquias/documentos sem essas bandeiras (macros de versões antigas do projeto).
- **Adequação à Arquitetura:** O uso de `Folder.create({ ... })` global foi removido, em favor do contrato seguro `FoundryApi.Documents.Folder.create(...)` já exigido pela infraestrutura preparada visando a V13 que restringe operações arbitrárias no DataStore.

## 🧪 Testes Sugeridos
- Arrancar um item passível de rolagem da ficha para a Hotbar (Macro). Ele deve criar as pastas "Jogadores > [Nome da Ficha]" adequadamente (se já não existirem).
- Validar se repetições na criação evitam sobrecargas nas pastas.
- Sincronizar as Compendiums ou abrir o diálogo de Sync (Logado de GM) validando a redefinição de permissões caso houvesse macros ausentes.
