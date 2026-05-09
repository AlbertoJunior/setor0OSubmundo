# Padrão Arquitetural: System Sockets e Window Controls no Foundry V13

## Problema
O compartilhamento de documentos ou a manipulação de janelas entre usuários ("Mostrar para jogadores") exige a injeção de botões no Header do Sheet e o envio de requisições web sockets na rede do Foundry. Em versões antigas (V12 e menores), a injeção de UI acontecia no método `_getHeaderButtons()`. Já na V13 (ApplicationV2), isso é regido pela configuração estática de `DEFAULT_OPTIONS.window.controls`. Adicionalmente, o sistema precisa de um padrão para interagir com `game.socket` sem criar Dependências Circulares entre os Handlers e a UI.

## Solução e Padrão

### 1. Liberação no Manifesto
O Foundry VTT descarta por padrão eventos de Socket emitidos para o namespace `system.id` a não ser que haja uma sinalização explícita de suporte por parte do sistema. Por isso, a propriedade **`"socket": true`** deve estar definida obrigatoriamente no arquivo principal `system.json`.

### 2. Injeção de Controles de Janela Dinâmicos na Facade V2
Ao invés de poluir o `DEFAULT_OPTIONS` de forma estática com controles sensíveis (que quebram no caso de instâncias criadas antes do load do jogo), os botões são injetados de forma reativa durante a criação da Application Options (`_initializeApplicationOptions`). A classe Facade `v2.mjs` itera sobre a propriedade `SHEET_CONFIG` da cadeia de construtores de toda a hierarquia, recuperando o parâmetro `actions`.

Isso garante que se um botão for definido no `Setor0BaseActorSheet` e a ficha do jogador `Setor0ActorSheet` reescrever `SHEET_CONFIG` ocultando-o via `shadowing`, o Facade V2 recuperará ambos mesclando a hierarquia estática da filha para o pai usando o `Object.getPrototypeOf`.

### 3. Evitando Circular Dependency (ESM)
Quando o Arquivo de Dialog (ex: `ShareDocumentDialog`) e o arquivo de Socket (ex: `SocketHandler`) precisam evocar uns aos outros, as importações estáticas no ESM lançam erros fatais de inicialização (`ReferenceError: Cannot access ... before initialization`).
Para prevenir isso:
- Na UI do Dialog, evite usar parâmetros com injeção de funções (callback). Em vez disso, **mantenha a lógica de emissão atrelada ao evento do botão (onClick) utilizando o Dynamic Import** (`const { SocketHandler } = await import(...)`).
- A resolução de classes referenciadas de forma cruzada (ex: `static #actions`) nos Sockets também pode ser envelopada de forma "Lazy" dentro do método chamador `_onMessage` se necessário.

### 4. Componentização e Internacionalização
Qualquer estrutura de HTML com lógica de interação no Header deve preferir estar mapeada em `.hbs` renderizado via `FoundryApi.renderTemplate`.
A formatação de textos originais do Foundry (Ex: 'Observador', 'Limitado', 'Dono') pode ser consumida dinamicamente usando a função utilitária `gameLocalize(Chave_oficial_Foundry)` e injetada no Template de renderização, sem repassar chaves e prefixos personalizados do sistema para palavras nativas.
