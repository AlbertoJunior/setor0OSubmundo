# Implementação da Ficha, Modelo de Dados e Efeitos para Traits (Traços)

**Data:** 20/02/2026

## Resumo
Criação da ficha gráfica, modelo de dados e suporte a "Efeitos Customizáveis" para os itens do tipo "Traço" (Trait). Todo o processo foi estruturado seguindo o padrão Vanilla JS, componentização via Handlebars e centralização de métodos em Utils/Updaters no core.

## Arquivos Alterados
- `module/data/trait-data-model.mjs`: Limpeza de opções de UI descontinuadas da camada de dados (`defaultOptions`), inserção da classe `TraitEffectField` e da array `effects` no model principal. Inclusão da propriedade `morph`.
- `module/enums/trait-enums.mjs`: Criação do Enum `TraitCharacteristicType` para gerenciar as constantes de Traço.
- `module/base/sheet/trait/trait-sheet.mjs`: Criação da classe sheet delegando mapEvents aos botões de interface (`add` e `remove` de effects e métodos default). Definição da listagem de morfologias (`morphologies`) e tipos no `getData`.
- `module/base/sheet/trait/methods/trait-effects-methods.mjs`: Criação das funções encarregadas de abrir o Dialog Modal.
- `templates/items/sheet/trait.hbs`: Criação do template da ficha. Remoção do partial `itemCommon` que englobava a imagem para construir o "header" manualmente. Adição da lista de `Efeitos` e do seletor visual de `Morfologia`.
- `templates/items/dialog/trait-effect.hbs`: Implementação visual do modal para criar efeitos.
- `module/utils/templates.mjs` & `module/hooks/ready.mjs`: Configuração e registro do Sheet no ecossistema Foundry.
- `module/repository/trait-repository.mjs`: Centralização da leitura de `effects` de Compendiums e cache das listagens de bônus via `getBonusOptionsMap`. Inclusão do suporte de parseamento para `morph`.
- `module/core/trait/trait-utils.mjs`: Centralização do processamento de valores do Traço (`getXp`, `getDescription`, `getMorph`, `getEffects` etc) em uma class Util dedicada, garantindo tipagem enxuta baseada no Enum `TraitCharacteristicType`.
- `module/helpers/traitValues.mjs`: Refatorado para exportar chamadas à recém-criada classe `TraitUtils`.
- `module/base/updater/trait-updater.mjs`: Adição de um Updater padronizado (`TraitUpdater`), lidando de forma segura com as mutações assíncronas no banco atreladas a store `system.effects`, sempre através de `getObject`.
- `lang/pt-BR.json` & `lang/en.json`: Organização e limpeza nos dados de tradução, criando grupos aninhados como `Atributos`, `Virtudes` e isolando strings de `Traços`.

## Decisões Técnicas Relevantes
- **Model-View Separation**: A responsabilidade de definir elementos da interface como tamanho e popups foi removida de `TraitDataModel` e passada para o `TraitSheet`.
- **Tratamento Seguro de Banco de Dados**: O erro `RangeError` disparado durante o salvamento de Efeitos ocorria por submetermos classes instanciadas à camada Database do Foundry. Resolvemos isso passando Objetos Planos do Javascript para a API local. O acesso aos dados usa sistematicamente `getObject` via constantes de Enum, em vez de propriedades hardcoded como `.system.xp`.
- **Isolamento via Utils e Updaters**: O registro e gerenciamento dos traços foram desacoplados da lógica de template `traitValues` ou handlers `trait-effects-methods` através das classes estáticas `TraitUtils` e `TraitUpdater`, mantendo o código limpo.
- **Gerenciamento de Cache Estático**: A lógica pesada do `mapBonusOptions` — que escaneia chaves de tradução recursivamente — foi convertida em uma propriedade cacheadável `TraitRepository.#traitEffectsOptionsMapCache`, poupando processamento de UI a cada clique do usuário.
- **Manutenção Vanilla JS e Clean Code**: Todo o código desenvolvido eliminou o uso de jQuery e se absteve de variáveis obscuras ou magic strings/numbers.

## Testes Sugeridos
1. Criar um "Trait" dentro do VTT e constatar a ausência de imagem e layout formatado corretamente.
2. Navegar e preencher pelos campos base (Custo, Morfologia, Tipo, Requisito); testar botão de exclusão e criação (sinal de "+") na aba Efeitos e criar uma regra para ele.
3. Modificar os dados, salvar, fechar e reabrir para verificar a persistência.
4. Carregar o Traço completo para um compendium; inspecionar o resultado do Load para confirmar que as coleções e campos persistem corretas.
