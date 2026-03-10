---
name: lazy-load-localization-helpers
description: Importância da execução tardia de métodos de Localização e Repositórios no Foundry VTT para prevenir Race-Conditions de dicionários clientes.
tags: [Foundry VTT v13, UI, Helpers, Handlebars, i18n, Localização]
---

# Avaliações Tardias (Lazy-Loading) em Localização

## O Problema das Fichas e Arquitetura de Módulo
Um dos bugs mais difíceis de diagnosticar em ambientes Foundry é quando uma funcionalidade **só quebra no computador de um jogador conectado** enquanto o **Host (Mestre) visualiza perfeitamente**. No caso de localização (`game.i18n.localize`), jogadores frequentemente encontravam strings vazando chaves originais sem tradução nas Fichas e Menus de contexto (ex. `S0.Virtudes.Virtude`).

## A Causa Raízes (Race Conditions de Cliente vs Host)
O host local carrega seus arquivos assíncronos virtualmente de forma instantânea através do IO do sistema operacional ou barramento de memória, já o cliente o faz via *Fetch* (Trafego de Rede).
O Foundry dispara o seu hook `init`, permitindo que os scripts sejam lidos em memória (e suas variáveis globais e mapas estáticos sejam assinalados). Contudo, o módulo `Localization` continua fazendo downloads dos arquivos de base dos idiomas (`pt-br.json`).
- Se houver no código constante/métodos rodando de forma **imediata** (ex. `const MEU_MAPA = { lista: Repository.getItems() }`), o Repositório irá disparar o `localize()` antes do dicionário terminar de chegar. Para o Host a performance mascarava a deficiência; para o cliente revelava a string nua. 

## A Solução (Arrow Functions e Execução Sob Demanda)
Toda a arquitetura de Helpers (ex: `fetchRepository`) e mapas globais que invocam repositórios ou dados localizáveis não pode rodar em fase de `init`. Como não é possível esperar `ready` na atribuição estática de objetos ESM, utiliza-se a avaliação tardia via Closures:
```javascript
// FORMA PERIGOSA
const repositoryMap = {
  'morphology': MorphologyRepository.getItems()
};

// PADRÃO EXIGIDO
const repositoryMap = {
  'morphology': () => MorphologyRepository.getItems()
};

export default function fetchRepository(key) {
  const resolver = repositoryMap[key];
  if (resolver) {
    // Avalia DENTRO DO HELPER, no ato da abertura do template e renderização nativa 
    // momento onde o ciclo vital assegura que Dictionary já se encontra carregado
    return typeof resolver === 'function' ? resolver() : resolver;
  }
}
```

## Como o Padrão Afeta o Projeto 
- Qualquer lista global a ser exportada para UI Handlebars ou Constants File que usa os Utilitários baseados em localização, devem vir em Arrow Functions. 
- Ferramentas como Arrays de ContextMenuItems e Scene Control Tool Buttons estão a salvos, pois são renderizados no Handler dos hooks apropriados (`getSceneControlButtons`, e não no `init`).
- A resolução de dicionário assíncrona só estará segura definitivamente a partir da flag disparada no hook `ready`. Assegure-se de que nada força o `localize()` a imprimir dados na fase `setup` a não ser `CONFIG` keys.
