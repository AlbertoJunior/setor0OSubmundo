# Foundry VTT - Migração v12 para v13

## Contexto
Este documento registra as diferenças de API entre o Foundry VTT v12 e v13,
com foco nos padrões utilizados pelo sistema Setor 0 - O Submundo.

## Arquitetura v12 (Application V1 / `foundry.appv1`)

### Namespace
- Classes globais: `ActorSheet`, `ItemSheet`, `Dialog`, `Application`, `FormApplication`
- Acessadas via: `foundry.appv1.sheets`, `foundry.appv1.api`

### Ciclo de Vida (Sheets V1)
1. `static get defaultOptions()` — define opções padrão (classes CSS, width, height, template, tabs)
2. `getData()` — retorna dados para o template Handlebars
3. `activateListeners(html)` — chamado após render, recebe jQuery `html`
4. `_updateObject(event, formData)` — chamado no submit do formulário
5. `render(force, options)` — renderiza/re-renderiza a sheet

### Padrão de herança
```js
class MyActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mySystem"],
      template: "path/to/template.hbs",
      width: 600, height: 400,
      tabs: [{ navSelector: ".tabs", contentSelector: ".content" }]
    });
  }
  getData() { /* retorna context */ }
  activateListeners(html) { super.activateListeners(html); /* bind events */ }
}
```

### Dialog V1
- `new Dialog({ title, content, buttons, render, close }).render(true)`
- Callback `render(html)` recebe jQuery

---

## Arquitetura v13 (Application V2 / `foundry.applications`)

### Namespace
- `foundry.applications.api.ApplicationV2` — classe base
- `foundry.applications.api.DocumentSheetV2` — sheet de documentos
- `foundry.applications.api.DialogV2` — diálogos
- `foundry.applications.sheets.ActorSheetV2` — sheet de ator
- `foundry.applications.sheets.ItemSheetV2` — sheet de item
- `foundry.applications.handlebars` — `HandlebarsApplicationMixin`, `renderTemplate`, `loadTemplates`

### Ciclo de Vida (Sheets V2)
1. `static DEFAULT_OPTIONS` — objeto estático (não getter!) define opções
2. `static PARTS` — registro de partes do template (via `HandlebarsApplicationMixin`)
3. `_prepareContext(options)` — prepara dados para renderização
4. `_preparePartContext(partId, context, options)` — dados por parte
5. `_onRender(context, options)` — chamado após renderização, usa DOM nativo
6. `_postRender(context, options)` — pós-renderização
7. `_preSyncPartState / _syncPartState` — sincroniza estado entre re-renders
8. `_attachPartListeners(partId, htmlElement, options)` — eventos por parte

### Padrão de herança V2
```js
class MyActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["mySystem"],
    position: { width: 600, height: 400 },
    window: { resizable: false, controls: [] },
    form: { closeOnSubmit: false, submitOnChange: true },
    actions: { myAction: MyActorSheet.#onMyAction }
  };
  static PARTS = {
    main: { template: "path/to/template.hbs" }
  };
  async _prepareContext(options) { /* retorna context */ }
  async _onRender(context, options) { /* DOM nativo, não jQuery */ }
}
```

### Dialog V2
- `new DialogV2({ window: { title }, content, buttons, submit }).render(true)`
- Listeners via `addEventListener('render', ...)` e `addEventListener('close', ...)`

---

## Mudanças Críticas v12 → v13

### 1. `defaultOptions` → `DEFAULT_OPTIONS`
| v12 | v13 |
|-----|-----|
| `static get defaultOptions()` (getter) | `static DEFAULT_OPTIONS = {}` (propriedade estática) |
| `mergeObject(super.defaultOptions, {...})` | Merge automático pela framework |
| `template: "path"` | Removido, usa `PARTS` |
| `tabs: [...]` | Configurado nas PARTS ou via ux |

### 2. `getData()` → `_prepareContext(options)`
| v12 | v13 |
|-----|-----|
| `getData()` síncrono | `_prepareContext(options)` assíncrono |
| Retorna objeto direto | Retorna Promise |

