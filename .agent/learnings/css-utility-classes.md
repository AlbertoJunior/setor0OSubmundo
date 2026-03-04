# Padrão de Classes Utilitárias CSS (Utility Classes)

## Problema
O uso excessivo de atributos `style="..."` diretamente nos arquivos de template (`.hbs` e `.html`) tornava o código HTML verboso, difícil de manter, impedia reuso eficiente e complicava atualizações futuras de design (como temas escuros ou responsividade).

## Causa
Histórico de desenvolvimento focado em prototipação rápida de layouts complexos sem um sistema CSS atômico centralizado. 

## Solução
Implementação do padrão de Classes Utilitárias (inspirado no Tailwind CSS). 
As classes utilitárias para o projeto possuem exclusivamente o prefixo **`S0-`** e lidam com propriedades atômicas visando compor o layout, por exemplo:

- **Display/Flex:** `S0-flex`, `S0-block`, `S0-items-center`, `S0-justify-between`
- **Espaçamento (Margin/Padding):** `S0-mt-10` (margin-top: 10px), `S0-px-8` (padding-inline: 8px)
- **Tipografia:** `S0-text-center`, `S0-font-bold`
- **Estruturação Funcional/Marcação:** `S0-nav-content` (utilizada estritamente para estruturação e exibição de abas/tabs nos templates como `actor-sheet.hbs`), além de delimitadores como `S0-overflow-y-scroll` e `S0-resize-block`.

O uso de `style=""` nos templates agora deve ser estritamente reservado para valores verdadeiramente dinâmicos ou altamente específicos ao contexto do componente abstrato (ex. `grid-template-columns: repeat(...)` ou `filter: sepia(1) hue-rotate({{colorValue}}deg)`).

## Contexto Técnico
- **Arquivo Central:** `styles/utilities.css`
- Foi adicionado globalmente através da injeção no array `"styles"` do arquivo raiz `system.json` sob a flag `"layer": null`. Essa configuração exime os utilitários do sistema de *Cascade Layers* do Foundry, garantindo a eles prioridade máxima de injeção imperativa via classes isoladas.
- Novas classes úteis padronizadas devem seguir este esquema e usar o prefixo `S0-`. Quando houver um padrão visual não coberto para algo específico do sistema repetido (por exemplo uma sombra ou *filter* constante com base na primária como `.S0-shadow-primary` ou `.S0-overload-dice-filter`), pode-se migrar esse *override* para esta folha também.
