# Log de Alteração - Migração ActorSheet para V2

**Data:** 2026-02-15
**Task:** Migração completa da ActorSheet para Application V2 (Foundry VTT v13)

## O que foi feito
- Migração da classe base `ActorSheet` na facade `FoundryApi` de Application V1 para Application V2.
- Isolamento de comportamentos específicos da V1 (como `_getHeaderControls`) dentro do arquivo de override `v1.mjs`.
- Limpeza da `BaseActorSheet.mjs`, removendo métodos legados que entravam em conflito com a V2.
- Correção no tratador de submissão de formulários da V2 (`v2.mjs`) para identificar corretamente o campo alterado via `event.submitter`, resolvendo bug de campos `select` vindo como indefinidos.

## Arquivos Alterados
- `module/api/foundry-api.mjs`: Atualizada a referência de `ActorSheet` para V2.
- `module/api/versions-overrides/v1.mjs`: Adicionado `_getHeaderControls` para manter retrocompatibilidade se necessário.
- `module/base/sheet/actor/BaseActorSheet.mjs`: Removido `_getHeaderControls`.
- `module/api/versions-overrides/v2.mjs`: Ajustada a lógica de submissão de formulários e resolvido TODO técnico.

## Decisões Técnicas Relevantes
- **Anti-Corruption Layer**: Ao mover métodos legados para `v1.mjs`, evitamos que a dívida técnica da versão anterior contamine as classes atuais do sistema.
- **Event Submitter**: O uso de `event.submitter || event.target` no V2 garante que o campo exato que disparou o `submitOnChange` seja capturado, mesmo em elementos complexos como `select`.

## Testes Sugeridos
1. **Edição de Atributos**: Verificar se a mudança síncrona nos atributos do ator persiste.
2. **Selects**: Testar a troca de "Morfologia" e "Bairro" na aba principal da ficha.
3. **Imagens**: Verificar se o clique na imagem do ator abre o FilePicker e salva a nova imagem.
4. **Header**: Garantir que os controles de janela (fechar, minimizar) continuam funcionando conforme o padrão nativo do v13.

## Status de Migração
- **Migração v12 -> v13**: 95% concluída (Atores e Itens agora operam em V2. Diálogos e outras Apps menores podem ser revisados).