### 3. `activateListeners(html)` → `_onRender(context, options)`
| v12 | v13 |
|-----|-----|
| Recebe jQuery `html` | Usa `this.element` (DOM nativo) |
| `html.find('.selector')` | `this.element.querySelector('.selector')` |
| Manual event binding | Actions declarativas no `DEFAULT_OPTIONS.actions` |

### 4. Template Rendering e Roteamento Estático no V2
| v12 | v13 |
|-----|-----|
| Template único em strings | Objeto `PARTS` com múltiplas seções renderizáveis |
| `this.template` | `static PARTS = { part: { template: "..." } }` |

> **Nota Crítica sobre O Pulo do Gato (SHEET_CONFIG)**: no ApplicationV2, acessar propriedades estáticas da classe herdada (ex: `this.SHEET_CONFIG`) de dentro de `static get DEFAULT_OPTIONS` invocado pela API interna V13 resultará em um `this` assinalado ao Mixin Base (ex: `Setor0BaseSheet`), e NÃO à subclasse final (ex: `EquipmentSheet`). Para injetar dinamicamente atributos como `width` e `height`, o Foundry Application V2 precisa que você intercepte via `_initializeApplicationOptions(options)`. (Ver secção de armadilhas no final deste documento).

### 5. Sheets
| v12 | v13 |
|-----|-----|
| `foundry.appv1.sheets.ActorSheet` | `foundry.applications.sheets.ActorSheetV2` |
| `foundry.appv1.sheets.ItemSheet` | `foundry.applications.sheets.ItemSheetV2` |
| Herança direta | Usar `HandlebarsApplicationMixin(ActorSheetV2)` |

### 6. Eventos e Actions
| v12 | v13 |
|-----|-----|
| `html.find('.btn').click(handler)` | `actions: { btnClick: Handler }` com `data-action="btnClick"` no HTML |
| jQuery-based | DOM nativo + declarativo |

### 7. Form Handling
| v12 | v13 |
|-----|-----|
| `_updateObject(event, formData)` | `form: { handler: onSubmit }` no `DEFAULT_OPTIONS` |
| `FormDataExtended` | `FormDataExtended` (mantido) |

### 8. Window Controls
| v12 | v13 |
|-----|-----|
| Não nativo | `window.controls: [{ action, icon, label }]` |

---

## Mapeamento de APIs na FoundryApi

A classe `FoundryApi` no sistema Setor 0 centraliza o acesso às APIs do Foundry,
abstraindo as diferenças entre versões.

### Estrutura atual
- `FoundryApi.Versions.current` → Application V2 (padrão)
- `FoundryApi.Versions.v1` → Application V1 (fallback)
- `FoundryApi.ActorSheet` / `FoundryApi.ItemSheet` → **Ainda usando V1** (precisa migrar)
- `createApplication("v1")` / `createApplication("v2", ["v1"])` → factory de versões

### Referência de APIs base (`baseApplicationConfig`)
```js
{
  Version: foundry.applications,
  Api: foundry.applications.api,
  Handlebars: foundry.applications.handlebars,
  SidebarTabs: foundry.applications.sidebar.tabs,
  Ui: foundry.applications.ui,
  Ux: foundry.applications.ux,
  Apps: foundry.applications.apps,
  Documents: foundry.documents,
  Collections: foundry.documents.collections,
  Placeables: foundry.canvas.placeables,
  Utils: foundry.utils,
  ChatMessage: ChatMessage,
  TooltipManager: foundry.helpers.interaction.TooltipManager,
}
```

### v1Overrides
```js
{
  VersionName: 'S0-V1',
  Sheets: foundry.appv1.sheets,
  makeSheetClass,    // usa defaultOptions getter, activateListeners
  createDialog, // usa Dialog (V1)
}
```

### v2Overrides
```js
{
  VersionName: 'S0-V2',
  Sheets: foundry.applications.sheets,
  makeSheetClass,    // usa DEFAULT_OPTIONS, HandlebarsApplicationMixin, _postRender
  createDialog, // usa DialogV2
}
```

---

