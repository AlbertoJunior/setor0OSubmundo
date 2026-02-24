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
- **Limites da Refatoração:** Estilos muito dinâmicos (como `filter: sepia(1) hue-rotate({{colorValue}})`, cálculos com `calc()`, etc) foram deixados inline de propósito, pois não competem a classes utilitárias estáticas.

## Testes Sugeridos
1. Navegue pelo Foundry VTT e abra variadas janelas e painéis (Ficha de Personagem, Ficha de Itens, Diálogos de Rolagem, Diálogos de Traço e Chat).
2. Verifique visualmente se a estrutura de colunas, botões, margens e flexbox permaneceram idênticas ao design original.
3. Se algo parecer "quebrado", examine a respectiva tag pelo DevTools e veja se a classe `S0-*` está sendo adequadamente lida pelo `utilities.css`.
