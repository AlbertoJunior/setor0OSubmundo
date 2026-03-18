# Sanitização de HTML no Foundry V13 (DialogV2)

## Problema
Atributos como `placeholder` desapareciam misteriosamente do conteúdo de um `DialogV2` após a instância ser criada, mesmo estando presentes na string de `content` original.

## Causa
O Foundry VTT v13 (via `ApplicationV2`/`DialogV2`) realiza uma sanitização de HTML no fragmento de conteúdo fornecido. Se o fragmento contiver uma estrutura considerada inválida ou problemática pelo navegador durante a conversão de string para DOM (como tags `<form>` aninhadas ou múltiplas tags `<form>` no mesmo nível dependendo de como são injetadas), o processo de sanitização pode remover atributos de elementos internos como `input` e `textarea`.

No caso específico, o `v2.mjs` do sistema estava prefixando o conteúdo com um `<form></form>` vazio, e o template já continha uma tag `<form>` externa.

## Solução
A solução definitiva envolve pular a sanitização baseada em string do construtor do `DialogV2`. Isso é feito convertendo a string de conteúdo (HTML) em um elemento DOM real (ex: `HTMLElement`) antes de passá-la para as opções do diálogo.

1. **DOM Parsing**: Em vez de passar a string bruta, cria-se um container `div`, define-se seu `innerHTML` com o conteúdo e passa-se o container (ou seus filhos) para o dialog. O browser faz o parse correto dos atributos, e o Foundry não tenta "limpar" a string novamente no construtor.
2. **Remoção de Estruturas Inválidas**: Removendo prefixos de formulários vazios (`<form></form>`) que tentavam contornar problemas de detecção de dados, mas geravam HTML inválido (formulários aninhados).
3. **Melhoria no Utilitário de Dados**: Ajustar o `DialogUtils` para ser robusto o suficiente para encontrar o formulário principal sem depender de hacks de prefixo.

## Contexto Técnico
- **Framework**: Foundry VTT v13
- **Classe**: `foundry.applications.api.DialogV2`
- **Comportamento**: Sanitização automática de `options.content`.
- **Padrão Recomendado**: Usar `div` como container raiz em templates de dialogos `v2` para evitar conflitos de aninhamento de formulários.
