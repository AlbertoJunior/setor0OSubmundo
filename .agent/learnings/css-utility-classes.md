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

O uso de `style=""` nos templates agora deve ser estritamente reservado para valores verdadeiramente dinâmicos ou altamente específicos ao contexto do componente abstrato (ex. `grid-template-columns: repeat(...)` ou `filter: sepia(1) hue-rotate({{colorValue}}deg)`).

## Contexto Técnico
- **Arquivo Central:** `styles/utilities.css`
- Foi adicionado globalmente através da injeção no array `"styles"` do arquivo raiz `system.json`.
- Novas classes úteis padronizadas adicionadas devem seguir este esquema no arquivo de utilitários e jamais usar outro prefixo que não seja `S0-`.
