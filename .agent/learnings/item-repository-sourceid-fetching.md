# Obtenção de Dados Originais de Itens via sourceId e Repositórios

## Problema
Ao tentar calcular o custo de experiência (XP) dos `Traços` (Bons e Ruins) diretamente através das propriedades contidas na lista de Embedded Documents (`actor.system.tracos.bons`), os dados retornavam incompletos ou não detinham a informação do custo original de "XP" do traço, gerando cálculos falhos na Calculadora de Experiência. Além disso, ao acessar os `Repertórios` (Aliados, Informantes), buscou-se utilizar métodos de contagem ou utilitários errôneos (como `ActorUtils.getAllies`) quando os dados do ator armazenam corretamente os níveis no próprio sistema sob `CharacteristicType`.

## Causa
No Foundry VTT, quando itens são inseridos em um Ator a partir de um Compendium, eles frequentemente carregam apenas os dados mais básicos e mutáveis de sistema para a ficha (evitando bloat de JSON). O custo de XP e descrições pesadas de um Traço geralmente permanecem estáticos no compêndio/repositório de base. Para listas simples numéricas como o Repertório, as informações estão armazenadas em caminhos sob o objeto customizado `actor.system` associado a Enums (`CharacteristicType.REPERTORY`), enquanto os getters dedicados como `ActorUtils.getAllies()` recuperam arrays de Itens completos e não os pontos alocados de ficha de jogador.

## Solução
1. **Traços e Embedded Items:** Não confie nas propriedades intrínsecas ao `actor.system` para dados estáticos do sistema de regras (como o XP do Traço). Em vez disso, extraia o `sourceId` (UUID de origem) armazenado no item incorporado do ator, e então chame o repositório adequado (ex: `TraitRepository.getItemByTypeAndId(type, sourceId)`) para buscar a versão original do item e seu custo intocado.

2. **Propriedades Genéricas do Sistema:** Para acessar pontos em ficha como Aliados, Informantes, Arsenal, Recursos, etc, use sempre o wrapper genérico `getObject()` alinhado aos Enums de caminho de sistema da arquitetura (`CharacteristicType.REPERTORY.ALLIES`), prestando atenção à conversão explícita de tipos com `Number()` para evitar concatenação de Strings acidental em equações dinâmicas.

## Contexto Técnico
- **sourceId:** Identificador único persistido ao arrastar itens de Compendiums para um Ator. Usado na arquitetura nativa Híbrida do Setor 0 (ver _pattern-hybrid-item-architecture.md_).
- Repositórios como `TraitRepository` mantêm cópias estáticas e validadas dos itens do Compendium e itens *hardcoded* locais para consultas rápidas (`getItemByTypeAndId`).
- A conversão segura com `Number()` previne erros silenciosos no `Math.max()` ao computar propriedades customizadas da IU geradas via Handlebars (onde value inputs disparam strings de volta ao BD).
