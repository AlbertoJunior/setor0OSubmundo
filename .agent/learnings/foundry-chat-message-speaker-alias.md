# Foundry ChatMessage Speaker Alias Fallback

## Problema
Ao criar uma mensagem de chat usando `ChatMessage.getSpeaker({ actor: ator })`, se o ator for um `Linked Actor` (sem um `token` específico definido), o Foundry VTT tenta deduzir quem está falando. Se houver um Token selecionado no canvas, o Foundry associa a fala a esse Token, o que faz com que o nome (`alias`) da mensagem seja substituído pelo nome do Token selecionado, mesmo que a rolagem tenha partido de uma ficha diferente.

## Causa
No núcleo do Foundry VTT, a função `getSpeaker` contém a seguinte lógica caso nenhum token explícito seja passado:
```javascript
token = canvas.tokens.controlled[0]?.document;
if ( !alias ) alias = token ? token.name : actor.name;
```
Isso sobrescreve o nome do ator real pelo nome do token selecionado.

## Solução
Ao criar um Speaker para um Ator de forma explícita (como ao rolar de dentro de uma ficha), sempre passe a propriedade `alias` preenchida com o nome do Ator. Isso "pula" a verificação de fallback do Foundry VTT:

```javascript
const alias = actor.isToken ? actor.token.name : actor.name;
const speakerOptions = { actor: actor, alias: alias };
if (actor.isToken) speakerOptions.token = actor.token;

const speaker = ChatMessage.getSpeaker(speakerOptions);
```

## Contexto Técnico
Isso se aplica a todos os métodos centralizadores de chat e criação de `ChatMessage`. No sistema Setor 0 O Submundo, isso é tratado no Adapter estático `FoundryApi.ChatMessage.getSpeaker(actor)`.
