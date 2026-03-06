# Índice de Histórico de Alterações

| Arquivo | Descrição | Data |
| :--- | :--- | :--- |
| [30-correcao-bug-tracos-seletor-habilidades.md](./30-correcao-bug-tracos-seletor-habilidades.md) | Correção de sobrescrita de Models e Adição de Seletor de Habilidades dinâmico em Traços. | 06/03/2026 |
| [29-correcao-duplicidade-loja.md](./29-correcao-duplicidade-loja.md) | Correção de bug de duplicidade em itens da loja que adicionava Embedded Documents ao repositório global. | 06/03/2026 |
| [28-configuracoes-iniciais-mundo-jogadores.md](./28-configuracoes-iniciais-mundo-jogadores.md) | Implementação das configurações iniciais para novos mundos: sincronização de idioma (GM -> Players), Tracker de combate padrão desativado e valores default para Scene/Token. | 05/03/2026 |
| [27-organizacao-macros-personagem.md](./27-organizacao-macros-personagem.md) | Criação de FolderUtils para unificar a arquitetura de pastas dinâmicas, blindagem Null-Safety no Sync e organização das Macros na pasta Jogadores > Personagem. | 04/03/2026 |
| [26-reorganizacao-de-pastas-setup-field.md](./26-reorganizacao-de-pastas-setup-field.md) | Reorganização de pastas: migração de fields para dentro de data e criação da pasta setup extraindo configurações de arquivos de utils. | 04/03/2026 |
| [25-nova-macro-rolagem.md](./25-nova-macro-rolagem.md) | Criação da macro padrão "Fazer Rolagem" que integra o ActorRollDialog utilizando as injeções globais e validações de canvas/permissão. | 04/03/2026 |
| [24-remocao-estilos-inline-restantes.md](./24-remocao-estilos-inline-restantes.md) | Padronização dos estilos inline remanescentes nas sub-fichas/variados para uso de classes Utilitárias (`S0-*`). | 01/03/2026 |
| [23-padronizacao-estilos-inline.md](./23-padronizacao-estilos-inline.md) | Padronização de estilos inline em templates substituindo-os por classes CSS Utilitárias (`S0-*`) centralizadas no `utilities.css`. | 24/02/2026 |
| [22-sistema-migracao-v13.md](./22-sistema-migracao-v13.md) | Sistema Oficial de Migration (DataModel e Background Sync) para atualizar documentos de versões antigas | 24/02/2026 |
| [21-implementacao-icones-padrao-itens.md](./21-implementacao-icones-padrao-itens.md) | Implementação de ícones padrão por tipo de item utilizando `CONFIG.Item.typeIcons`. | 23/02/2026 |
| [20-padronizacao-active-effects.md](./20-padronizacao-active-effects.md) | Padronização de Efeitos Ativos em DataModels (StandardEffectChangeField e StandardEffectField) | 21/02/2026 |
| [19-centralizacao-filepicker.md](./19-centralizacao-filepicker.md) | Centralização e correção da abertura universal do `FilePicker` para imagens de instâncias de Actors e Itens no `Setor0BaseSheet` com sistema de Lazy Cache. | 23/02/2026 |
| [18-refatoracao-estrutural-compendium-json.md](./18-refatoracao-estrutural-compendium-json.md) | Refatoração estrutural (remoção do _stats) de JSONs de Compêndios, aprimoramento de Importação de Pastas por Depth e Botões de Controle na UI para GMs | 21/02/2026 |
| [17-migracao-v13-overrides-e-config.md](./17-migracao-v13-overrides-e-config.md) | Extração de Overrides V1/V2 e implementando Adapter de SHEET_CONFIG customizado nas AppV1/V2 | 21/02/2026 |
| [16-implementacao-trait-sheet.md](./16-implementacao-trait-sheet.md) | Implementação da Ficha de interface gráfica, Modelo de Dados e Efeitos para os Traços (Traits) | 20/02/2026 |
| [15-atualizacao-equipamentos-substancias.md](./15-atualizacao-equipamentos-substancias.md) | Atualização de Particularidades no Super Equipamento e Chat ao usar Substâncias | 20/02/2026 |
| [14-implementacao-get-equipment-roll-information.md](./14-implementacao-get-equipment-roll-information.md) | Implementação da rolagem de informações específicas para equipamentos que não são armas | 20/02/2026 |
| [13-implementacao-usos-virtudes.md](./13-implementacao-usos-virtudes.md) | Implementação do Controle de Uso das Virtudes (Quietude e Consciência) no Chat | 20/02/2026 |
| [12-implementacao-rolagem-consciencia.md](./12-implementacao-rolagem-consciencia.md) | Implementação da Rolagem de Consciência separando dados e somando sucessos | 20/02/2026 |
| [11-remocao-efeitos-can-remove.md](./11-remocao-efeitos-can-remove.md) | Adicionado filtro CAN_REMOVE ao remover todos os efeitos do ator | 20/02/2026 |
| [10-atualizacao-readme.md](./10-atualizacao-readme.md) | Atualização do README com novas funcionalidades e suporte V2 | 19/02/2026 |
| [09-refatoracao-remove-jquery.md](./09-refatoracao-remove-jquery.md) | Remoção de dependências de jQuery em methods e ChatLog | 18/02/2026 |
| [08-refatoracao-dialogs-utilities.md](./08-refatoracao-dialogs-utilities.md) | Refatoração de Dialogs e Utilitários para Vanilla JS e Normalização HTML | 18/02/2026 |
| [07-migracao-v13-fase2-actor-sheet.md](./07-migracao-v13-fase2-actor-sheet.md) | Migração V13 Fase 2: Actor Sheet Sem jQuery e Refatoração Vanilla JS | 15/02/2026 |
| [06-migracao-v13-preparacao.md](./06-migracao-v13-preparacao.md) | Preparação para V13: Refatoração de v2.mjs e Utilitários Híbridos | 15/02/2026 |
| [05-migracao-actor-sheet-v2.md](./05-migracao-actor-sheet-v2.md) | Migração da ActorSheet para Application V2 e limpeza de legados V1 | 15/02/2026 |
| [04-refatoracao-estilos.md](./04-refatoracao-estilos.md) | Refatoração de estilos CSS e variáveis | 14/02/2026 |
| [03-implementacao-equipment-chat.md](./03-implementacao-equipment-chat.md) | Implementação de cards de equipamento no chat | 12/02/2026 |
| [02-implementacao-handleView-effects.md](./02-implementacao-handleView-effects.md) | Implementação da visualização de efeitos ativos | 11/02/2026 |
| [01-conhecendo-o-projeto.md](./01-conhecendo-o-projeto.md) | Análise inicial da arquitetura do projeto | 10/02/2026 |
