# Foundry V13 - Override e Sync de Core Settings Globais vs Locais

Problema:
Sincronizar a configuração de Idioma de um GM (Game Master) para novos jogadores, mas permitindo que jogadores com configuração estabelecida não sejam sobrescritos, bem como forçar o Default de interface num mundo ao ser instanciado a primeira vez (ex: `core.combatTracker`).

Solução Funcional (V13):
O ideal estrutural é separar o ciclo via Hook `ready` atrelado a Settings do jogo (`game.settings` no escopo do World e no escopo Client).
1) **Definindo um Master Value (World):** Crie um Setting global Oculto:
`game.settings.register(SYSTEM_ID, "worldDefaultLanguage", { scope: "world", config: false, type: String, default: "pt-br" });`
2) O GM sempre dita a regra populando esse valor quando seu client carregar o mundo.
3) O Jogador puxa essa regra durante o Login APENAS se não houver a flag local dele (`user.getFlag`).
4) **Desativar Core Configurations default (ex: Turn Marker V13):** Para features muito novas do Core V13 que são englobadas em sub-objetos, é necessário atualizar diretamente a propriedade. Exemplo do Combat Turn Marker: deve-se pegar o Settings de `core.combatTrackerConfig` e utilizar `mergeObject` para introduzir: `{ turnMarker: { enabled: false } }`.
5) **Hooks Nativos de Tracking:** O Foundry dispara um gancho útil global chamado `updateSetting(setting, value)` onde se intercepta qualquer mudança manual na configuração e é possível "aprender" que o Player fixou sua configuração e levantar a flag de persistência.

Contexto Técnico:
Isso contorna o perigo de se injetar JS agressivo via Socket para forçar Client changes; a leitura é passiva em tempo de conexão e limpa pro servidor. Adicionalmente, sempre utilize um Arquivo de Enums (ex: `SystemFlags`) para persistir chaves de Strings duras (Hardcoded) nesse processo, protegendo o Sync.
