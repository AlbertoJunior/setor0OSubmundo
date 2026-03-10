# 38 - Refatoração de Fetch Repository com Lazy Load

## O que foi feito
- Refatoração do `repositoryMap` presente em `fetchRepository.mjs` para encapsular a obtenção das listas de repositórios em Arrow Functions (Closures).
- Atualização da avaliação de retorno no `fetchRepository` para executar a Closure em tempo de renderização pelo Handlebars.

## Arquivos alterados
- `module/helpers/fetchRepository.mjs`

## Decisões técnicas relevantes
- **Bug Original:** Jogadores (clientes conectados ao host) relataram que algumas listas e renderizações da ficha apresentavam chaves originais não traduzidas no cabeçalho (ex: `S0.Virtudes.Virtude`). O mestre (host local) não presenciou esse bug.
- **Investigação:** Durante a inicialização `init` do Foundry VTT, o Helper `fetchRepository` chamava estaticamente `MorphologyRepository.getItems()` para popular um map interno. Ocorre que os jogadores baixam as linguagens (`.json`) assincronamente em paralelo ao carregamento dos scripts; deste modo, essa execução gerava *race-conditions* em que a UI já avaliava os `game.i18n.localize` antes dos dicionários terminarem de baixar. No host (Mestre) isso é imperceptível porque ele já possui acesso local e imediato aos recursos no momento do parse.
- **Solução:** O uso do padrão de design **Lazy Load (Avaliação Tardia)**. Passando `() => Repository.getItems()` convertemos as consultas para referências soltas, forçando o script a invocar o motor interno (e por consequência o `localize`) apenas quando o template Handlebars está de fato sendo montado no canvas do usuário—o que só ocorre muito após as traduções estarem prontas no hook `ready`.

## Testes sugeridos
- Acessar o Foundry de preferência via emulador de conexão ou segunda janela como Jogador convidado (para forçar o download dos dicionários em concorrência).
- Abrir a Ficha de Ator de um Personagem e validar os botões de Morfologia, Virtudes e Traços. Os textos devem aparecer 100% traduzidos, validando o retardo da execução.
