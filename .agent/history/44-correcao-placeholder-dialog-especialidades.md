# 44 - Correção do Placeholder no Dialog de Especialidades

## O que foi feito
- Substituição da tag `<form>` por `<div>` no template `specialty-dialog.hbs`.
- Remoção do prefixo `<form></form>` em `v2.mjs`.
- Utilização de `document.createElement` para passar o conteúdo como elemento DOM para o `DialogV2`.
- Aperfeiçoamento do `DialogUtils.getDialogFormData` para detecção robusta de formulários.

## Arquivos alterados
- [specialty-dialog.hbs](file:///c:/Users/jrdap/AppData/Local/FoundryVTT/Data/systems/setor0OSubmundo/templates/actors/dialog/specialty-dialog.hbs)
- [v2.mjs](file:///c:/Users/jrdap/AppData/Local/FoundryVTT/Data/systems/setor0OSubmundo/module/api/versions-overrides/v2.mjs)
- [dialog-utils.mjs](file:///c:/Users/jrdap/AppData/Local/FoundryVTT/Data/systems/setor0OSubmundo/module/utils/dialog-utils.mjs)

## Decisões técnicas relevantes
- **Bypass de Sanitização via DOM**: No Foundry V13, o construtor do `DialogV2` limpa strings via `cleanHTML`, o que pode remover atributos se o HTML for interpretado como malformado. Passar um `HTMLElement` (já parseado previamente pelo `innerHTML` do browser) pula essa sanitização de string do construtor.
- **Limpeza de Workarounds Antigos**: A remoção do prefixo `<form></form>` em `v2.mjs` limpa uma dívida técnica que causava estruturas de HTML inválidas (formulários aninhados que o browser tentava "corrigir").
- **Robustez na Coleta de Dados**: O `DialogUtils` agora é capaz de encontrar o formulário correto mesmo que ele seja a raiz do conteúdo ou esteja envolto pelo `DialogV2` nativamente.

## Testes sugeridos
- Abrir o diálogo de criação/edição de especialidades e verificar se os campos de "Descrição" exibem o texto de exemplo (placeholder).
- Confirmar se a criação e edição de especialidades continua salvando os dados corretamente.
