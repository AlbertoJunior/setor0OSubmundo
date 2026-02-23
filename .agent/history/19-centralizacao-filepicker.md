# Centralização e Correção do FilePicker (Equipamentos e Atores)

## O que foi feito
A tela de equipamentos não estava abrindo o seletor de arquivos (FilePicker) ao clicar na imagem do item. O comportamento de seleção de arquivos (imagens) era inconsistente entre versões do Foundry e os tipos de planilhas.
- Na **V12 (Application V1)**, `ActorSheet` interceptava automaticamente `data-edit="img"`, mas as planilhas derivadas de `ItemSheet` exigiam tratamento manual.
- Na **V13 (Application V2)**, o sistema desconsiderava o `data-edit`, passando a usar eventos mapeados via `data-action="img"` ou `actions` definidos no objeto retornado em `DEFAULT_OPTIONS`.

A solução foi unificar o comportamento adicionando `data-action="edit" data-characteristic="img"` aos elementos de imagem dos templates de equipamentos e atores, e abstrair a mecânica do FilePicker de forma centralizada no `Setor0BaseSheet`. Isso garante previsibilidade, elimina inconsistências baseadas na versão da Application (V1 vs V2), e limpa códigos duplicados.

- Criação de uma validação dentro de `Setor0BaseSheet.mjs` através de um novo getter "Lazy Cache" com nome `defaultMapEvents`, para mapear a ação genérica `img: { [OnEventType.EDIT]: ... }`. O método `getMapEvents()` mescla (merge) essa ação default com os eventos locais da classe herdeira.
- Adição da mecânica agnóstica de atualização baseada no call `this.updateDocument(...)` compatível com todas as entidades herdadas (Actor, Item, etc).
- Padronização em todos os arquivos `.hbs` envolvidos com a imagem principal (`npc-sheet.hbs`, `biography.hbs`, `default.hbs` e `common-equipment.hbs`) para assumirem atributos controlados restritamente `data-action="edit" data-characteristic="img"`.
- Limpeza dos handlers redundantes implementados na Action Registry do V2 (`module/api/versions-overrides/v2.mjs`) e implementações específicas que antes residiam em `equipment-sheet.mjs`.

## Arquivos Alterados
- `module/base/sheet/Setor0BaseSheet.mjs`: Centralização da lógica de `FilePicker` com implementação do sistema de **Lazy Cache** em `getMapEvents()`.
- `module/base/sheet/equipment/equipment-sheet.mjs`: Limpeza de handlers isolados.
- `module/api/versions-overrides/v2.mjs`: Remoção de listeners legados da Application V2.
- `templates/npc/npc-sheet.hbs`: Padronização de marcadores HTML.
- `templates/actors/biography.hbs`: Padronização de marcadores HTML.
- `templates/items/default.hbs`, `templates/items/others/common-equipment.hbs`: Padronização final.

## Decisões Técnicas Relevantes
- Um FilePicker padronizado universal elimina comportamentos divergentes e previne loops de handlers baseados em features de fallback das versões Foundry.
- A decisão de amarrar o FilePicker no wrapper final fortalece a coesão do modelo Facade/Controller (`Setor0BaseSheet`) que todas as planilhas do Setor Zero devem honrar. 
- Essa abordagem usa Polimorfismo ao acionar um método abstrato `updateDocument` dentro do escopo `Setor0BaseSheet`, e como cada classe filha implementa seus próprios Updaters (`ActorUpdater`, `EquipmentUpdater`), o sistema não precisa saber O QUE está atualizando a imagem, apenas que ela será atualizada pelas devidas regras de negócio. 
- Implementação de um sistema de **Lazy Cache** em `getMapEvents()`. O merge entre o mapa padrão (`defaultMapEvents`) e o específico da planilha (`mapEvents`) agora ocorre apenas uma vez por inicialização da ficha, otimizando o consumo de CPU e evitando a criação excessiva de objetos.
- Nota para o futuro: Por enquanto, o sistema trata todos os eventos como **estáticos**. Caso surja a necessidade de eventos que mudam dinamicamente durante a sessão sem reload da ficha, a estratégia de cache deverá ser ajustada.

## Testes sugeridos
Ao logar no FoundryVTT, as seguintes features devem continuar abrindo o FilePicker com sucesso:
- Ao clicar na imagem da aba Descrição do Ator PJ.
- Ao clicar na imagem principal de um equipamento no ItemSheet.
- Ao clicar na imagem do Avatar da ficha do NPC.
- Confirmar que a troca destas altera o `img` do Document de forma persistente.
