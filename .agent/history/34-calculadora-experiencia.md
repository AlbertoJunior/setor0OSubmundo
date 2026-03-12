# Implementação da Calculadora de Experiência de Personagem (Player)

## O que foi feito
Criada uma nova ferramenta acessível na barra de Controle de Cena (`scene-control-buttons.mjs`), que permite o cálculo das experiências utilizadas ("gastas") para personagens do tipo Player. A calculadora apresenta as abordagens de evolução "otimizada" e "aproximada", além de bloquear personagens NPC.

## Arquivos alterados/criados
- `module/hooks/scene-control-buttons.mjs` (Modificado para inserir o botão).
- `lang/pt-br.json` e `lang/en.json` (Traduções do botão e janela incluídas).
- `module/creators/dialog/experience-calculator-dialog.mjs` (Interface V13 ApplicationV2 com lógica Drag and Drop e Controllers).
- `templates/dialog/experience-calculator.hbs` (View em três colunas e Vanilla UI).
- `module/core/actor/actor-experience-utils.mjs` (Utilitário que extrai a lógica consolidada e converte a contagem para dados do Sistema oficial).

## Decisões Técnicas Relevantes
- **Cálculo Aproximado com Thresholds (Limiares):** Utilizou-se variáveis dinâmicas (limiares para Habilidades e Atributos), permitindo o mestre definir a partir de que ponto um atributo foi comprado com sessão ao invés de usar os pontos de alocação inicial padrão. O cálculo sempre joga essas qualidades elevadas para a contagem de XP pura.
- **Validação de Tipo:** Uso da constante `ActorType.NPC` do `characteristic-enums.mjs` para validar restrições ao arrastar e soltar (impedindo NPCs de calcularem).
- **Interface Baseada em Três Colunas:** Dividimos controles de threshold e de Drop ("Arrastar Personagem"), a identificação (com Avatar estilo NPC `S0-image-npc` e Info Básica) e o painel de Output, promovendo melhor ergonomia.
- **Padronização:** Sem dependências jQuery ou lógicas atadas à manipulação DOM bruta, tudo utilizando as atualizações reativas do `.render(true)` do ApplicationV2 e do `HandlebarsApplicationMixin`.

## Testes Sugeridos
1. Efetuar o Drop de um Personagem NPC (notificações devem intervir).
2. Efetuar o Drop de um Player (imagem listada e botão de cálculos liberados).
3. Testar variação nos limiares e clique em 'XP - Aproximada' comparando a resposta de "XP - Otimizada".
# Refinamentos da Calculadora de XP

## Visão Geral
Concluímos a refatoração completa da ferramenta "Calculadora de Experiência" conforme solicitado. O formulário não apenas recebeu um banho de UI/UX, mas também teve todo o seu motor de cálculo recapacitado com regras aritméticas de subtração de acordo com a premissa de `initial_value`.

## Arquivos Modificados
- `module/core/actor/actor-experience-utils.mjs`: Centralização da regra fundamental `Math.max(0, actual_level - initial_value)` na base do looping de pontos gratuitos e custos adicionais interativos base. O Repertório foi limpo e também conta com cálculo linear.
- `module/creators/dialog/experience-calculator-dialog.mjs`: Interceptação direta para animações e dragões através do componente global `<details>` transferido para Javascript `classList.toggle("S0-expanded")`. Cores `var(--tertiary-color-alpha)` de ativação dropzone. "Recalcular" refatorado como universal.
- `templates/dialog/experience-calculator.hbs`: Retirados todas as strings soltas do sistema, incluído info tooltips interativos de `<i>`, repadronizado div's expansíveis com chevrons, e classes fantasmas apagadas.
- `styles/utilities.css`: Introduzida classe `S0-pt-0`.
- `lang/pt-br.json` & `lang/en.json`: Dicionários enriquecidos com `S0.CONTROL.EXPERIENCE_CALCULATOR_BUTTON.*`.

## Decisões Técnicas
Removemos cálculos de repertório em loops desnecessários e focamos o algoritmo de Experience Utils para subtrair sempre o level real do base map `initial_value`, escalando os custos exatamente como instruído via incrementos do `i` vs `cost`.
- O c�lculo de pontos de experi�ncia dos Tra�os agora se baseia no sourceId para buscar os pontos de XP intactos e limpos de comp�ndio via Repository referenciado TraitRepository.getItemByTypeAndId(), anulando bugs das inst�ncias alter�veis arrastadas no actor.system.
- Retiramos a depend�ncia dos utilit�rios como ActorUtils.getAllies(), acessando dados diretamente pelo objeto de atributos via Enum (CharacteristicType.REPERTORY.ALLIES) e extraindo o Number() seguro para fugir de concatena��es de String no Delta da Calculadora.
- templates/actors/status.hbs: Usu�rio removeu/substituiu o margin padr�o dos headers no painel de XP incluindo nova classe de margem S0-m-0, estabilizando a interface visual do Actor Sheet.

---

## 42 - Correção do Cálculo de XP para Aprimoramentos

### O que foi feito
Foi alterada a lógica de cálculo de experiência para a seção de Aprimoramentos (Enhancements) na Calculadora de Experiência. Antes, o sistema considerava apenas a "quantidade" de efeitos ativados. Agora, o sistema extrai o `level` real de cada efeito correspondente agrupado pelo tipo de aprimoramento (Ex: Agilidade, Brutalidade).
A lógica calcula o custo teórico máximo de cada grupo ativado e elege o grupo mais caro (maior custo em XP = Somatório progressivo da árvore). A pontuação inicial (gratuita) é então distribuída *apenas* a esse grupo primário, cobrindo os custos progressivos (Nível 1, Nível 2...) e cobrando apenas a diferença caso o nível do aprimoramento exceda os pontos gratuitos. Os demais grupos são calculados com o multiplicador base (`5 * nivel`).

Adicionalmente, o código foi extraído limpo em `_countEnhancementPoints()` para manutenibilidade.

### Arquivos alterados
- `module/core/actor/actor-experience-utils.mjs`: Refatoração na `buildActorDataProxy` utilizando `map` para resgatar os níveis agrupados em objetos `[{id, levels: [...]}]` em vez do `map("").length`. Refatoração no `_performCalculation` e extraí o cálculo para função privada `_countEnhancementPoints`.

### Decisões técnicas relevantes
Optou-se por isolar a contagem de XP dos Aprimoramentos do utilitário `this._countPoints`, dado que aquele método pressupunha contagem de 1 a N iterativos, o que não reflete a compra pontual e mista de efeitos em uma "árvore" de aprimoramentos.

### Testes sugeridos
Abrir a ficha de um Ator, adicionar Aprimoramentos divididos em grupos, por exemplo: Agilidade `[1, 2, 3, 4]` e Brutalidade `[1, 2]`.
Considerando 3 pontos iniciais (Ciborgue), o algoritmo testará: Agilidade custa teóricamente 50 XP; Brutalidade custa 15 XP. Agilidade ganha os bônus. Os pontos iniciais pagarão o Nível 1(1), Nível (2) e Nível (3). Ao chegar no nível 4 faltarão pontos e ele custará 5 XP. A Brutalidade não possui bônus e é paga integralmente (1x5 + 2x5 = 15).
Custo Final será `5 + 15 = 20 XP`. Conferir se esse valor reflete no popup da calculadora de XP.
