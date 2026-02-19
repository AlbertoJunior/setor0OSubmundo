# 02 - Implementação do EffectsHandleEvents.handleView()

**Data:** 2026-02-11
**Tipo:** Implementação de funcionalidade

## Contexto
O método `handleView` em `effects-methods.mjs` estava vazio, apenas com `TODO('implementar')`. O botão 👁 na lista de efeitos ativos na aba Status do personagem não fazia nada.

## O que foi feito

### Arquivos criados
1. **`module/creators/dialog/effect-dialog.mjs`** — Dialog de visualização do efeito com botão "Chat"
2. **`module/creators/message/effect-message.mjs`** — Creator de mensagem para efeitos (renderiza template Handlebars)
3. **`templates/effects/effect-dialog.hbs`** — Template do conteúdo do dialog (usa `S0-content`)
4. **`templates/messages/effect.hbs`** — Template da mensagem no chat (usa `S0-message-content`)

### Arquivos modificados
5. **`module/base/sheet/actor/player/methods/effects-methods.mjs`** — Implementação do `handleView()`, remoção do import `TODO`
6. **`lang/pt-br.json`** — Adicionadas chaves: `Origem`, `Mudancas`
7. **`lang/en.json`** — Adicionadas chaves: `Origem` (Origin), `Mudancas` (Changes)

## Padrão seguido
Seguiu o padrão do `TraitDialog.openByTrait()`:
- Abre dialog via `FoundryApi.createDialog()` com dados extraídos do Active Effect
- Botão "Chat" envia informações formatadas para o chat via `ChatCreator.sendToChat()`
- Template de mensagem segue a mesma estrutura do `trait.hbs`

## Dados exibidos
- Nome do efeito
- Origem
- Tipo de origem (via `ActiveEffectsUtils.activeEffectOriginTypeLabel`)
- Buff/Debuff (exibido diretamente como `<strong>`, sem label)
- Status (inativo, se desabilitado)
- Descrição
- Mudanças (changes): label legível + valor (sem mode)

## Correções aplicadas (revisão do usuário)
- Título do dialog: `"Ver Efeito"` → `"Efeitos"` (usando `localize("Efeitos")`)
- CSS class no dialog template: `S0-message-content` → `S0-content`
- Buff/Debuff: exibido diretamente como `<strong>{{effectTypeLabel}}</strong>` sem label "Buff/Debuff:"
- Changes: removido `mode`, exibe apenas `label: value`
- Change keys: convertidos de `system.bonus.atributos.percepcao` para "Percepção" usando `keyJsonToKeyLang` + `gameLocalize`
- Mesmas correções aplicadas ao template de mensagem (`effect.hbs`)

## Correções aplicadas (melhoria de labels de changes)
- Adicionadas chaves de localização para keys compostas dos bônus:
  - `Penalidade_Dano` → "Penalidade de Dano"
  - `Penalidade_Dano_Fixa` → "Penalidade de Dano Fixa"
  - `Ofensivo_Corpo_A_Corpo` → "Ofensivo Corpo a Corpo"
  - `Ofensivo_Longo_Alcance` → "Ofensivo Longo Alcance"
  - `Defensivo_Multiplo` → "Fator Defensivo"
- Para `defensivo_multiplo`: valor exibido como porcentagem (ex: `0.5` → `50%`) via `#parseChangeValue`