## Referência de Documentação
- **v12 Docs**: `.agent/docs/v12/classes/` (982 arquivos HTML)
- **v13 Docs**: `.agent/docs/v13/classes/` (598 arquivos HTML)
  - `applications/api/` — ApplicationV2, DocumentSheetV2, HandlebarsApplicationMixin, DialogV2
  - `applications/sheets/` — ActorSheetV2, ItemSheetV2, etc.
  - `appv1/` — Application V1 (legado, mantido para compatibilidade)

---

## Bugs e Armadilhas Comuns na Migração V1 → V2

### 1. jQuery vs DOM Nativo
- **V1**: `this.element` é um **objeto jQuery**. Acessar o DOM nativo requer `this.element[0]`.
- **V2**: `this.element` é um **HTMLElement nativo**. Não tem `hasClass`, `find`, etc.
- **Armadilha**: `app.element.classList.contains()` funciona no V2 mas falha no V1. Para V1, use `app.element[0]?.classList?.contains()`.

### 2. Contexto do Template (`getData` vs `_prepareContext`)
- **V1**: `ItemSheet.getData()` e `ActorSheet.getData()` injetam automaticamente:
  - `owner: this.document.isOwner` ✅
  - `editable: this.isEditable` ✅
  - `item` / `actor`: referência ao documento ✅
- **V2**: `DocumentSheetV2._prepareContext()` fornece:
  - `editable: this.isEditable` ✅
  - `document`, `source`, `fields`, `user`, `rootId` ✅
  - **`owner`: NÃO INCLUÍDO** ❌
  - **`item` / `actor`: NÃO INCLUÍDO** ❌ (fornece `document` genérico)
- **Solução Setor0**: No `v2.mjs._renderHTML()`, o contexto é montado manualmente adicionando `owner: this.document.isOwner` e `[documentName]: context.document`.

### 3. `data-edit` vs `data-action` para Imagens
- **V1**: `<img data-edit="img">` aciona o FilePicker automaticamente via `activateListeners`.
- **V2**: `data-edit` NÃO aciona click handlers. O V2 usa `data-action="editImage"` (nativo) ou, no Setor0, `data-action="img"` (mapeado para `#selectImg` em `DEFAULT_OPTIONS.actions`).
- **Armadilha**: Templates que só têm `data-edit="img"` funcionam no V1 mas não no V2.
- **Solução**: Adicionar `data-action="img"` junto com `data-edit="img"` nos templates.

### 4. DOM Traversal (`html.parent()`)
- **V1**: `html` em `activateListeners` é o conteúdo interno (form dentro de `.window-content`). `html.parent()` é `.window-content`, `html.parent().parent()` é o app element.
- **V2**: `html` (ou `this.element`) É o elemento raiz do app (o `<form>` mais externo). `html.parent()` é o `body`.
- **Solução**: Usar `html.closest('.S0-content')` para encontrar o elemento raiz do app, independente da versão.

### 5. `foundry.applications.instances` vs `foundry.ui.windows`
- **V1**: Apps renderizados ficam em `foundry.ui.windows` (Object keyed by appId).
- **V2**: Apps renderizados ficam em `foundry.applications.instances` (Map, iterável com `.values()`).
- **`foundry.ui.activeWindow`**: É uma referência única ao app ativo, NÃO uma coleção.

### 6. `setTimeout` com Callbacks
- **Errado**: `setTimeout(onClose(), 100)` — executa `onClose()` imediatamente e passa o resultado.
- **Correto**: `setTimeout(() => onClose(), 100)` — executa após o delay.

### 7. `#disableFormItemsOnHtml` no V2
- `HandlebarsApplicationMixin._renderHTML()` retorna `Record<string, HTMLElement>`. Os values são HTMLElements diretamente.
- Para iterar e desabilitar inputs: `Object.values(result).forEach(part => part.querySelectorAll('input, select, textarea, button'))`.

### 8. CSS no V2 — Overflow e Hover Menus
- V2 pode aplicar `overflow: auto` no `.window-content` (section). Use `overflow: visible !important` se precisar que menus flutuantes com `position: absolute` escapem do container.
- CSS Layers no v13: system CSS tem prioridade sobre core CSS, mas `!important` pode ser necessário para overrides específicos.
- `.S0-menu-float` com `z-index: 100` garante visibilidade acima dos layers do framework.

