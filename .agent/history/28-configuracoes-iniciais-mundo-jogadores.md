# Configurações Iniciais de Mundo, GM e Jogadores

A partir dos requisitos definidos para o V13, este módulo introduz configurações padrão (`defaultConfigs`) para melhorar a experiência inicial do Game Master (GM) e dos Jogadores, bem como otimizar a criação de Cenas e Tokens.

## O que foi feito
- **Configuração de Idioma (Sincronização GM -> Players):**
  - Implementação do Setting `worldDefaultLanguage` para armazenar a preferência de idioma do GM.
  - Sincronização automática de Idioma do GM para jogadores novatos.
  - Flag de persistência na conta do jogador (`languageSetByUser`) para respeitar a mudança manual feita por eles.
- **CombatTracker Desativado:**
  - Configuração executada apenas uma vez por mundo sob o Hook `ready` (`combatTrackerInitialized`).
  - Desliga nativamente o **Combat Turn Marker** (nova feature do V13) inserindo falso na estrutura do core via: `core.combatTrackerConfig` -> `turnMarker: { enabled: false }`.
- **Modo Escuro (Dark Mode) por Padrão:**
  - Injeção da flag `SystemFlags.MODE.DARK` como `true` caso o usuário entre no mundo e a flag esteja como `undefined` (primeira vez).
- **Validações de Token e Scene (Hooks `preCreate`):**
  - Criados hooks customizados `preCreateScene` e `preCreateToken` para forçar valores padrão da mecânica Setor 0.
  - Cenas recebem sem Grid, padding 0.0, e a nova chave V13 `fog.exploration: false` (o antigo `fogExploration: false` foi depreciado no V12).
- **Clean Architecture:**
  - Lógica extraída para um controlador isolado `ConfigDefaults` (`module/setup/config-defaults.mjs`).
  - Ganchos encapsulados em módulos individuais (`pre-create-scene.mjs`, `pre-create-token.mjs`).

## Arquivos Alterados ou Criados
- `module/setup/settings.mjs` (Modificado)
- `module/hooks/ready.mjs` (Modificado)
- `setor0OSubmundo.mjs` (Modificado)
- `module/setup/config-defaults.mjs` (Novo)
- `module/hooks/pre-create-scene.mjs` (Novo)
- `module/hooks/pre-create-token.mjs` (Novo)

## Decisões Técnicas Relevantes
A arquitetura foi pensada para respeitar as diretrizes V13 do Foundry, sem sujar a configuração nativa do player, sendo apenas um "Sync" no primeiro acesso. Foi utilizado o gancho global `updateSetting` para ouvir quando os jogadores decidem de forma independente mudar o seu idioma, desvinculando-os da regra do GM.
**Refatoração de Flags (Clean Code):** Toda a operação transacional das configurações nativas que utilizam `getFlag` / `setFlag` / `game.settings.get` foram refatoradas para utilizar o Enum globalizado `SystemFlags` centralizando as literais (Ex: `SystemFlags.WORLD.DEFAULT_LANGUAGE`, `SystemFlags.LANGUAGE.SET_BY_USER`, `SystemFlags.COMBAT.TRACKER_INITIALIZED`).
**Migração V13 Fog:** Ajuste na criação da Scene pois `fogExploration` foi dado como *Deprecated* em favor do novo aninhamento de propriedade `fog.exploration`.

## Testes Sugeridos
1. Estando como GM, altere o Idioma nas configurações do Foundry, salve.
2. Logue como Jogador que ainda não definiu o idioma (ou através de aba anônima/novo user do Foundry). O sistema deverá piscar e forçar a língua selecionada pelo GM recarregando a página.
3. Se logar com jogador, e alterar manualmente o idioma, ele não deverá herdar mais as próximas mudanças feitas pelo GM.
4. Crie uma cena e um Token e observe se todos os atributos correspondem aos defaults de Vision/Grid definidos no escopo do projeto.
