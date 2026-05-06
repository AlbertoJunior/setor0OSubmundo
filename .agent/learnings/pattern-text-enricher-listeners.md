# Padrão de Listeners para Text Enrichers

## Problema
No Foundry VTT, quando criamos um *Text Enricher* customizado (ex: `@Traco[id]`) utilizando `FoundryApi.registerCustomEnricher` (ou diretamente `CONFIG.TextEditor.enrichers`), podemos retornar um `HTMLElement` gerado via Javascript (ex: `document.createElement("a")`).

Entretanto, se adicionarmos um ouvinte de evento diretamente a esse elemento (usando `a.addEventListener("click", ...)`), ele **nunca será disparado**. O motivo é que o Foundry VTT sanitiza e converte o DOM resultante do `TextEditor.enrichHTML` em uma `String` (usando `outerHTML` ou propriedades equivalentes) na hora de inserir o conteúdo final na interface (seja no chat, no diário ou em fichas). Isso resulta na destruição imediata de quaisquer event listeners anexados diretamente àquele Node.

## Causa
O fluxo do TextEditor no Foundry é focado em retornar HTML sanitizado que pode ser renderizado em diferentes escopos e instâncias de Documentos e Aplicações.

## Solução Adotada (Event Delegation Global)

Para capturar interações (como cliques) com esses elementos enriquecidos, é necessário aplicar o padrão de **Event Delegation** em um contêiner pai abrangente. O próprio Foundry VTT adota o `document.body` para gerenciar os eventos nativos de clique em seus próprios `TextEnrichers` (método `TextEditor._onClickContentLink`).

Assim, a abordagem segura e universal é:

1. **Evitar uso de `dataset.uuid` em referências não-Documentos:** Se o texto enriquecido não refere a um `Document` nativo do Foundry, usar a propriedade `data-uuid` pode fazer com que o próprio `TextEditor._onClickContentLink` falhe ou lance alertas por tentar buscar uma entidade nativa e não encontrar.
2. **Usar `datasets` customizados:** Crie propriedades como `dataset.customLink` ou `dataset.id` para referenciar o conteúdo no DOM.
3. **Global Listener no Body:** Escute o clique do evento de forma global e filtre se o alvo (`event.target`) possui nosso seletor customizado, impedindo a propagação de erro para os listeners nativos do Foundry (se necessário) utilizando `event.preventDefault()` e `event.stopPropagation()`.

### Exemplo

```javascript
// Registrando o Listener Global (uma única vez no Lifecycle, ex: init)
document.body.addEventListener("click", onClickCustomLink);

function onClickCustomLink(event) {
  // Tenta localizar um "a" mais próximo contendo nosso dataset customizado
  const a = event.target.closest("a.content-link[data-custom-link]");
  if (!a) return;

  const customLinkType = a.dataset.customLink;

  if (customLinkType === "Trait") {
    event.preventDefault();
    event.stopPropagation(); // Evita execução do nativo `_onClickContentLink` do Foundry
    
    const traitId = a.dataset.id;
    const traitType = a.dataset.type;
    
    // Faça sua lógica aqui
  }
}

// Durante a construção do HTML no callback do Custom Enricher
const a = document.createElement("a");
a.classList.add("content-link");
a.dataset.customLink = "Trait";
a.dataset.id = "1";
a.innerHTML = `<i class="fas fa-bookmark"></i> Nome`;
return a;
```
