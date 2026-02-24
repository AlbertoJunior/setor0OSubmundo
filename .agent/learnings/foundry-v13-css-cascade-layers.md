# CSS Cascade Layers no Foundry VTT v13

## Fonte de Pesquisa
- **Documentação Base:** [Foundry VTT Community Wiki - CSS Cascade Layers](https://foundryvtt.wiki/en/development/guides/css-cascade-layers)
- **Versão Aplicável:** Foundry VTT v13+

## Problema e Contextualização
A partir do Foundry VTT v13, o sistema de estilos passou a usar ativamente o novo recurso CSS `@layer` (Cascade Layers). Caso não sejam manejados corretamente, os estilos do core do Foundry podem sobrescrever os estilos declarados nos módulos e sistemas, causando quebras visuais e dificultando a manutenção do desenvolvedor, que antes dependia apenas da ordem de carregamento ou uso abusivo de `!important`.

## Como Funciona

### Camadas Predefinidas (Predefined Layers)
O Foundry VTT define várias camadas com diferentes níveis de prioridade. A ordem de prioridade (da **menor para a maior**) é, em resumo:
1. `reset` (Estilos base do navegador)
2. `variables` (Variáveis CSS do core)
3. `elements` (Elementos base e tipografia como h1, inputs)
4. `blocks` (Componentes reutilizáveis do Foundry)
5. `applications` (Regras específicas de janelas)
6. `compatibility` (Camada de compatibilidade para Foundry v1)
7. `layouts` (Layouts de telas)
8. `system` (Estilos default do game system)
9. `modules` (Estilos default dos módulos)
10. `exceptions` (Exceções de estilo)
11. **Unlayered** (`layer: null` - Estilos fora de qualquer layer, possuem prioridade máxima)

### Integração Automática (O Padrão)
Se você apenas declarar uma string de string de arquivo no manifesto (`system.json` ou `module.json`), o arquivo será inserido automaticamente na camada correspondente (`system` para `system.json` e `module` para `module.json`).

```json
"styles": [
  "styles/styles-base.css" // Inserido no @layer system automaticamente
]
```
Isto já garante que o CSS inserido terá precedência/prioridade sobre as camadas inferiores do core (`reset`, `variables`, `elements`, `blocks`, `applications`, `layouts`).

### Injetando CSS em Outras Camadas
Se você precisa que alguma parte do seu estilo faça parte de uma camada subjacente, você pode declarar como objeto e atribuir a propriedade `layer`.
Isso é muito útil para sobrescrever `variables` globais ou configurar a tipografia na camada `elements`.

```json
"styles": [
  "styles/styles-base.css",
  {
    "src": "styles/variables.css",
    "layer": "variables" // Força o CSS a ser do @layer variables
  }
]
```

### Optando Fora das Layers (Prioridade Máxima)
Se um CSS requer precedência **ABSOLUTA** sobre todas as regras (mesmo as de outros módulos interpondo-se à UI ou exceções do sistema), é possível optar para não usar nenhuma layer. Isso coloca o arquivo num "unlayered group", que ganha do Cascade Layering do Foundry. ***Nota:** Excelente caso de uso para utilitários `utilities.css`, mas um uso anti-padrão para folhas normais.*

```json
"styles": [
  {
    "src": "styles/utilities.css",
    "layer": null
  }
]
```

### Reversão de Layers (revert-layer)
O sistema permite reverter explicitamente uma camada de CSS caso ela invada sua folha sem o uso de `!important`. 
Usando a propriedade CSS `all: revert-layer;`, é possível regredir os elementos selecionados para a formatação da camada hierárquica imediatamente anterior no Foundry.
```css
@layer elements.typography {
  /* Elimina as tipografias forçadas do core do Foundry nas minhas janelas */
  .application.my-system .window-content {
    &, & * { all: revert-layer; }
  }
}
```
***Atenção:** Reverter uma layer pai não reverte as layers filhas implicitamente. `elements` não reverte `elements.custom` por osmose.*
