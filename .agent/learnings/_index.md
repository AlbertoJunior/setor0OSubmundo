# Índice de Aprendizados

| Arquivo | Descrição | Contexto |
| :--- | :--- | :--- |
| [foundry-v14-active-effect-changes-migration.md](./foundry-v14-active-effect-changes-migration.md) | Adaptação para o Breaking Change da propriedade `.changes` de Efeitos Ativos (migrando para `system.changes`) usando detecção em tempo de execução (`game?.release?.generation`). | Hooks / Document Data / Foundry VTT v14 |
| [xp-calculator-enhancement-logic.md](./xp-calculator-enhancement-logic.md) | Correção de lógica na dedução de Pontos Iniciais de Aprimoramentos baseando-se por instâncias e peso de níveis, abandonando deduções numéricas errôneas. | Core / Regras e Calculadora XP |
| [foundry-v13-html-sanitization-placeholders.md](./foundry-v13-html-sanitization-placeholders.md) | Sensibilidade do Foundry V13 (DialogV2) a estruturas de formulários aninhados, causando remoção automática de atributos `placeholder` via sanitização. | UI / Foundry VTT v13 / Sanitização |
| [foundry-async-hooks-synchronization.md](./foundry-async-hooks-synchronization.md) | Padrão de trava de segurança (Promise synchronization) entre hooks síncronos e assíncronos no ciclo de vida do Foundry VTT. | Hooks / Lifecycle / Async-Await |
| [foundry-v13-applicationv2-prototype-pollution.md](./foundry-v13-applicationv2-prototype-pollution.md) | Correção de poluição de classes global por uso de getter `DEFAULT_OPTIONS` no Foundry v13 (`mergeObject(super.DEFAULT_OPTIONS)` muta o prototype nativo). | UI / Hooks / ApplicationV2 |
| [lazy-load-localization-helpers.md](./lazy-load-localization-helpers.md) | Adoção do padrão Lazy-Loading (Funções de Fechamento/Closures) em Dicionários estáticos exportados para a UI e Helpers a fim de combater Race-Conditions no recebimento assíncrono de Localizações (`game.i18n`) por clientes conectados. | UI / Performance de Renderização / Hooks |
| [foundry-v13-scene-control-dummy-tool.md](./foundry-v13-scene-control-dummy-tool.md) | Limitação do v13 em gerenciar painéis apenas de botões sem propriedades `activeTool` gerando TypeError e exigindo uso de DummyTools no Hook getSceneControlButtons. | Hooks / Foundry VTT v13 |
| [document-hooks-lifecycle.md](./document-hooks-lifecycle.md) | Diferenças anatômicas dos parâmetros entre os Document Hooks (_onCreate, _onUpdate, _onDelete) e prevenção de ReferenceErrors com falsos objetos `data` em Diffs. | Hooks / Foundry VTT |
| [item-repository-sourceid-fetching.md](./item-repository-sourceid-fetching.md) | Obtenção de Dados Originais de Itens (ex: Traços) via sourceId em Repositórios e chamadas seguras com `getObject()` instanciado para Casting e Enums de Ator. | Arquitetura de Itens / Data Model |
| [ephemeral-monkey-patching.md](./ephemeral-monkey-patching.md) | Padrão arquitetural (Salvar-Substituir-Restaurar) para sobrescrever métodos sensíveis globais da Canvas Interface sem causar Memory Leaks com a UI travada. | Arquitetura de UI / Performance |
| [no-hardcoded-system-attributes.md](./no-hardcoded-system-attributes.md) | Regra estrita contra o uso de caminhos fixos (hardcoded) como `system.atributos.forca`, obrigando o uso de Enums (ex: `CharacteristicType`). | Padronização Interna |
| [foundry-hooks-embedded-documents.md](./foundry-hooks-embedded-documents.md) | Ignorar processamento indevido de Embedded Documents com `if (document.parent)` em Hooks Genéricos. | Hooks / Foundry VTT |
| [foundry-v13-core-settings-override.md](./foundry-v13-core-settings-override.md) | Estratégia de Sync Passivo de configurações Locais (Core Settings) em multi-clientes via Hook updateSetting | Foundry VTT v13 |
| [foundry-v13-css-cascade-layers.md](./foundry-v13-css-cascade-layers.md) | Guia completo de utilização, injeções e overrides de CSS Cascade Layers (`@layer`) no Foundry VTT v13. | Foundry VTT v13 |
| [css-utility-classes.md](./css-utility-classes.md) | Padrão arquitetural de Classes CSS Utilitárias (prefixo `S0-`) para substituir estilos inline no HTML. | UI/CSS |
| [pattern-standard-active-effects.md](./pattern-standard-active-effects.md) | Padronização arquitetural da modelagem das propriedades de Efeitos Ativos (StandardEffectField) | Foundry VTT v13 |
| [pattern-data-migration.md](./pattern-data-migration.md) | Arquitetura Bi-direcional de Migração de Dados de versão usando hooks nativos (`migrateData`) e Async Sync | Foundry VTT v13 |
| [filepicker-standardization.md](./filepicker-standardization.md) | Padronização global de clique na imagem (FilePicker) centralizada em Setor0BaseSheet usando `data-action="edit" data-characteristic="img"`. | Foundry VTT v13 |
| [pattern-global-application-overrides.md](./pattern-global-application-overrides.md) | Padrão de Injeção Global em Application Overrides para UI | Foundry VTT v13 |
| [pattern-hybrid-item-architecture.md](./pattern-hybrid-item-architecture.md) | Padrão e separação de lógica na Arquitetura de Itens (Enums, Utils, Updaters, Repository) | Sugestão de Padrão Foundry VTT |
| [pattern-normalization-html.md](./pattern-normalization-html.md) | Padrão de Normalização de HTML na Fronteira para compatibilidade V1/V2 | Foundry VTT v13 |
| [refactoring-legacy-jquery-to-hybrid-vanilla.md](./refactoring-legacy-jquery-to-hybrid-vanilla.md) | Padrão Híbrido jQuery/DOM para Utilitários de Migração | Foundry VTT v13 |
| [foundry-v12-to-v13-migration.md](./foundry-v12-to-v13-migration.md) | Guia completo de migração V1 (v12) para V2 (v13) com soluções para bugs comuns | Foundry VTT v13 |
| [foundry-v13-hybrid-utils.md](./foundry-v13-hybrid-utils.md) | Padrão Híbrido jQuery/DOM para Utilitários de Migração | Foundry VTT v13 |
| [dynamic-imports-limitations.md](./dynamic-imports-limitations.md) | Limitações de importação dinâmica de arquivos sem build step | Foundry VTT v13 |
| [foundry-v13-tooltip-and-scrolling-text.md](./foundry-v13-tooltip-and-scrolling-text.md) | Personalização avançada e override do TooltipManager e ScrollingText via CONFIG e Hooks em ambiente encapsulado. | Foundry VTT v13 / UI |
