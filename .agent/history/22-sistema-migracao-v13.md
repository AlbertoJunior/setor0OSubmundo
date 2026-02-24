# 22 - Sistema Nativo de Migração V13

## O que foi feito
A aplicação agora possui um motor integrado de migração de banco de dados e atualização de Schemas focado em manter a integridade dos atributos que foram renomeados (ex: propriedades de Efeitos de `change` para `changes`). O ecossistema é dividido em uma limpeza imediata em memória pelo `DataModel` oficial do Foundry, somado a um loop de salvamento persistente executado durante a inicialização do Mestre.

## Arquivos alterados
- `module/migration/migration-handler.mjs` (NEW)
- `module/migration/migrations/migrate-active-effects.mjs` (NEW)
- `module/migration/migrations/index.mjs` (NEW)
- `module/hooks/init.mjs`
- `module/hooks/ready.mjs`
- `module/utils/settings.mjs`
- `module/constants.mjs`
- `module/data/equipment-data-model.mjs`
- `system.json` (Alterados os registros dos nomes da compendium packs e Version para 0.0.3)

## Decisões técnicas relevantes
1. **Padrão Oficial de TypeDataModel:** Para evitar que o Foundry DataModel v13 dissipe propriedades que não estão mais explícitas no Schema antes mesmo do jogo abrir, foi adotado o método `static migrateData(source)` diretamente no `equipment-data-model.mjs`. Ele intercepta o carregamento, reajusta propriedades antigas (`change`) para os arrays novos (`changes`) e repassa para a validação.
2. **Encapsulamento Unificado:** Em vez de espalhar lógicas pela classe de data, as rotinas de conversão são importadas do arquivo exclusivo da migração (Ex: `ActiveEffectsMigration.migrateDataModel`) e apenas referenciadas no `TypeDataModel`.
3. **Persistência Assíncrona no Banco (MigrationHandler):** Apenas alterar no `DataModel` faz a ficha funcionar perfeitamente, mas no arquivo físico bruto o atributo permanece velho e custoso. Um script acoplado ao hook `ready` vasculha compêndios, atores e itens, comparando as versões do sistema (via `isNewerVersion`). Quando acionado, ele simplesmente força a re-gravação (`.update()`) oficial dos objetos — que já foram polidos de forma limpa pelo `migrateData(source)` — persistindo-os nas tabelas físicas.

## Status de Migração
- Arquitetura nativa estabelecida, podendo ser evoluída com observação no futuro comparada a outros sistemas v13.

## Testes sugeridos
- Verifique se nenhuma mensagem indevida ocorre no load.
- Compare a visualização do `SubstanceEffectField` nos Itens na V0.0.3, confirmando a conversão limpa.
