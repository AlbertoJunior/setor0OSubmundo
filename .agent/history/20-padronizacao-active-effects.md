# 19 - Padronização de Arquitetura dos Efeitos Ativos (Active Effects)

## O que foi feito
A aplicação possuía um design despadronizado para criar instâncias de Active Effects e suas Mudanças (`changes`) entre os diferentes `DataModels` dos Itens (`SubstanceEffectField`, `TraitEffectField`, `EnhancementEffectField`, `EnhancementEffectDataChange` etc). Foi implementado um padrão universal de base (`StandardEffectChangeField` e `StandardEffectField`) em `module/field/effect-fields.mjs`.

## Arquivos alterados
- `module/field/effect-fields.mjs` (NEW)
- `module/data/trait-data-model.mjs`
- `module/field/enhancement-field.mjs`
- `module/field/equipment-field.mjs`
- `module/data/equipment-data-model.mjs`
- `module/repository/substance-effect-repository.mjs`
- `module/core/equipment/equipment-utils.mjs`
- `module/repository/superequipment-trait-repository.mjs`
- Elementos removidos: `change-field.mjs`
- **Adicionados de Sistema de Migração**: `system.json`, `module/hooks/init.mjs`, `module/hooks/ready.mjs`, `module/utils/settings.mjs`, `module/migration/migration-handler.mjs`, `module/migration/migrations/migrate-active-effects.mjs`

## Decisões técnicas relevantes
Optou-se por introduzir dois novos campos e refatorar as dependências para utilizá-los:
1. `StandardEffectChangeField` assume a base de todos os sub-nós `changes` e estende os antigos valores com campos suportados para Aprimoramentos (`typeOfValue`).
2. `StandardEffectField` substitui o antigo `SubstanceEffectField` e permite a utilização de uma Array de `changes` por Efeito ao invés de um objeto `change` solitário, unificando a forma como o `equipment-utils.mjs` processa os efeitos antes de empacotá-los em formato `ActiveEffect` e injetá-los no Foundry.
3. **Sistema de Migração de Dados Nativo (Foundry):** Adicionou-se `MigrationHandler` invocado no hook `ready` caso a versão do mundo seja mais antiga que a versão (`0.0.3`) declarada no `system.json`. Ele fará a conversão automática das propriedades legado (`.change`) nos documentos antigos do compêndio e na aba de Itens/Actors dos mundos existentes para o novo padrão de array `.changes`.

> [!WARNING] ATUALIZAÇÃO DE ARQUITETURA
> A lógica descrita no item 3 acima sobre o funcionamento do `MigrationHandler` com a *Via 1* alterando os dados ativamente (Acomodação em Memória Estrita) provou-se **falha** perante as travas do banco de dados do V13 (loop infinito por Diff Vazio).
> Toda a arquitetura do `migrate-active-effects.mjs` foi posteriormente **re-escrita e desativada**. Consulte a documentação atualizada do *Database-First Approach* no registro **41-migracao-ids-rigidez.md** para entender a forma viável e definitiva atual!

## Testes sugeridos
- Associar um Traço ao Ator e verificar se sua `particularity` e efeito são lidos e atrelados ao Painel de Efeitos.
- Consumir uma Substância através do inventário para observar se os múltiplos bônus da Substância afetam corretamente o Personagem Ativo (Token) e não quebram os status de sistema na interface de Chat.
- Verificar nas fichas de Aprimoramentos se os escalonamentos continuam lendo corretamente o `typeOfValue`.
