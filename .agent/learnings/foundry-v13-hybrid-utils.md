# Padrão Híbrido jQuery/DOM para Utilitários de Migração

## Problema
Durante a migração de sistemas do Foundry VTT V12 para V13, aplicações legadas (V1) retornam objetos jQuery (`$()`) em seus métodos de ciclo de vida (`activateListeners`), enquanto `ApplicationV2` (V13) retorna elementos DOM nativos (`HTMLElement`). Utilitários compartilhados que manipulam esses elementos quebram se esperarem apenas um tipo.

## Solução
Implementar uma normalização de entrada no início dos métodos utilitários compartilhados para suportar ambos os formatos.

```javascript
static setupContent(html) {
  // Se for HTMLElement, usa direto. Se for jQuery, pega o primeiro elemento [0].
  const element = html instanceof HTMLElement ? html : html[0];
  
  // A partir daqui, usar apenas API nativa do DOM
  const content = element?.closest('.app-window');
  // ...
}
```

## Benefícios
1.  **Compatibilidade Retroativa:** Não quebra sheets legados que ainda não foram migrados.
2.  **Migração Gradual:** Permite migrar sheets para V2 um por um, sem precisar duplicar a biblioteca de utilitários.
3.  **Clean Code:** Encapsula a complexidade da verificação de tipo dentro do utilitário, mantendo o código do sheet limpo.

## Contexto Técnico
- Foundry VTT V12 (ApplicationV1): Dependência forte de jQuery.
- Foundry VTT V13 (ApplicationV2): Remoção de jQuery da API pública de Apps.
