# Regra Estrita: Sem Hardcode de Atributos do Sistema

**Contexto:** Padrões de Código e Manutenibilidade
**Objetivo:** Evitar o uso de *Magic Strings* e referências diretas encravadas (`hardcoded`) aos caminhos do sistema.

## A Regra de Ouro

**NUNCA** utilize valores em texto fixos (hardcoded) para referenciar propriedades e caminhos do objeto `system` em qualquer lugar do projeto (ex: `key.startsWith('system.bonus.habilidades.')` ou `item.system.morfologia`).

Isso foge totalmente ao padrão arquitetural adotado. Se no futuro um caminho de dado precisar ser reestruturado (ex: de `system.bonus.habilidades` para `system.bonus.skills`), o uso de valores fixos forçaria uma varredura complexa para encontrar e alterar todas as referências perdidas no projeto.

## O Que Deve Ser Feito

Nos casos de referência aos atributos do `system`, **deve ser utilizada uma classe estática (Enum/Constantes) específica** associada àquela entidade (o objeto que está sendo manipulado ou consultado).

Exemplos de classes centralizadoras na pasta `enums`:
- Atores: `BaseActorCharacteristicType` ou `CharacteristicType`
- NPCs: `NpcCharacteristicType`
- Traços: `TraitCharacteristicType`
- Efeitos: `ActiveEffectsFlags`, `ActiveEffectsTypes`, etc.

### Exemplo Incorreto (Proibido) ❌
```javascript
// Hardcoded! Terrível para refatoração e vulnerável a erros de digitação.
if (key.startsWith('system.bonus.habilidades.')) {
  // ...
}

const vida = actor.system.vitalidade.total;
```

### Exemplo Correto (Obrigatório) ✅
```javascript
// Utilizando os Enums mapeados (Single Source of Truth)
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { getObject } from "../../utils/utils.mjs";

if (key.startsWith(CharacteristicType.BONUS.SKILL.system)) {
  // ...
}

// Usando o Utils com Enum correspondente
const vida = getObject(actor, BaseActorCharacteristicType.VITALITY.TOTAL);
```

## Benefícios
1. **Refatoração Segura**: Ao mudar o caminho no Enum, todo o resto do projeto que o consome recebe a atualização automaticamente, sem depender de "Find & Replace" perigosos.
2. **Auto-complete Compartilhado**: O uso pontual garante que a IDE sugira os caminhos validos.
3. **Consistência**: Mantém a tipagem organizada, diminuindo quebras no momento do `item.update()` e ao enviar mudanças para o servidor do Foundry.
