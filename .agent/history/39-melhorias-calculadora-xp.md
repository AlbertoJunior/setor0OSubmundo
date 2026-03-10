# 39 - Melhorias na Calculadora de Experiência

## O que foi feito
- Adaptada a tela ("Calculadora de Experiência") invocada pelo controle de mestre/jogador para permitir que os usuários não dependam exclusivamente da ação de "arrastar e soltar" (*drag-and-drop*) seus Personagens.
- Como jogadores estavam enfrentando dificuldades para arrastar na interface, foi incluído um `<select>` que lista automaticamente apenas os Personagens (`ActorType.PLAYER`) disponíveis para o usuário (vencendo a validação em `OwnershipUtils.canDoSomething(a)`).
- Foi criada a função interna `setActor(actor)` no `ExperienceCalculatorDialog` para encapsular a inserção do ator e re-renderização, garantindo uma fonte única de atribuição entre o Drop e o Select.
- Traduções isoladas e hardcoded nos scripts do componente (mensagens de alerta como *"Erros ao calcular"* ou *"Defina um personagem..."*) foram migradas de vez para as devidas chaves de internacionalização no `pt-br.json` e `en.json`.
- A interface gráfica (`experience-calculator.hbs`) foi reajustada no CSS base e nos utilitários para comportar bem a caixa de Drop e a lista suspensa (Select) em harmonia.

## Arquivos Alterados
- `module/creators/dialog/experience-calculator-dialog.mjs`
- `templates/dialog/experience-calculator.hbs`
- `lang/pt-br.json`
- `lang/en.json`

## Status
- Funcionalidade atualizada e testada. A mesma atende adequadamente as diretrizes da API v12/13.

## Decisões Técnicas Relevantes
- O formulário `<select>` trabalha diretamente interligado com a verificação de propriedades `OwnershipUtils.canDoSomething(...)` já existente no core do sistema, promovendo reaproveitamento de permissões de owner.

## Testes Sugeridos
1. Efetuar o login como Mestre. Abrir a Calculadora de XP e abrir a lista de seleção. O Mestre deve ver todos os Personagens.
2. Efetuar login como Jogador. Abrir a Calculadora de XP e abrir a lista. O Jogador deve ver apenas os Personagens onde possui permissão (Observer ou Owner) designada.
3. Arrastar um personagem diretamente para a janela "Dropzone" deve aplicar o mesmo comportamento que selecionar na lista, validando a função `setActor`.
4. Disparar uma recarga de cálculos forçosamente sem personagem ainda avisa pelo sistema de Notificação via i18n traduzido.
