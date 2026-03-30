# 49 - Construtor de Efeitos Customizado (Substâncias e SuperEquipamentos)
**Data:** 30 de Março de 2026
**Responsável:** Antigravity (Agent)

## O que foi feito
Foi implementada a **Opção 1 (Dialog Builder Embutido na Ficha)** aprovada pelo usuário, estendendo a flexibilidade de construção modular do `Trait` para **Substâncias** e **SuperEquipamentos**. Isso garante que o jogador possa gerar e parametrizar efeitos customizados nas fichas dos itens com sua própria nomenclatura e bônus, sem depender exclusivamente da lista hardcoded dos repositórios.

## Arquivos Alterados
* `templates/items/sheet/substance.hbs` (HTML - Novo botão de Add Customizado - Ícone de Ferramenta)
* `templates/items/others/superequipment.hbs` (HTML - Novo botão de Add Customizado - Ícone de Ferramenta)
* `templates/items/dialog/substance-effect-custom.hbs` (HTML - Novo template de construtor dialog)
* `templates/items/dialog/superequipment-trait-custom.hbs` (HTML - Novo template de construtor dialog)
* `module/enums/on-event-type.mjs` (Enumerações - nova flag `CUSTOM`)
* `module/base/sheet/equipment/methods/equipment-characteristics-methods.mjs` (JS - Handler de Construção de Efeitos para Substância)
* `module/base/sheet/equipment/methods/superequipment-methods.mjs` (JS - Handler de Construção de Efeitos e Particularidade de SuperEquipamento)
* `lang/pt-br.json` e `lang/en.json` (Tradução Localize - Adição de `S0.Criar_Customizado` e afins)

## Decisões Técnicas Relevantes
* **Componente de Reúso:** Reutilizamos a lógica do `CreateFormDialog` invocada anteriormente pelos Trait, injetando callbacks de validação para instanciar novos `StandardEffectField` e `SuperEquipmentTraitField`.
* **Clean UI:** Utilizamos arrays isolados (o `Set` nas Substâncias e lista pura concatenando particularidade no SuperEquipamentos) injetados diretamente com a engine do `EquipmentUpdater`, evitando a necessidade da injeção de documentos estáticos de banco simulado que polui abas.
* **OnEventType:** Registramos `OnEventType.CUSTOM` como ação universal tratada via `[data-action="custom"]`.

## Testes Sugeridos
* **Teste 1:** Abra a ficha de uma poção/droga instanciada, clique na "Ferramenta" (Customizar Efeito). Instancie um Buff de +4 de Força com um nome arbitrário. Verifique se aparece na ficha.
* **Teste 2:** Coloque essa droga em um personagem e veja se os ArrayFields do Foundry atualizam o Status do token.
* **Teste 3:** Faça o mesmo para um SuperEquipamento customizando uma Vantagem com Custo 2 Limite 2 que forneça algum outro recurso textual livre do limitador de Compêndio.
