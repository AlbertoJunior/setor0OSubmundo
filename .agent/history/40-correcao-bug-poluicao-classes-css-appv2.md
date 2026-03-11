# Correção de Bug: Poluição de Classes CSS Globais (ApplicationV2)

## O Quê Foi Feito
O sistema estava sofrendo um estranho vazamento visual (CSS bug) que quebrava o grid de janelas padrão do jogo (`TokenConfig`, Actor Sheets, etc), afetando posições verticais e larguras após a utilização da Calculadora de Experiência.

A raiz do problema foi localizada na forma como a calculadora estava definindo suas opções estáticas para o `ApplicationV2`: A classe `ExperienceCalculatorDialog` estava usando um *getter* que interpolava as opções utilizando o utilitário `FoundryApi.mergeObject(super.DEFAULT_OPTIONS, ...)`. No Foundry V13, o helper `mergeObject` modifica permanentemente o primeiro objeto (target). 

Isso transformava o próprio `ApplicationV2.DEFAULT_OPTIONS` nativo, injetando *in-place* as classes da calculadora (`S0-V2`, `S0-content`, `S0-dialog`) em nível global, fazendo todas as próximas janelas geradas no Foundry herdarem essas classes indevidamente.

### Arquivos Alterados
- `module/creators/dialog/experience-calculator-dialog.mjs`:
  - Removido o *getter* dinâmico que interpolava `mergeObject` e `super.DEFAULT_OPTIONS`;
  - Substituído por uma declaração nativa de propriedade estática e pura `DEFAULT_OPTIONS = {}` sem wrapper `mergeObject()`, permitindo que a fundação `ApplicationV2` se encarregue do Deep Clone da mesclagem internamente de maneira perfeitamente isolada;
  - Deslocada a resolução de ID randômica `randomId(10)` para dentro dos options de inicialização do constructor em `ExperienceCalculatorDialog.open()`, garantindo que múltiplas janelas ativas não colidam seus IDs cacheados através do estático pré-processado;
  - Trocada a injeção em bloco de pacote de tradução (`localize(...)`) interativa por chaves estáticas (`S0.CONTROL.EXPERIENCE_CALCULATOR_BUTTON.Dialog_Title`) deixando o framework base resolver localmente.

### Aprendizados Extraídos
- Criado: `.agent/learnings/foundry-v13-applicationv2-prototype-pollution.md` detalhando as nuances arquiteturais e o perigo de se usar iteradores ou `mergeObject` vazados contra propriedades *super.* nas documentações v13 do Foundry.
- Atualizado: `.agent/learnings/_index.md`

## Testes Realizados / Sugeridos
- Executar e exibir o Diálogo de Experiência.
- Após isso, clique duplo em um token ou tente abrir uma Scene Config/Token Config nativa do core e verifique se renderiza sem herdar as classes `S0-V2`, `S0-content` na tag `<form class="application ...">`.
