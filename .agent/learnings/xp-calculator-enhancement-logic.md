# Lógica de Dedução de XP para Aprimoramentos

## Problema
O cálculo de Aprimoramentos aplicava uma Matemática onde os Pontos Iniciais (PI) tinham seu "saldo" deduzido baseando-se no valor absoluto/numérico do nível do Aprimoramento. Isso gerava um erro onde um jogador com 4 PI consumia quase todo seu saldo ao ganhar 1 Aprimoramento de nível 3, devendo de forma incorreta o nível 4.

## Causa
A interpretação de que o "PI subtrai níveis absolutos" (`initialEnhUsed -= level`). Além disso, a prioridade não analisava exatamente a quantidade de níveis comprados em contraste com outros grupos.

## Solução
- Refatoração de `_countEnhancementPoints(...)`.
- A prioridade de despacho atua primeiro iterando sob grupos com **MAIOR QUANTIDADE DE NÍVEIS** (`b.levels.length - a.levels.length`), empatada se dá desempate pelo Custo Maior.
- PI atua como Moedas / Tokens unitários que simplesmente pulam instâncias de cobrança. Para deduzir aprimoramentos se usa `initialEnhUsed--`, zerando o custo daquele step iterado.

## Contexto Técnico
- **Core / Regras de Sistema / Calculadora de Experiência**
