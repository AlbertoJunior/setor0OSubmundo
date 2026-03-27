# Correção: Cálculo de Experiência de Aprimoramentos

## O Que Foi Feito
- Corrigida a lógica de `_countEnhancementPoints` dentro da classe `ActorExperienceUtils`, onde os Pontos Iniciais (PI) estavam sendo deduzidos utilizando o __valor numérico__ do nível em vez de atuar por instâncias isentas de cada Aprimoramento.
- Ajustada a priorização dos grupos de aprimoramentos para que grupos com *mais níveis (elementos)* sejam despachados primeiro, havendo um critério de desempate baseado no maior custo bruto.

## Arquivos Alterados
- `module/core/actor/actor-experience-utils.mjs`: Reescrevemos a função `_countEnhancementPoints` incorporando as duas alterações citadas.

## Decisões Técnicas Relevantes
- **Abordagem Orientada à Instância**: Decidiu-se contabilizar os Pontos Iniciais (PI) como tokens de consumo universal unitário `(initialEnhUsed--)` sobre as instâncias de aprimoramento em sua ordem de menor custo para maior custo. A sobra de PI passa a ser naturalmente herdada pelos grupos secundários da fila.

## Testes Sugeridos
- Validar Ator Ciborgue garantindo que o valor de Pontos de Experiência cobrados será exatamente 0 caso tenham apenas quatro (4) instâncias de níveis compradas dentro do grupo com maior quantidade de aprimoramentos.
