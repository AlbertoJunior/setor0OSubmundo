# Implementação de Macro de Rolagem

## O que foi feito
Foi criada uma nova macro padrão para o projeto chamada "Fazer Rolagem" (`open-roll.mjs`). Esta macro tem como objetivo abrir a janela de rolagem (`ActorRollDialog`) para o token selecionado, desde que o usuário tenha permissão para isso, seguindo o mesmo padrão arquitetural das macros "open-bag" e "open-shortcuts". O método `rollDialog` foi exposto globalmente através da classe `MacroUtils` e atribuído via `globalThis.${SYSTEM_ID}.MacroMethods`.

## Arquivos Alterados
- `module/core/macro/default/open-roll.mjs` (Criado)
- `module/core/macro/macro-utils.mjs` (Alterado)

## Decisões Técnicas
- **Integração com ActorRollDialog**: Em vez de fazer a importação dinâmica dentro da string do `command` da macro (que é evaliada via `eval()` pelo Foundry), optou-se por utilizar o método global `MacroMethods` da classe `MacroUtils`. Foi adicionado o método assíncrono `rollDialog(actor)` que chama `ActorRollDialog.open(actor)`.
- **Validações de Permissão**: Foram reaproveitados os scripts utilitários injetáveis `${verifyAndReturnSelectedToken}` e `${verifyAndReturnActor}`, garantindo a verificação de seleção do token no canvas (`canvas.tokens.controlled[0]`) e de permissão do usuário através de `actor?.sheet.canRollOrEdit`.
- **Padrão de Criação de Macros**: A macro adota o padrão de objeto estático exportável contendo as *flags* sob `SYSTEM_ID` e garantindo um novo `SOURCE_ID` lógico (5). Também foi adicionada à lista retornada por `getDefaultMacroUsers()` para que os usuários a recebam.

## Testes Sugeridos
1. Acessar o sistema como mestre ou jogador com permissão em um token.
2. Selecionar o token no canvas.
3. Arrastar a macro "Fazer Rolagem" da lista de macros (caso tenha recebido pelo DefaultMacroUsers) e clicar.
4. Validar se a interface gráfica de rolagem (`ActorRollDialog`) aparece em tela para o token selecionado.
5. Selecionar nenhum token ou um sem permissão e rodar a macro atestando que a notificação de advertência de permissão padrão é disparada.
