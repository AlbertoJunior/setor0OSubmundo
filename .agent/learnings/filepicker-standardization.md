# Padronização e Centralização do FilePicker

### Problema
O comportamento de seleção de arquivos (imagens) era inconsistente entre versões do Foundry e os tipos de planilhas.
- Na **V12 (Application V1)**, `ActorSheet` interceptava automaticamente `data-edit="img"`, mas as planilhas derivadas de `ItemSheet` exigiam tratamento manual.
- Na **V13 (Application V2)**, o sistema desconsiderava o `data-edit`, passando a usar eventos mapeados via `data-action="img"` ou `actions` definidos no objeto retornado em `DEFAULT_OPTIONS`.
Isso causava duplicação de handlers de evento: um `selectImg` em `v2.mjs`, scripts mistos nas planilhas e inconsistências no click (HTML com múltiplos atributos).

### Causa
A discrepância nas APIs de Rendering e Interação entre as classes abstratas V1 e V2 da Document Foundation API.

### Solução
Foi estabelecido um padrão único: **todo clique em imagem que tem intenção de alteração deve acionar um `data-action="edit"` e referenciar o dado por `data-characteristic="img"`**. 
Isso unifica a interface com o usuário em nível do template `.hbs` substituindo a dependência da magia nativa das APIs antigas por um fluxo claro.

No lado Javascript, o acrônimo de intercepção passa para o **`Setor0BaseSheet`**. Em vez de acoplar verificações manuais no `onEvent`, foi introduzido um getter `defaultMapEvents` na abstração base, que contém nativamente o mapeamento da ação genérica (`img: { [OnEventType.EDIT]: ... }`). Em seguida, o método `getMapEvents()` realiza um merge (`FoundryApi.mergeObject(this.defaultMapEvents, this.mapEvents)`) injetando silenciosamente esse handler em todas as classes filhas sem ofuscar seus eventos próprios. 

Para otimização de performance, esse merge é feito de forma **Lazy Cache** (apenas uma vez por instância de sheet), garantindo que cliques repetidos não recalculem o mapa de eventos desnecessariamente. Atualmente, o sistema assume que os eventos são **estáticos**; no futuro, se houver necessidade de comportamentos que mudam dinamicamente com o estado do documento sem recarregar a ficha, novas estratégias de invalidação de cache ou separação de mapas podem ser exploradas. Ao final, o seletor `FoundryApi.FilePicker` delega a atualização para `this.updateDocument(document, "img", path)`.

Nenhuma planilha filha (`ActorSheet`, `EquipmentSheet`, `TraitSheet`...) ou sobrescritas de V2 precisará reimplementar esse FilePicker.

### Contexto Técnico
- **BaseSheet Abstrata:** `Setor0BaseSheet` atua como Facade/Controller principal dos callbacks de renderização HTML.
- **Remoção de Legado:** A antiga implementação local `v2.mjs` que registrava no `actions: { img: this.#selectImg }` precisou ser removida.
- **Documentação de UI:** Onde antes usávamos `<img data-edit="img" data-action="img"...`, reduzimos para `<img data-action="edit" data-characteristic="img" ...` para limpeza e concisão.
