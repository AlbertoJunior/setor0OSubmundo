# 33 - Remoção em Massa de Efeitos em Tokens

## O Que Foi Feito
- **Nova Feature GM:** Implementado um botão ("Remover Efeitos dos Tokens") exclusivo para Mestres na barra de controles de cena (`scene-control-buttons.mjs`).
- Refatoração e centralização da lógica de remoção de efeitos no `ActiveEffectsUtils`.
- **Dialog Customizado:** Adicionado um dialog nativo `FoundryApi.createDialog` com opção dupla de remoção: "Simples" (que preserva os inamovíveis como bônus de aprimoramentos/itens) e "Completa" (que força a limpeza de toda a lista de efeitos ativos nos tokens selecionados).

## Arquivos Alterados
- `module/hooks/scene-control-buttons.mjs`: Injeção do botão e internacionalização (i18n) de toda a barra com `S0.CONTROL`.
- `module/core/effect/active-effects-utils.mjs`: Inclusão dos métodos utilitários assíncronos `removeAllRemovableActorEffects` e `removeAllActorEffects`.
- `module/base/sheet/actor/player/methods/effects-methods.mjs`: Refatoração da rotina individual da ficha.
- `module/creators/dialog/remove-tokens-effects-dialog.mjs`: Classe dedicada para isolar a regra de negócio e chamadas do Dialog.
- `templates/others/remove-tokens-effects-dialog.hbs`: Novo template para isolar o HTML da janela.
- `lang/pt-br.json` e `lang/en.json`: Novas propriedades e grupamentos em `CONTROL`.

## Decisões Técnicas Relevantes
A interface do popup foi inteiramente movida para `RemoveTokensEffectsDialog` isolando as responsabilidades (Clean Code). Usamos Handlebars(`.hbs`) invocado através do `FoundryApi.renderTemplate` com chaves granulares exclusivas em `pt-br.json` e `en.json` para facilitar as traduções e flexibilidade de estilos (evitando tags HTML hardcoded em arquivos JSON de tradução). Os textos dos outros botões de controle de cena também aderiram ao i18n padrão.

## Testes Sugeridos
1. Como GM, selecione um token.
2. Acesse o menu de Configurações na HUD à esquerda.
3. Clique na caveira (Remover Efeitos).
4. Aplique efeitos bloqueados de classe e tente usar "Remover Simples", percebendo sua manutenção. Após, tente "Remover Todos" para de fato removê-los.
5. Acesse com a visão de jogador e comprove a indisponibilidade do botão na interface.
