# 45 - Correção Bug Migração Active Effects

**Data:** 2026-03-24

## O que foi feito
Correção do bug onde a migração de Active Effects (`change → changes`) não encontrava os itens e re-executava infinitamente a cada reinício do mundo.

## Causa Raiz
O Schema Validation do Foundry V13 destruía a propriedade `change` (formato antigo) dos `_source` antes da Via 2 rodar, porque `StandardEffectField` só define `changes` no schema. Resultado: `needsActiveEffectsMigration()` nunca encontrava dados para migrar.

## Solução
Invertida a lógica do padrão Bi-direcional:
- **Via 1 (`migrateDataModel`)**: Agora faz a transformação `change → changes` diretamente no `source`, antes do schema validar.
- **Via 2 (`migrate`)**: Simplificada para forçar `.update()` com os dados em memória (já transformados), usando o diff do Foundry para persistir apenas itens com diferenças reais.

## Arquivos Alterados

| Arquivo | Tipo | Descrição |
| :--- | :--- | :--- |
| `module/migration/migrations/migrate-active-effects.mjs` | MODIFY | Reescrito: Via 1 transforma dados; Via 2 persiste via diff |

## Decisões Técnicas
- O padrão "sensor puro" da Via 1 (pattern-data-migration.md) **não funciona** quando a propriedade antiga não existe no schema. Neste caso, a transformação deve ocorrer obrigatoriamente na Via 1.
- O `Document.update()` do Foundry faz **merge recursivo** — propriedades ausentes no payload **não são removidas** do banco. Para deletar chaves antigas (ex: `change`), é obrigatório usar paths dot-notated com a sintaxe `-=key`: `"system.effects.0.-=change": null`.
- Removidas funções `needsActiveEffectsMigration` e `migrate(itemDataSource,...)` (antiga) — substituídas por `hasEffects`, `getEffectsUpdateData`, `getEmbeddedEffectsUpdateData` e `logMigration`.

## Testes Sugeridos
1. Iniciar mundo com itens Substance contendo `effects[].change` (formato antigo)
2. Verificar no console que a migração executa e gera diff log
3. Reiniciar mundo e verificar que a migração **não** re-executa
