# 35 - Investimento e Rollback de Scene Controls (V13 Limitations)

## O que foi feito
Realizamos uma intensa investigação no hook `getSceneControlButtons`. O usuário solicitou a remoção de um workaround em que havia uma ferramenta de botão oculta (`tools.none`) sendo injetada unicamente para servir como um "Active Tool" do sistema. 
Fizemos a migração teórica de uma Injeção em Objeto para Arrays Nativos V13 (utilizando `Object.values(tools)`). Posteriormente, adequamos todos os eventListeners dos botões (`toggle: false`, `button: true`) que utilizavam `onChange` equivocado para o disparo `onClick` da nova framework.

## Resultado da Tentativa e Bug da Engine
Descobrimos que a exclusão plena de um `activeTool` dispara o TypeError crítico `#postActivate` / `#onToolChange` na `ui.controls` do Foundry, que não tolera painéis preenchidos exclusivamente por menus tipo botões simples/toggles de macro. A falha de não encontrar um "selecionável" destrói todos os listeners da aba afetada, inativando e travando a Scene Control por sessão.

Mesmo técnicas mais seguras (`visible: false` na API nativa, ou DOM queries com `display: none;`) acarretavam na mesma quebra. Foi diagnosticada a insuficiência atual da arquitetura para comportar a solução nativa pedida.

## Impacto
O repositório recebeu um `Rollback` das alterações (via `git`), voltando aos arquivos pré-edição (da branch `v0.0.3`):
- `scene-control-buttons.mjs`
- `pt-br.json`
- `en.json`

## Próximos Passos
O Aprendizado foi registrado em `.agent/learnings/foundry-v13-scene-control-dummy-tool.md`. Vamos aguardar um eventual suporte e estabilização de Custom Hooks sem fallback de ferramenta obrigatório numa plataforma eventual como a versão 14 da Engine.
