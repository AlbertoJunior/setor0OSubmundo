# Log 51 - Implementação de TextEditor Enrichers e DataModels de Efeitos Ativos (V13+)

## O Que Foi Feito
Implementamos duas arquiteturas avançadas baseadas nos padrões modernos do Foundry V13 e V14, mantendo Fallback estrito para a V12.

1. **TextEditor Enrichers (V12-V14)**:
   - Criado o método proxy `FoundryApi.registerCustomEnricher` para isolar a injeção na API do Foundry.
   - Criado o `EnrichersHookHandle` que registra o *pattern* de Traços (`@Traco[NomeOuId]`), gerando âncoras interativas que buscam dados em tempo real do `TraitRepository` e disparam abertura das fichas detalhadas do sistema.
   - Refatorada a mecânica de cliques do enricher aplicando o padrão de delegação global de eventos (**Event Delegation**) no `document.body`. Isso contorna a sanitização nativa do Foundry (V12+) que destrói event listeners locais ao converter elementos em HTML strings.
   - Ajustados os `datasets` gerados, substituindo `data-uuid` por uma chave própria (`data-custom-link="Trait"`) para evitar conflitos e warnings com os handlers nativos do VTT.
   - Criada a enciclopédia central `SYSTEM-MANUAL.md` na raiz do projeto contendo as instruções de uso.

2. **Active Effects DataModels (V13/V14)**:
   - Migrado o armazenamento sistêmico de Efeitos Ativos. Na V13+, os efeitos usam a classe `SystemActiveEffectModel` injetando diretamente no objeto `.system` (`effect.system.originId`) em vez de no objeto legado de `flags`.
   - Adicionada a rotina de registro condicional no `init.mjs`.

3. **Fallback V12 (ActiveEffectsUtilsV12)**:
   - Para evitar *ifs* caóticos na raiz do utilitário e suportar simultaneamente a V12, todo o legado baseado em `flags` foi extraído para a classe `@deprecated` `ActiveEffectsUtilsV12`. 
   - A classe principal agora tenta ler as propriedades nativas de `.system` e repassa para a V12 apenas se as propriedades não existirem.

## Arquivos Alterados
- `module/api/foundry-api.mjs`
- `module/hooks/enrichers/enrichers-hook.mjs` (NOVO)
- `module/hooks/init.mjs`
- `SYSTEM-MANUAL.md` (NOVO)
- `README.md`
- `module/data/active-effect-data-model.mjs` (NOVO)
- `module/core/effect/active-effects-utils.mjs`
- `module/core/effect/active-effects-utils-v12.mjs` (NOVO)

## Status de Migração
- Preparação para a V13/V14 avançada. O uso do Ponto 2 garante compatibilidade futura (V15) com Efeitos fortemente tipados. O Fallback legados (V12) poderá ser removido futuramente com a exclusão segura de apenas um arquivo.
