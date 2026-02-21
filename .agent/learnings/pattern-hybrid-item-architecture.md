# Padrão Arquitetural para Criação e Gerenciamento de Itens

**Ambiente:** Projeto Foundry VTT v13
**Tópico:** Arquitetura de Dados, Componentização e Camadas
**Status:** Sugestão de padrão de projeto (Pode ser sujeito a refinamentos)

## Problema e Contexto

No ecossistema do Foundry VTT v12/v13, tratar dos dados de atores e itens muitas vezes gera um forte acoplamento (Spaghetti Code) quando as responsabilidades não são claramente separadas. Manipulações diretas de strings nos templates, consultas ao objeto desorganizadas (`item.system.algumCaminho`) e espalhamento da lógica do banco de dados ao longo das classes de User Interface (Sheet) tendem a poluir a legibilidade, reduzir a testabilidade e gerar pesadelos durante upgrades da build.

Durante o desenvolvimento do artefato `Trait` (Traço), foram identificadas as melhores práticas baseadas nos exemplos de Actor/Equipment e, com isso, definimos uma Arquitetura Padrão com funções bastante específicas para Item Management.

## Solução e Padrão de Arquitetura

Sempre que a lógica de "Itens" complexos (como Traços, Equipamentos, etc.) for implementada neste projeto, o padrão de separação sugerido se constitui dos seguintes pilares:

### 1. Camada Base (Definitions)
*   **Enums (`enums/nome-enums.mjs`):** Arquivos que servem de "Single Source of Truth" das localizações dos dados. Nele são definidos os apontamentos (Ex: `TraitCharacteristicType.XP.system`) substituindo a inserção de *Magic Strings* (`"system.xp"`) espalhadas no projeto.
*   **Data Models (`data/nome-data-model.mjs`):** Camada estrita à formatação de tabelas, tipagem estática através de schema e valores default (`SchemaField`, `StringField`, `ArrayField`).
    *   *Nota Crítica:* **Nenhum** metadado de UI (`width`, `height`, classes CSS do defaultOptions) deve habitar o DataModel. A responsabilidade visual percente unicamente ao arquivo da Sheet.

### 2. Camada de Processamento (Utils e Valores)
*   **Utils do Domínio (`core/nome/nome-utils.mjs`):** Classe estática designada para tratar extrações, formatações ou consultas complexas relacionadas a esta entidade. Esta classe usa invariavelmente os `Enums` juntamente a um método global seguro de property access (`getObject(item, Enum.PROPRIEDADE)`). O uso de chamadas hardcoded diretas (`item.system.foo`) não é sustentável a longo prazo.
*   **Handlebars Helpers (`helpers/nomeValues.mjs`):** Funciona unicamente como proxy de leitura para a interface. Atua como um Dicionário de funções limitando-se a redirecionar a leitura dos dados para a classe `Util` ou executar leituras primárias.

### 3. Camada Visual e Eventos (Sheet e Dialogs)
*   **Formulários de UI (`base/sheet/nome/nome-sheet.mjs`):** Determinam como a Window App V1/V2 se comporá. Delega seus EventListeners através da arquitetura de HashMaps (`get mapEvents`). Utilizam partials unificados da Handlebars em oposição a blocos monolíticos (`{{> itemCommon this}}`).
*   **Handlers do Domínio (`methods/nome-effects-methods.mjs`):** Funções e classes invocadas pela Sheet respondendo aos botões. Podem levantar modais genéricos (`CreateFormDialog`) e atuar na interceptação interações do usuário. Elas **nunca** executam requisições de Update diretamente no banco, servindo puramente de ponte.

### 4. Camada de Banco e Persistência (Updaters e Repository)
*   **Updaters Especializados (`base/updater/nome-updater.mjs`):** Exclusivamente responsáveis por orquestrar fluxos assíncronos e submeter as Promises do Foundry API (`item.update()`). Eles absorvem dores relacionadas a *Arrays Imutáveis*, higienização de inputs e objetos corrompidos (Ex: Range Error ao submeter classes SchemaField na store). O uso de getters via `getObject` do `Utils` e chaves do `Enum` (para update dinâmico: `{[Enum.PROPRIEDADE.system]: value}`) garante consistência e tipagem.
*   **Repository (`repository/nome-repository.mjs`):** Lida com consultas aos Compendium Packs. Responsáveis por mapear, cachear localmente instâncias para aliviar loops e garantir listagens organizadas. Lógicas de dropdown (`selectOptions`) baseadas nos arquivos de localização `.json` são recomendadas a serem geradas e "cacheadas" neles em vez da UI ser obrigada a reconstruí-las a cada novo reload. 

## Causa da Estratégia
Esta sugestão promove Clean Code e Separation of Concerns. Os testes ficam isolados, é possível migrar do Application V1 para o V2 sem ter a core entity machucada, o banco não recebe dados envenenados devido aos isolamentos do Updater, e o motor visual não consome recursos computacionais extras montando os mesmos Enums centenas de vezes. 
Formas melhores de lidar com este fluxo podem ser sugeridas à medida do aprendizado com a framework nas novas versões.
