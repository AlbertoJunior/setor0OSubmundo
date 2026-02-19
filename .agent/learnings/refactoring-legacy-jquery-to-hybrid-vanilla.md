# Refactoring Legacy jQuery to Hybrid Vanilla JS

## Problema
Ao migrar sistemas legados do Foundry VTT (V10/V11) para V13 (ApplicationV2), encontramos o desafio de manter compatibilidade com códigos antigos (V1) que dependem extensivamente de jQuery, enquanto a nova API exige elementos DOM nativos (`HTMLElement`).

## Causa
- **V1 (Legacy)**: Injeta `html` como um objeto jQuery (`$(element)`).
- **V2 (Modern)**: Injeta `html` como um `HTMLElement` nativo.
- Métodos compartilhados (Utils/Mixins) quebram se não tratarem ambos os tipos.

## Solução: Abordagem Híbrida
Implementar normalização de input no início de métodos utilitários compartilhados:

```javascript
/* Exemplo de Normalização */
static setupContent(html) {
  // Se html for HTMLElement, usa ele mesmo. Se for jQuery, pega o primeiro elemento [0].
  const element = html instanceof HTMLElement ? html : html[0];
  
  // Agora use APIs nativas
  const content = element.querySelector('.my-class');
  // ...
}
```

### Pontos de Atenção
1.  **Eventos**:
    - jQuery: `html.find(selector).click(handler)`
    - Vanilla: `element.querySelectorAll(selector).forEach(el => el.addEventListener('click', handler))`
2.  **Criação de Elementos**:
    - jQuery: `$('<div>').addClass('foo')`
    - Vanilla: `const div = document.createElement('div'); div.classList.add('foo');`
3.  **SortableJS**:
    - Bibliotecas de drag-and-drop nativas funcionam melhor com `HTMLElement`. Evite passar objetos jQuery para construtores que esperam DOM nodes.

## Contexto Técnico
Esta abordagem foi aplicada com sucesso na migração dos utilitários `HtmlJsUtils` e `DialogUtils` do sistema Setor 0, permitindo que a mesma base de código atenda tanto `ActorSheetV1` quanto `ActorSheetV2`.
