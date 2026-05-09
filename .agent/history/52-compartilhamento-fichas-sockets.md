# Implementação de Compartilhamento de Fichas (Sockets)

## O que foi feito
Criada a funcionalidade de "Mostrar para jogadores" e "Mostrar para..." no cabeçalho das Fichas de Personagem (Actors).
A implementação utiliza os recursos nativos do Foundry de WebSockets para clientes (`game.socket`), permitindo que a ficha de um personagem seja forçada a ser exibida na tela de outros usuários conectados que tenham a permissão de ver o documento.

## Arquivos alterados
- `module/base/sheet/actor/BaseActorSheet.mjs`: Centralização da declaração das `actions` visuais de compartilhar (`showPlayers`, `showTo`) dentro do campo `SHEET_CONFIG`.
- `module/api/versions-overrides/v2.mjs`: Aprimoramento do hook de montagem V2 (`_initializeApplicationOptions`) para que seja capaz de buscar as actions ao longo de toda a cadeia de protótipos da classe filha que foi herdada.
- `module/core/socket/socket-handler.mjs`: Criação da classe `SocketHandler` com listener dinâmico para lidar com todas as requisições atreladas ao namespace `system.setor0OSubmundo`.
- `module/core/socket/socket-utils.mjs`: Criação de uma utility exclusiva com responsabilidade de fazer o parseamento dos WebSockets recebidos, impedindo conflitos lógicos nas UI globais.
- `module/creators/dialog/share-document-dialog.mjs`: Separação do Dialog em sua classe própria. Delegação do disparo e da notificação dentro dele mesmo via importações dinâmicas para evitar ciclo de dependência (`import()`). 
- `templates/dialog/share-document.hbs`: Extrato das estruturas puras de HTML para o formato limpo de Handlebars.
- `system.json`: Inclusão da propriedade `"socket": true` para autorizar formalmente o envio e recebimento em rede pelo Node do FoundryVTT.

## Decisões técnicas relevantes
- **Compatibilidade V13 (`window.controls`) e Herança Prototype**: Adotada a mesclagem de configurações por árvore de herança. A leitura das propriedades `SHEET_CONFIG` não restringe-se apenas ao nível base do Foundry ou apenas à folha do NPC, mas sobe iterando do filho para o pai usando `Object.getPrototypeOf`.
- **Dynamic Imports**: Adotado para quebrar Referências Circulares (quando o módulo de UI acessa o Socket, e o Socket acessa a UI) nas resoluções da ECMAScript, garantindo que o módulo seja chamado no evento estrito do clique (OnDemand).
- **Tradução com `gameLocalize`**: Utilizado para extrair termos de acesso globais da engine (como DONO, OBSERVADOR), reaproveitando a localização padrão sem engessá-los.

## Testes sugeridos
- Acessar com Mestre e testar `Mostrar para jogadores` (deve mostrar pra todos os outros clientes instantaneamente através do console de socket).
- Acessar com Mestre, testar `Mostrar para...`, e abrir o Modal que exibirá os graus de relacionamento entre o Doc e os Players (`OWNER`, `OBSERVER`).
- Acessar como Jogador e abrir a ficha que possui acesso, verificando se o botão `Mostrar para...` continua acessível e visível.
