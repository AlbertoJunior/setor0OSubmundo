# Implementação de Ícones Padrão via PreCreate Hook

## O que foi feito
- Remoção do código `CONFIG.Item.typeIcons` (esta propriedade não dita o padrão da imagem `item.img` base na criação dos itens de Foundry v13).
- Criação e registro do hook `preCreateItem` gerenciado pela classe `PreCreateItemHookHandle`.
- Centralização do mapeamento de ícones na nova constante dentro do hook.

## Arquivos alterados
- `module/data/equipment-data-model.mjs`: Limpeza da propriedade `CONFIG.Item.typeIcons`.
- `setor0OSubmundo.mjs`: Registro do import e chamada do `Hooks.on('preCreateItem')`.
- `module/hooks/pre-create-item.mjs`: (Novo) Arquivo responsável por carregar e processar a lógica do handler.

## Decisões técnicas relevantes
- **Uso do Hook `preCreateItem`**: Após testes e aprofundamento na documentação, notou-se que a via de configuração via objeto local afetava apenas os labels e UI adjacentes. Para interceptar a persistência do template `icons/svg/item-bag.svg` na criação real da instância no banco do Foundry, a intercepção estrita no `preCreate` tornou-se mandatória e segue o padrão para sistemas sem uma base `Item` super-sobrescrita em sua classe de documento principal.
- **Mecanismo de Fallback (validateDefaultIcons)**: Para evitar caminhos de ícones inválidos (quebras visuais na UI), adicionamos um pre-fetch iterativo no momento da inicialização do Canvas via `FoundryApi.Canvas.srcExists(path)`. Constatou-se que erros `404` exibidos no Console F12 oriundos dessa etapa são intencionais e impossíveis de suprimir do Inspetor de Web pois o `srcExists` faz um `fetch(method: HEAD)` com Timeout para constatar a existência da URL; caso falhe, garante que a configuração sofra graceful fallback silenciosamente para `items/svg/item-bag.svg`. As exibições resultantes das promessas desse processo são agrupadas e consumidas paralelamente via `Promise.allSettled`, unindo suas resoluções em formato `logTable`.

## Testes sugeridos
1. Crie um novo item do tipo "Substance" no Foundry VTT.
2. Observe que a imagem gerada no momento da criação não é mais a bolsa padrão, e sim a pílula (`pill.svg`).
3. Crie um equipamento tipo "Armor" e constate se o mesmo nasce como um escudo (`shield.svg`).
