# Hooks e Embedded Documents (Foundry VTT)

## Problema
Ao utilizar hooks globais de criação/modificação/deleção de DataModels (como `createItem`, `updateItem`, ou `deleteItem`), podemos acabar processando incidentalmente os itens contidos (Embedded Documents) dentro de outros Documentos Maiores (Actors, Scenes, etc).
Isso frequentemente causa dados duplicados se o seu objetivo é observar apenas documentos independentes que pertençam ao Mundo (World Items / World Actors) ou gerencia o carregamento de configurações/repositórios.

## Regra de Filtragem (Embedded vs World Document)

Todo documento embutido dentro de um parente possui a propriedade `parent` preenchida. (Também detectável pelas propriedades `.isEmbedded`). 

Ao escutar por hooks como `Hooks.on("createItem")` para agir EXCLUSIVAMENTE sobre instâncias não embutidas, você **deve** realizar a checagem de exclusão logo de início.

### Padrão de Early Return:

```javascript
export class CreateItemHookHandle {
  static async handle(item) {
    if (this.#isItemInActor(item)) return; 

    // O restante do processo tratará apenas de World Items originais:
    // ...
  }

  /**
   * Verifica se o item pertence a um Ator (Embedded Document)
   * @param {Item} item
   * @returns {boolean}
   */
  static #isItemInActor(item) {
    return Boolean(item.parent);
  }
}
```

### Contexto
Implementado para prevenir que equipamentos novos criados pelo sistema ao serem adicionados nas mochilas dos heróis acabassem listados no repositório estático em cache que renderizava o catálogo "Loja".
