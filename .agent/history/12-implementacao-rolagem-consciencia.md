# 12 - Implementação da Rolagem da Virtude Consciência

## O que foi feito
- Implementada a funcionalidade da rolagem de Consciência em `module/core/rolls/consciousness-roll.mjs`.
- Adicionado sistema para capturar a rolagem anterior (apenas dados padrão, ignorando a sobrecarga) e re-rolar o mesmo número de dados.
- Criado o arquivo `module/creators/message/consciousness-roll.mjs` responsável por processar os dados e combinar os sucessos dos dados antigos com os dados novos.
- Criado o template `templates/messages/roll/consciousness.hbs` para exibir separadamente a rolagem anterior e a nova rolagem, apresentando ao final os sucessos combinados.
- Adicionadas as strings `Rolagem_Anterior` e `Nova_Rolagem` no arquivo de tradução `lang/pt-BR.json`.

## Arquivos alterados
- `module/core/rolls/consciousness-roll.mjs`
- `lang/pt-BR.json`

## Arquivos criados
- `module/creators/message/consciousness-roll.mjs`
- `templates/messages/roll/consciousness.hbs`

## Decisões técnicas relevantes
- Em `RollConsciousness.operateMessage`, foi filtrado apenas dados normais não-sobrecarga como base para a nova rolagem, conforme solicitado. O filtro ajustado (`isOverload`) foi corrigido para checar tanto `roll.options` quanto `roll.flags`.
- A verificação de qual rolagem é Sobrecarga ou não foi unificada e abstraída para uma nova classe utilitária `RollUtils.isOverloadRoll` (`module/utils/roll-utils.mjs`).
- O mesmo ajuste de compatibilidade para `isOverload` e o uso do `RollUtils` foi aplicado através dos rolagens de Perseverança e Quietude (`perseverance-roll.mjs` e `quietness-roll.mjs`).
- Em `RollConsciousnessMessageCreator.mountContent`, utilizado o spread operator para agrupar `[...values, ...newValues]` e enviado para `RollMessageCreator.verifyResultRoll`, aproveitando a lógica nativa do sistema para calcular os acertos totais em vez de reinventar a roda.

## Testes sugeridos
- Realizar uma rolagem padrão de Vigor + Medicina, por exemplo, pelo ChatLog ou ficha.
- Simular o uso da virtude Consciência a partir dessa rolagem (clicando no botão ou executando o método correspondente).
- Observar a nova mensagem gerada no chat, garantindo que os dados anteriores e os novos dados sejam exibidos corretamente e o total de sucessos reflita a soma de ambos.
