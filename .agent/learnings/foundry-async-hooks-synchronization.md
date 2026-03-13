# Padrão: Sincronização de Hooks Assíncronos 🚀

## Contexto
O Foundry VTT possui **dois tipos de comportamento** para hooks em relação a callbacks `async`:

### Hooks de Ciclo de Vida (`init`, `setup`, `ready`)
- O Foundry **AGUARDA** Promises retornadas por callbacks `async`.
- O padrão `async/await` funciona corretamente e é o **recomendado**.
- A ordem `init → setup → ready` é respeitada mesmo com callbacks assíncronos.

### Hooks Genéricos e Customizados (`callAll`, `call`, `on`)
- O Foundry **NÃO AGUARDA** Promises.
- `Hooks.callAll()` é síncrono: chama todos os listeners e retorna imediatamente.
- Se o callback for `async`, a Promise será ignorada (fire-and-forget).

## Antipadrão: Capturar Promise Externamente ❌

```javascript
// ❌ ERRADO - Quebra o ciclo de vida do Foundry
let systemInitPromise;
Hooks.once('init', () => {
  systemInitPromise = InitHookHandle.handle(); // Foundry recebe undefined
});
```

Ao remover o `async` do callback e capturar a Promise manualmente, o Foundry recebe `undefined` como retorno e considera o `init` concluído, avançando para `ready` antes que a inicialização termine.

## Padrão Correto ✅

```javascript
// ✅ CORRETO - Foundry aguarda a Promise do async callback
Hooks.once('init', async () => {
  await InitHookHandle.handle();
});

Hooks.once('ready', async () => {
  await ReadyHookHandle.handle();
});
```

## Registro Determinístico em Hooks Customizados
Para hooks customizados (ex: `GM_INIT`, `GM_REGISTER_MIGRATIONS`):
- **Mantenha callbacks síncronos** quando o chamador (`callAll`) depende do resultado.
- Use `async` apenas se a operação for fire-and-forget.

---

## Async em Hooks Customizados: Soluções

Caso no futuro seja necessário que um hook customizado aguarde listeners `async`, existem duas abordagens:

### Abordagem 1: Registro de Promises (Simples)
Os listeners registram suas Promises em uma lista compartilhada, e o chamador as aguarda:

```javascript
// Módulo compartilhado
export const PENDING_ASYNC_TASKS = [];

// Listener
Hooks.once(SYSTEM_HOOKS.GM_READY, () => {
  const task = minhaOperacaoAsync();
  PENDING_ASYNC_TASKS.push(task);
});

// Chamador
Hooks.callAll(SYSTEM_HOOKS.GM_READY);
await Promise.all(PENDING_ASYNC_TASKS);
PENDING_ASYNC_TASKS.length = 0;
```

### Abordagem 2: Dispatcher Customizado (Escalável)
Uma função utilitária que substitui o `callAll` para hooks que precisam de suporte `async`:

```javascript
const asyncHookRegistry = new Map();

export function registerAsyncHook(hookName, fn) {
  if (!asyncHookRegistry.has(hookName)) {
    asyncHookRegistry.set(hookName, []);
  }
  asyncHookRegistry.get(hookName).push(fn);
}

export async function callAllAsync(hookName, ...args) {
  const listeners = asyncHookRegistry.get(hookName) || [];
  await Promise.all(listeners.map(fn => fn(...args)));
}

// Uso no listener:
registerAsyncHook(SYSTEM_HOOKS.GM_READY, async () => {
  await fazAlgoAssincrono();
});

// Uso no chamador:
await callAllAsync(SYSTEM_HOOKS.GM_READY);
```

### Quando usar cada abordagem

| Cenário | Abordagem |
|:---|:---|
| Poucos listeners, caso simples | **Abordagem 1** (registro de Promises) |
| Múltiplos hooks async, arquitetura escalável | **Abordagem 2** (dispatcher customizado) |
| Listeners **sempre síncronos** | Nenhuma — `Hooks.callAll()` basta |

## Origem
- Bug identificado em 13/03/2026: tentativa de capturar Promise externamente causava travamento no `init`.
- Solução: manter o `async/await` nativo nos hooks de ciclo de vida do Foundry.
