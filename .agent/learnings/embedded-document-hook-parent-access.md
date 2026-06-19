# Acesso ao Parent em Hooks de Embedded Documents

## Problema
Ao tratar hooks globais como `createActiveEffect`, `deleteActiveEffect`, `createItem`, etc., pode haver confusão sobre onde acessar o parent document do Embedded Document.

## Causa
No Foundry VTT v12+, os hooks globais de criação/deleção de Embedded Documents têm a assinatura:
```javascript
Hooks.on("createActiveEffect", (effect, options, userId) => { ... });
```

O segundo argumento (`options`) é o **context object** de criação (ex: `{ renderSheet: true, temporary: false }`). Ele **NÃO contém** a propriedade `parent`.

## Solução
O parent document deve ser acessado diretamente no **primeiro argumento** (o documento criado):
```javascript
// ✅ CORRETO
const parent = effect.parent; // Actor, Item, ou ActorDelta

// ❌ ERRADO
const parent = options.parent; // undefined
```

### Branches comuns para tokens
```javascript
if (parent instanceof Actor) {
  return TokenUtils.getActorToken(parent);
}
if (parent instanceof ActorDelta) {
  return TokenUtils.getActorDeltaToken(parent);
}
if (parent?.parent instanceof FoundryApi.TokenDocument) {
  return TokenUtils.getTokenById(parent.parent.id);
}
```

## Contexto Técnico
- Aplica-se a todos os hooks de Embedded Documents: `createActiveEffect`, `deleteActiveEffect`, `createItem`, `deleteItem`, etc.
- A propriedade `.parent` é um getter nativo de `Document` que retorna o documento proprietário.
- Em cenários de unlinked tokens, o parent pode ser `ActorDelta` ao invés de `Actor`.

## Atenção: `effect.tint` ≠ `texture.tint`
Não confundir essas duas propriedades:
- `effect.tint` → cor da **borda do ícone** do efeito na UI (cosmético). Praticamente todos os efeitos definem.
- `ActiveEffectsUtils.KEYS.TINT_TOKEN` (`texture.tint`) → cor da **textura do token** no canvas. Definido em `changes`.

Ao filtrar efeitos que alteram a cor do token, use **apenas** `e.changes.some(c => c.key === TINT_TOKEN)`, **nunca** `e.tint !== null`.

