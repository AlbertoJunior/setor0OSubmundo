# Implementação de Troca de Itens entre Personagens

## O que foi feito
Foi implementada uma funcionalidade que permite aos usuários transferir itens (equipamentos) diretamente entre os inventários (mochila) de dois personagens diferentes através do arrastar e soltar (drag and drop). 

Na primeira fase, tentou-se implementar via eventos HTML5 Drop convencionais na estrutura, mas a lib nativa do projeto (`SortableJS`) continha bloqueios de contenção visual e de estado (`group`), os quais neutralizavam a ação. 

Na refatoração final, optou-se por utilizar o 100% o gatilho nativo do próprio `SortableJS` configurando a propriedade `put` para habilitar a transferência cross-actor (`bag -> bag`). Junto disso, foi estabelecida e instanciada uma nova estrutura isolada de Mensagem automatizada de transferência utilizando o protocolo de `MessageCreator` do projeto e enviando pelo `ChatCreator`. 

## Arquivos alterados
### Lógica de UI e Data Manipulation
- `module/base/updater/actor-updater.mjs`
  - Adicionado retorno (`return`) aos métodos `addDocuments` e `removeDocuments` para viabilizar resgar o `uuid` dos novos Embedded Documents criados.
- `module/base/sheet/actor/player/methods/dragabble-methods.mjs`
  - Criada uma function de avaliação na propriedade `put` do Sortable, limitando o soltar para que permita cruzamentos inter-character apenas de `bag` para `bag`.
  - Delegação de toda regra cross-actor (remover de `sourceActor` e adicionar em `targetActor`) no event listener assíncrono `onEnd` do Sortable.
  - Limpeza do método duplicado `#onDropOnBag` (reduzindo-o ao status original de apenas aceitar itens de fora da aplicação, ex. Compendiums).

### Arquitetura de Conversação (Mensagens)
- **NOVO:** `module/creators/message/transfer-equipment-message.mjs`
  - Instanciada a classe e o método base criador do chat invocando `FoundryApi.renderTemplate`.
- **NOVO:** `templates/messages/equipments/transfer-equipment.hbs`
  - Isolação do pacote de visualização em HTML/Handlebars (`S0-message-content`) utilizando as localizações originais e injetando o novo Botão de Link ao item transferido via dataset `open-sheet` com UUID atrelado.

## Testes sugeridos
1. **Transferência de Item Bem-Sucedida**: Arraste qualquer item do inventário do `Actor 1` até o inventário do `Actor 2`.
2. **Transferir na mesma Mochila**: Arraste qualquer item dentro do inventário do *mesmo personagem*, garantindo que a ordem se mantenha alterada e que nenhuma duplicação nem mensagem no chat seja acionada incorretamente.
3. **Validar Mensagem de Chat**: Clique no botão gerado no chat para confirmar que a ficha correta do Item (a que agora existe no novo "Dono") é exibida.
4. **Validar Interface Limitadora SortableJS**: Tente arrastar de `equipped` do Actor 1 para o `bag` do Actor 2 - observe que o sistema irá imediatamente bloquear e ignorar a interação para prevenir corrupção mágica.
