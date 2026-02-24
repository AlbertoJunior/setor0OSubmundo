# Padrão de Efeitos Ativos (Standard Active Effects)

Para resolver a inconsistência entre as várias formas de aplicar Efeitos nos itens da ficha (como `TraitEffectField`, `SubstanceEffectField`, `EnhancementEffectDataChange` e `SuperEquipmentParticularityField`), unificamos a arquitetura do projeto para utilizar um modelo de campo base (Schema) comum: o **StandardEffectChangeField** e o **StandardEffectField**.

## Arquivo Base
Localização: `module/field/effect-fields.mjs`

### 1. StandardEffectChangeField
Este Schema descreve **uma única modificação/bônus/penalidade** que um efeito aplica a uma estatística.
Ele agrupa os seguintes atributos principais:
- `key`: O caminho da variável (ex: `system.bonus.attributes.strength`).
- `value`: O valor quantitativo aplicado.
- `mode`: O modo de comportamento do Foundry (`CONST.ACTIVE_EFFECT_MODES.ADD`, `UPGRADE`, etc).
- `typeOfValue`: Identifica se o valor é Fixo, ou se deve basear em Nível do Aprimoramento, Metade do Nível, etc. (vem do `EffectChangeValueType`).
- `otherValue`: (Opcional) Guardado para escalabilidades específicas.

### 2. StandardEffectField
Este Schema descreve **um efeito completo** associado a um item (ex: O Efeito de uma "Droga" (Substância), que pode ter descrição própria e um conjunto de modificadores numéricos).
Propriedades:
- `id`: O identificador único.
- `name`: Nome do Efeito.
- `description`: A descrição / lore do efeito.
- `type`: Define se é "buff" ou "debuff" (baseado em `ActiveEffectsTypes`).
- `changes`: Uma lista de `StandardEffectChangeField`.

## Onde usar cada um?

### 1. Usando o `StandardEffectChangeField` (Modificador Direto)
Deve ser utilizado quando o Item (ou o modelo de dados) não precisa categorizar ou nomear Efeitos individualmente, fornecendo apenas a alteração final de status do sistema. Ele representa a menor unidade do sistema: a "alteração matemática" (o *bônus de força*, o *redutor de dificuldade*).

**Exemplo Prático (Traços, Aprimoramentos ou Particularidades):**
Um Traço passivo não tem um nome customizado de efeito dentro de si, ele mesmo *é* a fonte. Portanto, você utiliza ele para apontar diretamente a lista de mudanças ocorrentes:
```javascript
// Modificadores armazenados diretamente dentro da entidade
static defineSchema() {
  return {
    description: new StringField(),
    // ArrayField carregando somente as chaves, valores e modos a aplicar
    changes: new ArrayField(new StandardEffectChangeField()) 
  };
}
```

### 2. Usando o `StandardEffectField` (Efeito Agrupado/Nomeável)
Deve ser utilizado quando você precisa criar listas de **"Efeitos" completos e independentes**, onde cada instância precisa receber opções adicionais humanas (Descrição textual, ID, Nome ou definir se é um Buff/Debuff baseados em Repositório Fixo). Por baixo dos panos, o `StandardEffectField` já declarará seu próprio array interno de `changes` para você.

**Exemplo Prático (Substâncias / Itens Consumíveis):**
Uma Droga "Anabolizante Turbo" pode ter dois efeitos instanciados em si: o *"Foco Extremo" (Buff)* e a *"Taquicardia" (Debuff)*.
Como precisamos agrupar textualmente esses Efeitos para apresentar ao chat e a UI, usamos este Data Model:
```javascript
// Efeitos instanciados que abrigam descrições antes de aplicar alterações matemáticas
static defineSchema() {
  return {
    type: new NumberField({ initial: EquipmentType.SUBSTANCE }),
    // Array de Efeitos Completos, cada um possuindo propriedade 'description' e atributo '.changes' embutido
    effects: new ArrayField(new StandardEffectField()) 
  };
}
```

## Benefícios do Padrão
1. Mantém todas as propriedades estruturadas igualmente para ser lidas facilmente pelo utilitário iterador de arrays `ActiveEffectsUtils.createEffectData()`.
2. Facilita muito a manipulação e inserção da propriedade `.changes` quando preparamos os Efeitos para associar ao Token (que espera a mesma estrutura em vez de `change` singular).
