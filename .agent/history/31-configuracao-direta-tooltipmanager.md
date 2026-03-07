# Documentação da Modificação do TooltipManager e Scrolling Text

## O que foi feito
- Implementada a classe `Setor0TooltipManager` estendendo `FoundryApi.TooltipManager`.
- Adicionado o valor estático `TOOLTIP_ACTIVATION_MS` na nova classe.
- Inserido o `Setor0TooltipManager` em `CONFIG.ux.TooltipManager` nativamente no hook de inicialização.
- Desenvolvido o método `applyActivationDelay` executado no hook `ready.mjs` para contornar limitações do Foundry V13 que descartava nossa classe customizada devido a checagens internas de herança na UI.
- No arquivo `Setor0ActiveEffect.mjs`, estendemos o override de `canvas.interface.createScrollingText` injetando a propriedade `duration` para controlar quanto tempo os textos de status ficam pulando na tela.

## Arquivos Alterados
- `module/hooks/init.mjs`
- `module/hooks/ready.mjs`
- `module/api/foundry-api.mjs`
- `module/base/ui/Setor0TooltipManager.mjs`
- `module/base/document/Setor0ActiveEffect.mjs`

## Decisões Técnicas Relevantes
- O encapsulamento nativo do `game.tooltip` pela V13 exige que injeções complexas no `CONFIG.ux.TooltipManager` através de adaptadores dinâmicos sejam reforçadas. A chamada de `applyActivationDelay()` assegura que a instância final gerada repasse o valor estático sem ferir protótipos originais.
- O parâmetro `duration` adicionado às opções de textStyle do `createScrollingText` permitiu o controle fino da animação PIXI que não é gerenciada pelo TooltipManager.

## Testes Sugeridos
- Validar tooltip em itens e habilidades (funcional nos testes).
- Validar tempo do texto subindo na cena ao ativar/desativar efeito (funcional).
