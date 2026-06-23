# Imutabilidade em Repositórios Estáticos

## Problema
Objetos retornados diretamente de arrays estáticos em repositórios são **referências**. Se um consumidor modifica uma propriedade (ex: `obj.particularity = 'valor'`), essa mudança afeta **todos os futuros acessos** ao mesmo objeto, causando compartilhamento de estado entre entidades distintas (ex: personagens diferentes mostrando o mesmo valor).

## Causa
Métodos como `find()` e `filter()` retornam a referência original do objeto, não uma cópia. O spread de array (`[...array]`) cria um novo array, mas os objetos dentro continuam sendo as mesmas referências.

## Solução — Padrão Defensivo do Projeto

### Camada 1: Repositório (deep clone no retorno individual)
Todos os métodos que retornam **um único item** do repositório devem usar `FoundryApi.deepClone()`:

```javascript
static getItemById(id) {
    const item = this.getItems().find(item => item.id == id);
    return item ? FoundryApi.deepClone(item) : null;
}
```

**Referência de repositórios que já seguem esse padrão:**
- `AbilityRepository.getItem()` 
- `SubstanceEffectRepository.getItem()`
- `NpcQualityRepository.getItem()`
- `EnhancementRepository.getEnhancementFamilyByEffectId()`

### Camada 2: Consumidor (spread antes de mutar)
Se o consumidor recebe um objeto e precisa alterá-lo, deve criar uma cópia antes:

```javascript
const foundTrait = this.#findTrait(traits, traitId);
const objectTrait = { ...foundTrait }; // ← cópia antes de mutar
objectTrait['particularity'] = novoValor;
```

### Métodos de lista (getItems, getItemsByType)
Não precisam de `deepClone` por padrão porque:
1. São usados para renderização (leitura).
2. O custo de `deepClone` em arrays grandes seria excessivo.
3. A proteção nos métodos individuais é suficiente na maioria dos casos.

## Contexto Técnico
- `FoundryApi.deepClone()` é um wrapper de `foundry.utils.deepClone()` — clona recursivamente objetos e arrays.
- Spread `{...obj}` é shallow copy — suficiente para objetos planos, mas insuficiente para objetos com sub-objetos (como `particularity: { type, change }` em SuperEquipmentTraits).
