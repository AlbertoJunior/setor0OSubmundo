# Problema Crítico: Poluição do _prototype_ do ApplicationV2 em getters de `DEFAULT_OPTIONS`

## Problema
Ao declarar a propriedade estática `DEFAULT_OPTIONS` do `ApplicationV2` como um **getter** que interpola dinamicamente as opções da classe pai (ex: `super.DEFAULT_OPTIONS`) usando `FoundryApi.mergeObject()` (que internamente chama `foundry.utils.mergeObject`), ocorre uma alteração silenciosa e permanente (_in-place_) das opções base do Foundry VTT v13 em nível global.

No Foundry v12+, a função `mergeObject` modifica o primeiro argumento (target). Por conta da herança de classes do JavaScript iterando via getters, o objeto pai (`super.DEFAULT_OPTIONS` → `ApplicationV2.DEFAULT_OPTIONS`) passa a incorporar as classes (`classes`), abas (`tabs`), etc., da subclasse atual.

**Resultado Prático**: A primeira vez que sua classe for instanciada e lida (ex: `Calculadora.render()`), o Foundry gravará as configurações exclusivas dessa janela (ex: `.S0-V2`, `.S0-content`) de volta na classe genérica do sistema (`ApplicationV2`). A partir desse momento, todas as outras instâncias `.hbs` ou derivadas herdarão indevidamente as classes e tamanhos daquela primeira janela.

**Sintoma no Foundry**:
- Fichas de atores ganhando classes CSS de diálogos avulsos.
- `TokenConfig` ou menus do framework sendo renderizados deformados (ex: quebrando o position).

## A Causa
O código abaixo causa o vazamento global (Poluição de Prototype no static object):
```javascript
// ERRADO - Causa quebra generalizada de UI em outras janelas V2 (getter ou atribuição direta na raiz)
static get DEFAULT_OPTIONS() {
  return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["custom-class"],
    window: { title: "Custom Title" }
  });
}

// TAMBÉM ERRADO - Vai executar mergeObject no momento que o arquivo JS carregar e irá mutar a classe pai do mesmo jeito
static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
  classes: ["custom-class"]
});
```

## A Solução (V13 ApplicationV2 compliance)
A documentação do V13 e a fundação do `ApplicationV2` delegam o gerenciamento das opções diretamente para o *framework*. O `ApplicationV2` se encarrega internamente de ler e mesclar o `DEFAULT_OPTIONS` da subclasse atual com as opções da base, através de um utilitário profundo (*Deep Clone*) invocado dinamicamente - isolando perfeitamente a mutação da herança.

Ou seja, você deve fornecer um objeto em sua forma literal mais pura e crua:

```javascript
// CORRETO - Atribuição estática bruta. O framework V2 fará o Deep Clone de junção (merge) automaticamente
static DEFAULT_OPTIONS = {
  classes: ["custom-class"],
  window: { title: "S0.MINHA_TRADUCAO.CHAVE" }
};
```

### Lidando com strings Dinâmicas (`game.i18n` e Constantes randomizadas)
Como a propriedade estática é interpretada com o ambiente global no milissegundo em que o código-fonte `.js` carrega:
- Múltiplas execuções dinâmicas engessam: Usar `id: randomId(10)` dentro do `DEFAULT_OPTIONS` fará com que o gerador só avalie uma única vez. Todas as janelas dessa classe compartilharão o mesmo ID na sessão. Se precisar criar um ID aleatório por nova janela, injete essa restrição no momento da inicialização: `new MeuDialog({ id: \`${randomId(10)}-dialog\` }).render(true)`.
- Traduções: não recarregam com delays de carregamento do cliente. Use `title: "S0.MESA"` como string da chave,  para o `ApplicationV2` se encarregar de resolver internamente a tradução depois que o jogo já carregou.

### Uso de Getters Reativos e Fachadas Dinâmicas (`v2.mjs`)
Se a sua classe UI V2 estiver sendo forjada dinamicamente via fábrica de classes (como o módulo que intercepta a compatibilidade no _Facade V2_), não faz mal utilizar o accessor de métodos `static get DEFAULT_OPTIONS()`. Esse padrão só é nocivo quando usado em conjunto ao `.mergeObject()`.  

A sintaxe continua **totalmente segura** e altamente recomendada caso você retorne apenas a forma literal explícita da expansão dessa classe nova:

```javascript
// CORRETO E COMPATÍVEL (Fachadas dinâmicas ou mixins V13+)
static get DEFAULT_OPTIONS() {
  return {
    classes: ["S0-V2", SYSTEM_CLASS_CSS], // Opções da camada específica
    form: { submitOnChange: true }
  }; 
  // Omissão completa de super.DEFAULT_OPTIONS ocorre de maneira intencional e planejada
}
```

**Por que o `ApplicationV2` não perde as propriedades base da Foundry?**
Mesmo que o getter ignore o pai, o core component da `ApplicationV2` vasculha inversamente a cadeia de heranças do JavaScript (o _prototype-chain_) no instante instanciador do Singleton inicial. A classe formadora do Foundry se encarrega de ler e fundir todos os objetos por nível, através de recursão imutável de escopo (*Deep Clone*).  
Logo, **omitir `super.DEFAULT_OPTIONS` no retorno não gera perdas na interface real**, e isola integralmente nossa herança contra qualquer quebra arquitetural.
