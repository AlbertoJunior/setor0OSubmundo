# Padronização de Estilos Inline (Utility Classes)

## O que foi feito
- Análise de todos os arquivos de template (`.hbs` e `.html`) em busca de atributos `style="..."` contendo estilos atômicos e simples.
- Criação de um novo arquivo CSS dedicado para utilitários (`styles/utilities.css`), seguindo nomenclaturas padronizadas e prefixadas (`S0-flex`, `S0-mt-10`, `S0-text-center`, etc.).
- Registro do arquivo `utilities.css` na raiz do array de "styles" no `system.json`.
- Criação e execução de scripts de substituição em massa (Node.js) para converter automaticamente as ocorrências de propriedades inline em classes equivalentes.
- Aproximadamente mais de 300 substituições foram feitas consolidando layouts (flex, block), espaçamentos (margin, padding) e alinhamentos de texto. 

## Arquivos Alterados
- `system.json` (Inclusão de `styles/utilities.css`)
- `styles/utilities.css` (Criado)
- Inúmeros arquivos `.hbs` dentro de `templates/` (Fichas de Atores, NPCs, Chat, Diálogos de Testes, Efeitos, etc).

## Decisões Técnicas Relevantes
- **Abordagem Atômica:** Optou-se por adotar uma arquitetura de CSS Utility/Atomic similar ao Tailwind CSS, mas respeitando o escopo do projeto (prefixo `S0-`). Isso reduz o tamanho do HTML, facilita a manutenção de temas (dark mode, etc) e elimina redundâncias nos arquivos.
- **Integração com Cascade Layers:** Como documentado oficialmente a partir do V13, o arquivo `utilities.css` foi registrado no `system.json` usando a sintaxe de objeto com `"layer": null`. Isso remove as utilitárias da ordenação de camadas do sistema (unlayered group), conferindo a elas prioridade absoluta no *cascade CSS* global.
- **Classes Específicas / Customizadas:** Onde atributos como `filter` ou propriedades repetidas com dados estáticos visuais apareciam como um padrão para algo muito focado (ex. `style="filter: sepia(1) hue-rotate(330deg)"` nos dados de "Sobrecarga" e `text-shadow: 0 0 6px var(--primary-color-alpha)` genéricos), eles foram transformados em classes nominais como `.S0-overload-dice-filter` e `.S0-shadow-primary`.
- **Limites da Refatoração:** Estilos puramente estáticos definindo `width` (ex: `300px`), `height`, matrizes complexas de grid layout ou contendo dados dinâmicos do handlebars diretamente no valor CSS foram deixados inline, para não engessar e poluir a folha de utilitários com regras de escopo ultrarrito.

## Testes Sugeridos
1. Navegue pelo Foundry VTT e abra variadas janelas e painéis (Ficha de Personagem, Ficha de Itens, Diálogos de Rolagem, Diálogos de Traço e Chat).
2. Verifique visualmente se a estrutura de colunas, botões, margens e flexbox permaneceram idênticas ao design original.
3. Se algo parecer "quebrado", examine a respectiva tag pelo DevTools e veja se a classe `S0-*` está sendo adequadamente lida pelo `utilities.css`.
