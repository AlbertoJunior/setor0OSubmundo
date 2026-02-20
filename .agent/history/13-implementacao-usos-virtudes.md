# 13 - Implementação do Controle de Uso das Virtudes (Quietude e Consciência)

## O que foi feito
- Implementada a leitura em `ActorUtils` da quantidade de usos disponíveis diários das virtudes Quietude e Consciência pelos atores.
- As informações foram injetadas em toda a rotina de ações assíncronas padrão e chegam aos métodos de geração de mensagem (como os parsers em `RollMessageCreator` e `RollVirtueMessageCreator`).
- Solucionadas lógicas bloqueadas com TODOs pendentes onde o código fingia que as virtudes estavam sempre disponíveis ao jogador, evitando confusão de regras.

## Arquivos Alterados
- `module/core/actor/actor-utils.mjs`:
  - Adicionados `haveQuietness(actor)` e `haveConsciousness(actor)`.
- `module/utils/default-actions.mjs`:
  - Todos os repasses de rollAction modificados para enviar os retornos dos dois novos verificadores baseados no actor chamador.
- `module/creators/message/roll-mesage.mjs`:
  - Corrigida a tipagem e os repasses dos parâmetros nos fluxos default. Substituído mockup falso que dizia que `haveQuietness` da rolagem principal com sobrecarga era sempre verdadeira.
- `module/creators/message/virtue-roll.mjs`:
  - Modificado o construtor `mountContent` para deixar de simular a permissão com o `TODO` mockando constante de consciência, importando das injeções de parâmetros.

## Decisões Técnicas Relevantes
- Uso exclusivo do model `CharacteristicType.VIRTUES.[virtue].USED` x `[virtue].LEVEL` pelo `getObject` interno, assegurou que as atualizações estão atreladas 100% aos dados primitivamente cadastrados no template Actor.

## Testes Sugeridos
1. Role um dado normal e ganhe dado de Sobrecarga com pelo menos 1 uso livre em "Quietude". A mensagem final precisa estar permitindo uso da quietude para estabilizar resultado de caos.
2. Zere os pontos de Quietude do personagem no painel superior esquerdo e execute novamente uma rolagem com Sobrecarga; O botão não pode mais aparecer para aquele chat de mensagem novo.
3. Repita o análogo validando um botão para teste exclusivo usando "Consciência".
