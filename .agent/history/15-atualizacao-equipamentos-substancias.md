# Atualização do getEquipmentRollInformation e Uso de Substâncias

## O que foi feito
A pedido do usuário, foram feitas algumas alterações na lógica de equipamentos:
1. **Super Equipamentos**: Ao exibir os efeitos e defeitos de um super equipamento via `getEquipmentRollInformation` no chat, se houver uma particularidade registrada, seu nome também será listado entre parênteses ao lado do nome do efeito/defeito.
2. **Uso de Substâncias**: Ao clicar no botão de "Usar" em uma substância no inventário do Personagem, após aplicar o consumo e os efeitos ativos, o sistema agora envia uma mensagem padronizada no chat com as Informações da Substância (utilizando `handleChat`).
3. **Refatoração Clean Code**: O método `getEquipmentRollInformation` foi refatorado, extraindo as lógicas específicas de cada tipo de equipamento para métodos privados auxiliares (`#parseResistanceRollInfo`, `#parseVehicleRollInfo`, `#parseSubstanceRollInfo`, `#parseSuperEquipmentRollInfo`), semelhante à abordagem utilizada na classe `EquipamentDataParser`. Isso melhora a legibilidade e manutenibilidade do código.

## Arquivos alterados
- `module/core/equipment/equipment-utils.mjs`: Método `getEquipmentRollInformation` atualizado para extrair a `particularity.description` nos arrays de efeitos e defeitos do Super Equipamento. Além disso, o método sofreu a refatoração mencionada, dividindo-o em métodos auxiliares menores.
- `module/base/sheet/actor/player/methods/equipment-methods.mjs`: Ajustado o método `#useSubstance` para disparar um evento simulado (fake event) pro `handleChat` enviar os dados da substância pro chat logo após seu consumo.
- `.agent/history/_index.md`: Atualizado índice de histórico.

## Decisões técnicas relevantes
- Para evitar duplicação de funcionalidade do envio de um item de equipamento para o chat, na `equipment-methods.mjs` invocamos internamente o `this.handleChat(actor, fakeEvent)` recém-acionado durante o `#useSubstance`, imitando o `event.currentTarget.dataset.itemId` com o `equipment.id`.
- Reutilizado operador de elvis `?.` na hora de buscar a string `particularity?.description` em `equipment-utils.mjs`.
- Os novos métodos da refatoração recebem a variável auxiliar `changes` (array) por referência e realizam o `push` das strings formatadas e localizadas (usando `localize`) caso as condições aplicáveis àquele escopo sejam verdadeiras.

## Testes sugeridos
- Testar a rolagem de um Super Equipamento que tem um ou mais Efeitos com e sem Particularidade preenchida. Todos devem ser renderizados no template do chat.
- Testar o clique no botão de ação da mochila "Usar" em um item de Substância; Além da rotina existente (deduzir 1 na quantidade), o item também tem que aparecer publicamente no Chat.
