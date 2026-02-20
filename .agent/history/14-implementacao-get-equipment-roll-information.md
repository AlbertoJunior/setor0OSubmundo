# Implementação do getEquipmentRollInformation

## O que foi feito
Implementado o método `getEquipmentRollInformation` na classe `EquipmentUtils` para extrair as propriedades corretas de diversos tipos de equipamentos (Veículos, Substâncias, Equipamentos Regulares e Super Equipamentos) e formatá-las para exibir no chat do sistema na hora da rolagem, de forma semelhante ao `getWeaponRollInformation`.

## Arquivos alterados
- `module/core/equipment/equipment-utils.mjs`: Adicionada importação do `EquipmentType`, e implementada a lógica do método privado `#getEquipmentRollInformation`.
- `.agent/history/_index.md`: Atualizado índice de histórico.

## Decisões técnicas relevantes
- Para Veículos, adicionamos as labels 'Tipo_Veiculo', 'Aceleracao' e 'Velocidade'.
- Para Substâncias, exibimos o 'Tipo' e os 'Efeitos' através do seu map de descrição em formato de string separada por vírgula.
- Para todos os equipamentos, se houver 'Resistência', ela é exibida no chat.
- Para Super Equipamentos, incluímos o 'Nível', 'Efeitos' e 'Defeitos'.
- Utilizada a biblioteca interna `localize` com suas respectivas chaves em `pt-br.json`.

## Testes sugeridos
- Testar a exibição no chat ao rolar um Veículo, verificando se a Aceleração, Velocidade, Tipo e Resistência constam na mensagem.
- Testar a exibição de uma Substância interagindo no inventário.
- Testar a exibição de um Super Equipamento.
