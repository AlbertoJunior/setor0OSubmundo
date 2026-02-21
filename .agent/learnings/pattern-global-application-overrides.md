# Padrão de Injeção Global em Application Overrides

## Problema
Desenvolvimento modular inter-versões (ApplicationV1 e ApplicationV2) do FoundryVTT exigia a implementação de código repetido (boilerplate explícito marcado com `#region`) dentro de cada classe das planilhas (`FoundryApi.ItemSheet` e `FoundryApi.ActorSheet`), dificultando a manutenção do Clean Code, gerando redundância e complexidade ao criar novas planilhas.

## Solução
A injeção de comportamento das variáveis de Application deve ser gerida através da Higher Order Function do `makeSheetClass` responsável pela compilação reflexiva da UI, nos arquivos `v1.mjs` e `v2.mjs` de `versions-overrides`.

## Contexto Técnico
- **Rotulação de Templates (Application V1 e V2):** Em vez da planilha (SheetClass) informar qual `template` ela precisa devolver sob o documento atual, o `v1.mjs` ou `v2.mjs` inspeciona a lista estática universal de `BaseClass.PARTS` de uma planilha.
- No `v1.mjs`: Construção iterativa descobre o formato correto de `.hbs` comparando a propriedade correspondente em `PARTS[documentType]`, fazendo fallback seguro se o documento referir a outro item.
- No `v2.mjs`: Em vez da Planilha realizar overriding explícito em `_operateMultiParts` para suprimir partes de outras classes não ativas, a função pai intercepta os pedidos do DOM, garantindo a sub-amostragem correta sem código extra nas planilhas finais.
- **Configurações da Tela:** Medidas de V1 legadas (Alturas/Larguras explicitamente forçadas) podem conviver no dicionário canônico de Sheet (ex: `static DEFAULT_OPTIONS`), pois a fábrica de overrides agora extrai passivamente delas as variáveis relevantes de retrocompatibilidade sem vazar para a UI do Foundry V2 de maneira explícita.
