# 17 - Extração de Overrides V1/V2 e Refatoração para Custom SHEET_CONFIG

## O que foi feito
As lógicas específicas para suporte as versões de aplicação V1 (`get defaultOptions`, `get template()`) e V2 (`_operateMultiParts`, `_initializeApplicationOptions`) que estavam previamente acopladas e duplicadas em diversas classes de Planilhas (`EquipmentSheet`, `TraitSheet`, `Setor0ActorSheet`, `Setor0NpcSheet`), foram abstraídas e injetadas de forma dinâmica através da função `makeSheetClass` nos arquivos da API de versões.

Durante os testes da migração V13 inicial, foi detectado que o mixin `HandlebarsApplicationMixin` do V2 sobrescrevia construtos como `DEFAULT_OPTIONS` dificultando o acesso às propriedades filhas a tempo de configurar janelas dinâmicas. Para resolver de vez os conflitos de herança, abstraímos as configurações para um objeto estático de domínio próprio nas planilhas: `SHEET_CONFIG`.

## Arquivos Alterados
- `module/base/sheet/actor/player/actor-sheet.mjs`: Centralização de propriedades no custom `SHEET_CONFIG` e remoção de boilerplate V1/V2.
- `module/base/sheet/actor/npc/npc-sheet.mjs`: Centralização de propriedades no custom `SHEET_CONFIG`.
- `module/base/sheet/equipment/equipment-sheet.mjs`: Centralização de propriedades e remoção dos métodos estáticos redundantes (`defaultOptions`, `PARTS`).
- `module/base/sheet/trait/trait-sheet.mjs`: Remoção total do boilerplate V1 e V2 de manipulação de options e parts.
- `module/base/sheet/actor/BaseActorSheet.mjs`: Troca de `DEFAULT_OPTIONS` por `SHEET_CONFIG`.
- `module/api/versions-overrides/v1.mjs`: Atualizado `defaultOptions` e `get template()` para derivarem sua lógica de roteamento visual e dimensões (`width`, `height`, `resizable`) exclusivamente do `BaseClass.SHEET_CONFIG`.
- `module/api/versions-overrides/v2.mjs`: Modificado para ler dinamicamente partes (`PARTS`) através do `SHEET_CONFIG`. E, crucially, aplicação do *override* no método `_initializeApplicationOptions(options)`  para injeção segura (via push e concatenação) de dimensões, options resizable e classes CSS *antes* que a classe base V2 trave (freeze) as opções para renderização final na API do Foundry.

## Decisões Técnicas Relevantes
- **Abandono Estratégico do Padrão Nativo em favor do Adapter (`SHEET_CONFIG`):** Ao invés da planilha "tentar adivinhar" ou misturar *getters* de opções em formato V1 ou V2, ela agora apenas relata suas necessidades no `SHEET_CONFIG`. A fábrica `makeSheetClass` (V1 ou V2 config) gera o adaptador equivalente na hora sem poluir o código das janelas.
- **Injeção via `_initializeApplicationOptions` (Application V2):** Devido à armadilha da cadeia de protótipos onde o `static get DEFAULT_OPTIONS` resolve o contexto `this` para o mixin em si e não para a folha herdeira, foi necessário injetar dinamicamente atributos como `width`, `height` e `classes` customizadas do `SHEET_CONFIG` sobrescrevendo `_initializeApplicationOptions(options)`. Essa borda limpa preserva a imutabilidade estática do Foundry ao mesmo tempo que respeita as escolhas da UI da subclasse.

## Testes Sugeridos
1. Abrir qualquer planilha (NPC, Actor, Equipamento, Trait) e criar diálogos sob a **API V1** para atestar o fallback seguro de UI, roteamento antigo em `.hbs` e controle natural de larguras.
2. Abrir qualquer document sheet sob **API V2** e validar se o sistema insere formatações customizadas (`options.classes.push`), tranca a flag `resizable` corretamente, e redimensiona a janela com a largura e as abas visíveis adequadas via DOM renderizado nativamente no Foundry V13.
