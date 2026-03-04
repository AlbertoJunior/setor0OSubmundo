# Reorganização de Pastas: Data Field e Setup

## O que foi feito
- **`module/field` para `module/data/field`**: Transferência de todos os campos de DataModel (`actor-fields.mjs`, `effect-fields.mjs`, `enhancement-field.mjs`, `equipment-field.mjs`, `npc-fields.mjs`, `roll-test-field.mjs`, `trait-field.mjs`) para dentro da pasta pai de Data, organizando estruturalmente melhor as definições de classe e as modelagens.
- **Criação da pasta `module/setup`**: Limpamos a pasta `utils` separando os arquivos de configuração arquitetural. Arquivos migrados:
  - `module/utils/handlerbars-helper.mjs` -> `module/setup/handlerbars-helper.mjs`
  - `module/utils/models.mjs` -> `module/setup/models.mjs`
  - `module/utils/repositories.mjs` -> `module/setup/repositories.mjs`
  - `module/utils/templates.mjs` -> `module/setup/templates.mjs`
  - `module/utils/settings.mjs` -> `module/setup/settings.mjs`
- **Manutenção de Imports**: Todos os arquivos referenciando tais utilitários e os file fields tiveram seus caminhos atualizados em toda a base de código do Foundry, preservando a retro-compatibilidade e uso relativo de imports. O `chat-creator.mjs` e `default-actions.mjs` prosseguem na sua pasta de utilidades.

## Arquivos alterados
- `module/base/sheet/actor/player/actor-sheet.mjs`
- `module/base/sheet/actor/npc/npc-sheet.mjs`
- `module/base/sheet/trait/trait-sheet.mjs`
- Diversos Data Models (`actor-data-model.mjs`, `equipment-data-model.mjs`, `trait-data-model.mjs`)
- `module/hooks/init.mjs` e `module/hooks/ready.mjs`
- (Entre vários outros arquivos de classe dependentes)

## Decisões técnicas relevantes
- Para arquivos estritamente acoplados à inicialização (`InitHookHandle`), decidimos separá-los numa pasta dedicada para que os utilitários fiquem com a função estrita de ter "helper functions" sem estado ou registro global, e as lógicas de setup fiquem alocadas em um pacote inicial.

## Testes sugeridos
- Subir a aplicação e carregar o mundo. Observar no "F12" (Console) se existe algum `Uncaught ReferenceError` ou perda de import.
- Abrir a ficha do jogador e a ficha de NPC para garantir que os campos subjacentes carreguem sem problema.
- Verificar repositórios rodando `/setup/repositories.mjs` pelo console, se possível.