### 9. `isDisabled` base
- O getter base em `Setor0BaseSheet` deve retornar `!this.isEditable` (disabled quando NÃO editável).
- Subclasses como `BaseActorSheet` e `EquipmentSheet` fazem override com lógica mais complexa.

### 10. `submitOnChange` e o `event.submitter`
- **Problema**: Ao usar `submitOnChange: true` no ApplicationV2, o evento disparado no formulário é um `submit`. Diferente da V1, acessar `event.target` pode retornar o formulário inteiro, dificultando saber qual campo mudou.
- **Solução**: Use `event.submitter || event.target`. No v13, o elemento que disparou a submissão (mesmo via mudança) é populado no `submitter`.
- **Dica**: No Setor0, isso foi aplicado no `v2.mjs` para corrigir o bug de campos `<select>` que resultavam em valores indefinidos.


### 11. DialogV2: Botões e Form Submission
- **Problema**: Botões dentro de um `DialogV2` estão dentro de um `<form>`. Se o botão não tiver `type="button"`, ele dispara o evento `submit`, o que pode causar erros ou fechar o diálogo inesperadamente se o handler de submit da classe não estiver preparado.
- **Solução**: Sempre use `event.preventDefault()` no handler de `click` de botões customizados dentro de diálogos para evitar a propagação para o submit do form.

### 12. Consultas DOM e `.closest()`
- **V1**: `html` geralmente referia-se ao conteúdo injetado. `html.closest('.window-content')` funcionava porque o jQuery subia a árvore.
- **V2**: `this.element` é a raiz do app. Se você tentar `this.element.closest('.window-content')`, pode retornar `null` se `this.element` já for o conteúdo ou se a estrutura for diferente (ApplicationV2 não usa `.window-content` da mesma forma que V1).
- **Prática Segura**: Ao invés de depender de subir a árvore para buscar elementos irmãos ou pais distantes, prefira consultas descendentes (`this.element.querySelector`) ou garanta que o elemento raiz é o esperado. Em diálogos V2, o `render(html)` recebe o elemento raiz do formulário. Use optional chaining `?` ao navegar para cima.

### 13. O Desafio Imutável do `DEFAULT_OPTIONS` e Classes Dinâmicas
- **Problema**: Aplicar atributos como largura (`width`), altura (`height`) ou classes dinâmicas extras (`classes`) lendo propriedades estáticas filhas (`this.SHEET_CONFIG.classes`) não funciona dentro do Mixin Factory de ApplicationV2. O getter estático `DEFAULT_OPTIONS()` é evaluado num contexto *Base* onde as customizações filhas estáticas não constam. Tentar remendar atribuindo `this.options.classes.push(...)` no construtor também falha pois a mesclagem para o frame da janela já "trancou" (freeze) esses valores internamente antes do setup.
- **Solução (Override Imbutido)**: Sobrescrever a função de ciclo de vida nativo interna `_initializeApplicationOptions(options)` interceptando e alterando o *options* de inicialização das opções imediatamente após o super criá-las mas **antes** do registro imutável do sistema.
```javascript
_initializeApplicationOptions(options) {
  options = super._initializeApplicationOptions(options);
  const config = this.constructor.SHEET_CONFIG || {};

  if (config.classes) { // Utilizar spread and push evitando .includes do readOnly V2 array.
    options.classes.push(...config.classes.filter(c => !options.classes.includes(c)));
  }
  if (config.width) options.position.width = Number(config.width);
  if (config.forcedHeight) options.position.height = Number(config.forcedHeight);
  
  return options;
}
```

### 14. Depreciação em Handlebars helpers (`selectOptions`)
- **Problema**: Na v12, o helper `{{selectOptions}}` utilizava a propriedade `nameAttr="id"` para destinar qual atributo seria o `value=""` das tags options.
- **Aviso de Depreciação**: No Foundry v13, o uso de `nameAttr` passou a disparar warnings no console indicando depreciação com previsão de quebra na v14.
- **Solução**: Troque o parâmetro `nameAttr="id"` por `valueAttr="id"`. Exemplo:
```handlebars
{{selectOptions myOptions valueAttr="id" labelAttr="name"}}
```
