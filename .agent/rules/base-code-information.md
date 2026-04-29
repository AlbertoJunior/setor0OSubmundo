---
trigger: always_on
---

# Base code information

## Sempre que for pedido para implementar ou corrigir algo voce deve:
- **Primeiro:** Consultar .agent/learnings/_index.md para ver se possui alguma informação relevante.
- **Segundo:** Verificar no projeto se já tem algo próximo do que foi pedido para tomar como base.
- **Terceiro:** Consultar o índice da versão mais recente em uso, como por exemplo .agent/docs/v13/_index.md e a documentação correspondente.
- **Quarto:** Explore soluções modernas fora das bases locais, consultando obrigatoriamente a [Foundry VTT Wiki (Resources)](https://foundryvtt.wiki/en/development/guides) e outras fontes web.
  1. **Filtro de Validação:** Considere estritamente conteúdos validados e compatíveis com a arquitetura atual (v12+). Ignore guias obsoletos ou padrões depreciados (ex: actor.data).
  2. **Análise Comparativa:** Compare a solução externa com o conhecimento interno (.agent/learnings) baseando-se em performance, manutenção e legibilidade.
  3. **Julgamento de Valor:** Se a solução externa for superior, sugira a alteração do código e a atualização da base de aprendizado. Se for inferior ou equivalente, justifique por que manteremos o padrão atual do projeto.
  4. **Migração Estratégica:** Caso a melhor solução pertença a uma versão superior (v13, v14, etc.):
    - Sugira formalmente a atualização do projeto.
    - Elabore um Plano de Migração detalhado (Breaking Changes, novas APIs e impactos).
    - Garanta que a solução seja superior e compatível com a documentação da versão alvo.

## PONTO DE DECISÃO (Conforme System Rules - Execução)
- **PARE E APRESENTE:** Após concluir os passos de 1 a 4, você deve apresentar o resultado da sua análise e o plano de implementação (ou migração) ao usuário. 
- **AUTORIZAÇÃO:** Não inicie o Passo 5 ou qualquer alteração de arquivo sem o "de acordo" explícito do usuário.

## Execução Técnica
- **Quinto:** A feature ou fix desenvolvida, deve atender à estrutura do projeto e também a documentação mais recente do Foundry VTT.
- **Sexto:** Ao concluir a tarefa, execute o fechamento documental:
  1. Log de Alterações: Crie um arquivo em .agent/history/ seguindo o padrão [numeracao]-nome-da-task.md. O conteúdo deve resumir: O que foi feito, Arquivos alterados, Decisões técnicas relevantes e Testes sugeridos.
  2. Manutenção de Índices: Atualize o arquivo .agent/history/_index.md adicionando a nova entrada no topo da lista (ordem cronológica inversa).
  3. Ponte de Aprendizado: Avalie se o que foi feito gerou um novo padrão ou resolveu um erro que pode se repetir. Se sim, acione a seção 'Aprendizagem e Gestão do Conhecimento' de System Rules para registrar esse conhecimento em .agent/learnings/.
  4. Status de Migração: Se a tarefa envolveu um plano de migração (conforme o quarto passo), anote no histórico o status atual dessa transição (ex: "Migração v12 -> v13 em andamento: 40% concluída").

## Requisitos
- Todo código deve ser explicado.
- Todo código deve atender ao clean code.
- Se a pergunta for sobre código, priorize a performance.

## Proibições
- Não é permitido inserir novos bugs ou métodos mágicos.
- Não pode remover arquivos sem perguntar.