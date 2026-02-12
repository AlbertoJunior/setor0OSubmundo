# 1. Conhecendo o Projeto
**Data**: 2026-02-11

## Visão Geral

Sistema oficial para o **Foundry VTT** do RPG brasileiro **"Setor 0 - O Submundo"**.
Implementa toda a mecânica do jogo: fichas, rolagens, efeitos, equipamentos, aprimoramentos, traços, NPCs, compêndios e macros.

- **Versão**: `0.0.2` (Alpha)
- **Compatibilidade**: Foundry v12 (verificado) / v13 (parcial)
- **Idiomas**: Português (✅) / Inglês (🚧)
- **Autor**: Alberto Junior

---

## Arquitetura

```
setor0OSubmundo/
├── setor0OSubmundo.mjs        ← Entry point (hooks do Foundry)
├── system.json                ← Manifesto do sistema
├── module/                    ← Código principal (~172 arquivos)
│   ├── api/                   ← Abstração da API do Foundry (v1/v2)
│   ├── base/                  ← Sheets de Actor e Item + updaters
│   ├── constants.mjs          ← IDs, paths, cores
│   ├── core/                  ← Lógica central (actor, chat, combat, effect, enhancement, equipment, macro, npc, pack, rolls, token)
│   ├── creators/              ← Factories (Dialogs, Mensagens, Elementos)
│   ├── data/                  ← Data Models (TraitDataModel)
│   ├── enums/                 ← Enumerações
│   ├── field/                 ← Definições de campos
│   ├── helpers/               ← Handlebars helpers customizados
│   ├── hooks/                 ← Hook handlers (init, ready, createItem, etc.)
│   ├── repository/            ← Repositórios de dados
│   └── utils/                 ← Utilitários
├── templates/                 ← Templates Handlebars (~60 arquivos)
├── styles/                    ← CSS (tema escuro, estilos do sistema)
├── lang/                      ← Internacionalização (pt-br, en)
├── icons/                     ← Ícones
├── packs/                     ← Compêndios
└── scripts/                   ← Libs externas (Sortable, JSZip)
```

### Hooks Registrados (entry point)

| Hook | Handler | Função |
|------|---------|--------|
| `init` | `InitHookHandle` | Configura sheets, models, templates, chat |
| `ready` | `ReadyHookHandle` | Carrega repositórios, macros iniciais |
| `createItem` | `CreateItemHookHandle` | Ao criar um item |
| `createCombat` | `CreateCombatHookHandle` | Ao iniciar combate |
| `updateActor` | `UpdateActorHookHandle` | Ao atualizar um ator |
| `updateToken` | `UpdateTokenHookHandle` | Ao atualizar um token |
| `getSceneControlButtons` | `SceneControlButtonsHookHandle` | Botões de cena |

### Tipos de Documentos

- **Actors**: `Player`, `NPC`
- **Items**: `Acessory`, `Armor`, `Melee`, `Projectile`, `Substance`, `Vehicle`, `Trait`, `Enhancement`

---

## TODOs Encontrados (12 chamadas em 9 arquivos)

### 🔴 Métodos Completamente Vazios

| # | Arquivo | Método | Mensagem |
|---|---------|--------|----------|
| 1 | `effects-methods.mjs:61-63` | `EffectsHandleEvents.handleView()` | `'implementar'` — Visualizar detalhes de um efeito ativo |
| 2 | `equipment-methods.mjs:242-244` | `EquipmentHandleEvents.handleChat()` | `'implementar'` — Enviar info de equipamento para o chat |
| 3 | `equipment-item-roll-methods.mjs:181-183` | `EquipmentSheetItemRollHandle.chat()` | `'implementar'` — Enviar teste de rolagem para o chat |
| 4 | `Setor0ChatLog.mjs:34-36` | `#checkMap.consciousness` | `'implementar'` — Funcionalidade de "usar Consciência" no chat |

### 🟡 Funcionalidades Incompletas

| # | Arquivo | Local | Mensagem |
|---|---------|-------|----------|
| 5 | `roll-mesage.mjs:163-168` | `mountCoreInformationRoll()` | `'receber se o personagem tem consciência e quietude'` — flags hardcoded + **`debugger` na linha 168** |
| 6 | `virtue-roll.mjs:22-24` | `mountContent()` | `'receber se o personagem tem consciência'` — hardcoded + **`debugger` na linha 24** |
| 7 | `equipment-utils.mjs:253-254` | `#getEquipmentRollInformation()` | `'implementar as informações do item'` — retorna dados mínimos |
| 8 | `npc-dialog.mjs:30` | `open()` | `'npc dialog funcionar na versão v2'` |

### 🟢 Melhorias / Refatoração

| # | Arquivo | Local | Mensagem |
|---|---------|-------|----------|
| 9 | `trait-methods.mjs:47` | `ADD` handler | `'Verificar se vai adicionar algum bonus'` |
| 10 | `trait-methods.mjs:86` | `REMOVE` handler | `'Verificar se vai remover algum bonus'` |
| 11 | `characteristics-methods.mjs:14` | `characteristicOnClick()` | `'melhorar a forma como sei que é fama'` |
| 12 | `trait-data-model.mjs:19` | `defaultOptions` | `'isso está no lugar errado, deveria estar no TraitSheet'` |

---

## Outros Problemas

- **2 `debugger`** esquecidos em `roll-mesage.mjs:168` e `virtue-roll.mjs:24`
- **2 métodos depreciados** em `dom-listeners.mjs` com `DEPRECATED('metodo depreciado, parar de usar')`

---

## Features Planejadas (README)

| Feature | Status |
|---------|--------|
| Bônus de Nível 6 | 🚧 |
| Transacionar itens entre personagens | 🚧 |
| Importar personagem do site | 🚧 |
| Cálculo de XP e pontos utilizados | 🚧 |
| Efeitos ativos baseados em Traços | 🛠️ |
| Ocultar efeitos ativos de Tokens inimigos | 🚧 |
| Imagens do compêndio | 🚧 |
| Compêndio base do sistema | 🚧 |
| Inimigos no compêndio | 🚧 |
| Tradução de elementos do Foundry | 🛠️ |
| Tradução para inglês | 🚧 |
| Manifesto para instalação via URL | 🚧 |
