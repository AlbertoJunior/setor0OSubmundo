# Correção do Bug de Traços e Incremento do Seletor de Habilidades

**Data:** 06/03/2026

## O que foi feito
- Correção do bug onde o `document.system` de Traços inicializava vazio no Foundry, impedindo a edição de Tipo, XP, Requisito e Morfologia.
- Implementação dinâmica de um seletor de habilidades no momento de adicionar novos Efeitos a um Traço.

## Arquivos alterados
- `module/data/trait-data-model.mjs`: Substituição da atribuição destrutiva do `CONFIG.Item.dataModels` pelo uso do `Object.assign()`. 
- `module/data/equipment-data-model.mjs`: Replicação da mesma correção protetiva com `Object.assign()`.
- `module/data/actor-data-model.mjs`: Replicação da mesma correção protetiva com `Object.assign()`.
- `templates/traits/trait-effect-dialog.hbs`: Adicionado container condicional contendo o novo sub-seletor de Habilidades (`skillKey`).
- `module/base/sheet/trait/methods/trait-effects-methods.mjs`: Incremento no `presetForm` para buscar a lista de opções do `AbilityRepository`. Escuta em tempo real do evento `change` que processa a ocultação do segundo seletor de habilidade baseado na constante `CharacteristicType.BONUS.SKILL`. Acoplamento de sufixos na formatação assíncrona da key enviada no submit.

## Decisões técnicas relevantes
- **Data Models Seguros**: O uso assertivo do `Object.assign(..., {...})` blinda a arquitetura do projeto de anomalias com carregamento assíncrono. Como o Foundry importa em fluxos não garantidos, não se deve resetar os construtores em `dataModels`.
- **Vanilla Dialog Render**: Para exibir o segundo dropdown apenas no contexto apropriado, a injeção reativa ao evento form/select garante que o usuário apenas veja as listagens de atributos/skils quando realmente eleger o Tipo de "Bônus" como a raiz pertinente. E a conversão em tempo de submissão `effectKey = effectKey + skillKey` gera uma string compreensível pelo parser do v13 Active Effects.

## Testes sugeridos
- Registrar um novo `Traço` na interface do Foundry, confirmando que agora é viável editar todos os campos nativos (Custo, Morfologia, Tipo, Requisito).
- Selecionar a aba de `Efeitos`, clicar em `+`, selecionar "Bônus Habilidades", visualizar o segundo seletor listando Briga, Hacking etc, e efetuar a criação. Verificar se a tag descritiva gerada lista de fato o alvo em conjunto com o modificador numérico.
