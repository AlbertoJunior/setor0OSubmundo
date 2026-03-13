# Histórico: [42]-estudo-hooks-assincronos

## O que foi feito
- Estudo sobre o funcionamento dos Hooks no Foundry VTT, com foco em operações assíncronas.
- **CORREÇÃO**: A sugestão inicial de capturar a Promise do `init` externamente (`systemInitPromise`) estava ERRADA e quebrava o sistema — o Foundry retornava `undefined` e avançava para `ready` prematuramente.
- Confirmado que o Foundry **aguarda** Promises de callbacks `async` em hooks de ciclo de vida (`init`, `setup`, `ready`).
- Confirmado que `Hooks.callAll()` para hooks customizados é **síncrono** (não aguarda Promises).

## Arquivos Alterados
- [setor0OSubmundo.mjs](../../setor0OSubmundo.mjs) — Mantido o padrão original `async/await`; adição de `Hooks.callAll(SYSTEM_HOOKS.GM_REGISTER_MIGRATIONS)` dentro do `GM_INIT`.
- [constants.mjs](../../module/constants.mjs) — Adição do hook `GM_REGISTER_MIGRATIONS`.
- [migrate-hardness-ids.mjs](../../module/migration/migrations/migrate-hardness-ids.mjs) — Migrado para escutar `GM_REGISTER_MIGRATIONS`.
- [migrate-active-effects.mjs](../../module/migration/migrations/migrate-active-effects.mjs) — Migrado para escutar `GM_REGISTER_MIGRATIONS`.
- [init.mjs](../../module/hooks/init.mjs) — `game.user.isGM` trocado por `game.user?.isGM` para segurança.
- [Setor0CombatTracker.mjs](../../module/base/document/Setor0CombatTracker.mjs) — Optional chaining em `game.user?.isGM`.

## Decisões Técnicas
- **Padrão `async/await` em lifecycle hooks**: Mantido como correto. O Foundry aguarda a resolução da Promise.
- **Hook `GM_REGISTER_MIGRATIONS`**: Criado como sub-hook síncrono disparado dentro do `GM_INIT`, separando responsabilidades (registro de hooks vs registro de migrações).
- **Callbacks síncronos em hooks customizados**: Regra mantida — como `callAll` é síncrono, os callbacks devem ser síncronos para garantir determinismo.

## Testes Realizados
- Usuário testou manualmente com `console.warn` em todos os hooks.
- Ordem confirmada: init → GM_INIT → GM_REGISTER_MIGRATIONS → ready.
- Testado tanto como GM quanto como Player.
