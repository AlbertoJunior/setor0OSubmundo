# Remoção de Estilos Inline Restantes

## O que foi feito
- Revisão completa do diretório `templates` em busca de estilos embutidos (`style="..."`).
- Criação de novas classes de utilidade global no `styles/utilities.css`, abrangendo flexibilidade adicional de *Width*, *Height*, limites mínimos/máximos e preceitos para truncar texto.
- Padronização de todas as templates para uso com novas classes de utilidade (`S0-`) onde existiam declarações redundantes de estilo inline, mantendo a compatibilidade e modularidade visual da aplicação.

## Arquivos alterados
- `styles/utilities.css`
- `templates/npc/npc-sheet.hbs`
- `templates/npc/bag.hbs`
- `templates/messages/equipments/equipment.hbs`
- `templates/items/others/rollable-tests.hbs`
- `templates/items/others/superequipment.hbs`
- `templates/items/dialog/trait-effect.hbs`
- `templates/enhancement/enhancement-dialog.hbs`
- `templates/actors/actor-sheet.hbs`
- `templates/actors/shortcuts.hbs`

## Decisões técnicas relevantes
- Identificou-se que a refatoração original (Histórico 23) ainda deixava uma série de propriedades atômicas espalhadas inline em sub-painéis ou trechos menos frequentados.
- Estilos dinâmicos, tal qual referências diretas de contexto ou *Handlebars* interpolados (ex.: filtro de coloração dos dados `style="filter: sepia(1) hue-rotate({{../colorValue}}deg);"` em `life.hbs`), foram preservados propositalmente usando marcações inline para atender às regras do framework apontadas no `css-utility-classes.md`.
- **Refinamento Final**: Houve uma varredura para identificar classes atômicas mapeadas em arquivos `.hbs` originadas da refatoração e que, por lapso, não haviam sido declaradas em `utilities.css`. Devido à isso, utilitárias faltantes (`S0-nav-content` para abas, `S0-resize-block`, `S0-overflow-y-scroll` e `S0-font-monospace`) foram propriamente incluídas no CSS global para sanar falhas visuais em painéis de *Actor*, *NPC* e Diálogos de *Items*.

## Testes sugeridos
- Verificar se nomes muito longos em "Testes Possíveis" ou em defeitos nos *"Super Equipamentos"* continuam apresentando o comportamento *Ellipsis* ("...") no lugar da quebra violenta de texto.
- Confirmar aberturas do compêndio, inventário estendido de NPCs e cabeçalhos em visualizações de Atores gerais para se certificar de que as larguras limites não afetaram o *layout* híbrido (v12/v13).
