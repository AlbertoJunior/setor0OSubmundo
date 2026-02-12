# 03 - Implementação de Equipment Chat Methods

**Data:** 2026-02-11
**Tipo:** Implementação de funcionalidade

## Contexto
Os métodos `EquipmentHandleEvents.handleChat()` e `EquipmentSheetItemRollHandle.chat()` estavam com `TODO('implementar')`.

## O que foi feito

### Arquivos criados
1. **`module/creators/message/equipment-message.mjs`** — Creator de mensagem de equipamento
2. **`module/creators/message/roll-test-message.mjs`** — Creator de mensagem de teste de rolagem
3. **`templates/messages/equipment.hbs`** — Template da mensagem de equipamento no chat
4. **`templates/messages/roll-test.hbs`** — Template da mensagem de teste no chat

### Arquivos modificados
5. **`module/base/sheet/actor/player/methods/equipment-methods.mjs`**
   - Implementação do `handleChat()` com `#extractEquipmentData(item)`
   - Remoção do import `TODO`
   - Adição de imports: `EquipmentInfoParser`, `EquipmentMessageCreator`, `ChatCreator`
6. **`module/base/sheet/equipment/methods/equipment-item-roll-methods.mjs`**
   - Implementação do `chat()` — envia info do roll test ao chat usando `item.actor`
   - Remoção do import `TODO`
   - Adição de imports: `RollTestMessageCreator`, `ChatCreator`

## Padrão seguido
Segue o padrão de `TraitMessageCreator`/`EffectMessageCreator`:
- Creator renderiza template HBS com dados
- `ChatCreator.sendToChat(actor, content)` envia ao chat

## Dados exibidos no chat

### Equipamento
- Nome, imagem, tipo
- Se arma: dano, dano automático, tipo de dano, mãos, ocultabilidade
- Se melee: tamanho
- Se projétil: cadência, capacidade, alcance, especial
- Se veículo: tipo, aceleração, velocidade
- Se substância: tipo, quantidade
- Resistência (se existir)
- Se super equipamento: nível, lista de efeitos e defeitos (com custo e particularidade)
- Descrição

### Teste de Rolagem
- Nome do teste, nome do item pai
- Atributo primário, secundário, habilidade
- Bônus, automáticos, dificuldade, especialista (Sim/Não), crítico

## Correções

### Clean Code
- Criado `EquipamentDataParser` em `module/core/equipment/equipament-data-parser.mjs`
- Métodos separados: `#parseWeapon`, `#parseMelee`, `#parseProjectile`, `#parseVehicle`, `#parseSubstance`, `#parseResistance`, `#parseSuperEquipment`
- `equipment-methods.mjs` agora usa `EquipamentDataParser.parse(item)` ao invés de `#extractEquipmentData`

### Template `equipment.hbs`
- Imagem centralizada com `display: flex; align-items: center`
- Botão "Ficha" que abre a ficha do item via `fromUuidSync(item.uuid).sheet.render(true)`

### Template `roll-test.hbs`
- Atributo primário, secundário e habilidade exibidos no início
- Especialista exibido como "Sim" ou "Não" (usando `gameLocalize('Yes')` / `gameLocalize('No')`)

### Localização
- Adicionada chave `Ficha` em `pt-br.json` e `en.json`

### Organização dos Templates
Templates movidos de `messages/` para subpastas:
- `effect.hbs` → `messages/effects/effect.hbs`
- `trait.hbs` → `messages/traits/trait.hbs`
- `equipment.hbs` → `messages/equipments/equipment.hbs`
- `roll-test.hbs` → `messages/equipments/roll-test.hbs`

Referências atualizadas nos message creators:
- `effect-message.mjs`
- `trait-message.mjs`
- `equipment-message.mjs`
- `roll-test-message.mjs`

### Botão "Ficha" - Correção
O botão inline com `onclick` não funcionava. Substituído pelo padrão de `data-action` do sistema:
- Template: `<button class="S0-roll-result" data-action="view" data-type="open-sheet" data-uuid="...">`
- Handler adicionado em `Setor0ChatLog.#viewMap` (`open-sheet`) — resolve item via `fromUuidSync(uuid)` e abre a ficha
- Permissão verificada automaticamente pelo `#prepareEventMessage` (GM ou Owner)

## README
Nenhum item novo do README foi finalizado com essas mudanças. As funcionalidades implementadas são melhorias internas que complementam itens já marcados como ✅ (Equipamentos: Ficha, Rolagem pelo Equipamento).
