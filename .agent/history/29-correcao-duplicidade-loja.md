# Correção de Duplicidade de Itens na Loja

## O que foi feito
Foi corrigido um bug onde itens adicionados aos personagens (atores) estavam sendo erroneamente registrados no cache global de itens (`EquipmentRepository`), fazendo com que eles aparecessem duplicados na "loja" (menu de adição de itens) nas aberturas subsequentes.

## Arquivos alterados
- `module/hooks/create-item.mjs`

## Decisões técnicas relevantes
- No Foundry VTT, quando um item é criado diretamente no inventário de um ator, o hook genérico de criação (`createItem`) é disparado, passando o item (Embedded Document) recém-criado.
- Como o script original não verificava se o item era "embedded" (pertencente a um ator), qualquer item adicionado ao jogador era inserido na lista global de equipamentos do repositório em cache (`EquipmentRepository.#loadedFromGame`).
- Para corrigir, foi implementado um early return (`if (item.parent) return;`) no manipulador de evento, garantindo que o processo de adição ao Cache do Repositório seja abortado se o item pertencer a um parent (exemplo: Actor da cena ou do mundo). E assim, apenas *World Items* não linkados diretamente a um ator são inseridos lá.

## Testes sugeridos
- Acessar a ficha de um personagem de jogador.
- Abrir a loja/menu de itens e adicionar um equipamento.
- Verificar o inventário do ator para confirmar se o equipamento foi adicionado com sucesso.
- Abrir novamente a loja/menu de equipamentos e verificar se o item não aparece mais duplicado na lista global (a fonte original do item na loja dever ser única).
