# 57 - Correção Bug Token Tint em Enhancements

## O que foi feito
Corrigido o bug onde efeitos de Aprimoramentos com `TINT_TOKEN` (Encantar, Apavorar, Divindade, Camuflagem, etc.) não pintavam o token quando ativados individualmente. A oscilação com 2+ efeitos funcionava, e o efeito "Percebido" aplicado diretamente no token via HUD também funcionava.

## Causa Raiz (Dupla)
O bug tinha **duas causas simultâneas**:

### 1. `hasEffectsWithTint` — Confusão entre `effect.tint` e `texture.tint`
O filtro `hasEffectsWithTint` continha `|| e.tint !== null`, que confundia:
- `effect.tint` = cor da **borda do ícone** do efeito (cosmético UI)
- `texture.tint` (`TINT_TOKEN`) = cor da **textura do token** no canvas

Como praticamente todos os efeitos definem `tint` na borda do ícone (via `createEffectData` ou `#configureActiveEffectTint`), o método **sempre retornava `true`** se houvesse pelo menos 1 efeito com TINT_TOKEN + qualquer outro efeito com borda colorida. Isso forçava o código a entrar no branch de oscilação, que imediatamente saía sem pintar nada (por ter apenas 1 `activeTint` real).

### 2. `#getToken(options)` — Parent acessado no local errado
O método buscava `options.parent`, mas na API do Foundry VTT v13 o parent de Embedded Documents está em `effect.parent`. A correção mudou para `#getToken(effect)`.

## Arquivos Alterados

| Arquivo | Alteração |
| :--- | :--- |
| [active-effects-utils.mjs](../module/core/effect/active-effects-utils.mjs) | Removido `\|\| e.tint !== null` do filtro `hasEffectsWithTint`. Adicionado JSDoc explicativo. |
| [create-active-effect.mjs](../module/hooks/active-effects/create-active-effect.mjs) | `#getToken(options)` → `#getToken(effect)` e `options.parent` → `effect.parent`. Adicionado optional chaining defensivo. |

## Decisões Técnicas
- **Remoção de `e.tint !== null`:** O `OscillatingTintManager.verifyOscilatingTokens()` já usava o filtro correto (apenas `changes` com `TINT_TOKEN`), confirmando a inconsistência. A remoção alinha `hasEffectsWithTint` ao mesmo critério.
- **`effect.parent` vs `options.parent`:** A API do Foundry VTT v13 define que o parent de embedded documents é acessível pela propriedade `.parent` do próprio documento, não pelas options do hook.

## Testes Sugeridos
1. Ativar "Encantar" (Influência) → token deve pintar `#F0A0FF`
2. Ativar "Apavorar" → token deve pintar `#FA7D55`
3. Ativar "Encantar" + "Apavorar" → deve oscilar entre as cores
4. Remover um efeito → token deve manter a cor restante
5. Remover o último efeito → token volta à cor padrão
6. Aplicar "Percebido" via token HUD → deve continuar funcionando
7. Aplicar "Camuflagem" (Invisibilidade) → token deve pintar `#55C8FA`
