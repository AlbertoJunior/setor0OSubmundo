# Padrão: Normalização de HTML na Fronteira (Boundary)

## Problema
Ao manter um sistema compatível com Foundry VTT V1 (v12) e V2 (v13+), o objeto `html` passado para os métodos de renderização varia:
- **V1**: Objeto jQuery (`[HTMLElement]`).
- **V2**: Objeto nativo (`HTMLElement`).

Isso força todo método utilitário a fazer verificações repetitivas (`html instanceof HTMLElement ? html : html[0]`), sujando o código e aumentando a complexidade cognitiva.

## Solução
 **Normalizar na Fronteira (API Overrides)**.

Em vez de tratar a diferença em cada função utilitária, normalizamos o objeto no ponto de entrada mais alto possível — nas classes override que definem a compatibilidade de versão (`v1.mjs` e `v2.mjs`).

### Implementação

#### 1. No Override da V1 (`v1.mjs`)
Interceptamos métodos chave como `activateListeners` e `render` para desembrulhar o jQuery antes de passar para o código do sistema.

```javascript
// Exemplo em v1.mjs
activateListeners(html) {
  // Converte jQuery para HTMLElement imediatamente
  const element = html instanceof HTMLElement ? html : html[0]; 
  
  super.activateListeners(html); // Passa original se o super precisar
  
  // Passa o normalizado para os métodos do sistema
  this.configureSheet(element); 
}
```

#### 2. No Override da V2 (`v2.mjs`)
Garantimos que estamos usando o `element` nativo e nunca criando um wrapper jQuery.

```javascript
// Exemplo em v2.mjs
_postRender(context, options) {
  super._postRender(context, options);
  const html = this.element; // Já é HTMLElement
  this.configureSheet(html);
}
```

#### 3. Nos Utilitários do Sistema
Agora podemos assumir que `html` é **sempre** um `HTMLElement`.

```javascript
// Exemplo limpo
static configureSheet(html) {
  // Sem necessidade de verificações
  html.querySelector('.minha-classe').addEventListener(...);
}
```

## Benefícios
1.  **Código Limpo**: Remove "ruído" de verificação de tipo em dezenas de arquivos.
2.  **Performance**: Evita criação/destruição de wrappers jQuery desnecessários.
3.  **Preparação para o Futuro**: Quando o suporte à V1 for removido, o código do sistema já está 100% alinhado com o padrão nativo da V2/V13.
