# 11 - Remoção de Efeitos com validação CAN_REMOVE

## O que foi feito
- Adicionada a validação da flag `CAN_REMOVE` no método que remove todos os efeitos na ficha do personagem. 
- Removido o comentário `TODO` que indicava a falta dessa funcionalidade.

## Arquivos alterados
- `module/base/sheet/actor/player/methods/effects-methods.mjs`

## Decisões técnicas relevantes
- Utilizado o método estático `ActiveEffectsUtils.canRemoveEffect(effect)` existente para verificar se um efeito pode ser removido, filtrando o array de efeitos antes do mapeamento para os IDs de origem.

## Testes sugeridos
- Acessar a ficha do personagem.
- Adicionar um efeito que pode ser removido e um que não pode (se possível no painel de efeitos).
- Clicar na lixeira para remover todos os efeitos e verificar se o que não tem remoção habilitada (CAN_REMOVE = FALSE) foi mantido.
