# Ciclo de Vida de Hooks de Documentos

## Contexto e Problema
Os "Document Hooks", como `_onCreate`, `_onUpdate` e `_onDelete`, são mecanismos essenciais do ciclo de vida que o Foundry VTT disponibiliza nativamente em todas as instâncias que herdam de classes como `ActiveEffect`, `Item`, ou `Actor`. 
O erro mais frequente na estruturação global desses ganchos é a suposição de que a base de dados (`data`) do documento completo é repassada para cada um deles de maneira idêntica. Tentar acessar essas assinaturas de modo inconsistente gera `ReferenceError`.

## Regras de Assinatura

### 1. `_onCreate(data, options, userId)`
- **Momento:** Disparado apenas uma vez quando o Documento é criado e entra no banco de dados.
- **Parâmetros:**
  - `data`: Objeto contendo os dados **iniciais** completos de configuração.
  - `options`: O objeto de opções que orquestrou a ação (ex: `{ renderSheet: true }`).
  - `userId`: String do ID do usuário que desencadeou a criação.

### 2. `_onUpdate(changed, options, userId)`
- **Momento:** Disparado a cada vez que o Documento ou parte do banco de dados dele sofre qualquer mutação.
- **ALERTA ARQUITETURAL:** **A propriedade `data` NÃO EXISTE na assinatura deste hook**. Ele repassa `changed` no primeiro argumento. Tentar referenciar `data` aqui dentro casará crasheios nos updates do servidor em múltiplos clientes.
- **Parâmetros:**
  - `changed`: Objeto com as propriedades ("diff") de fato **alteradas** (ex: se só mudamos o disabled, vem apenas `{ disabled: true }`).
  - `options`: Opções configuradas (ex: `options.animate = false`).
  - `userId`: O autor desencadeador da atualização do banco.

### 3. `_onDelete(options, userId)`
- **Momento:** Disparado quando o Documento é extinguido e varrido do banco.
- **ALERTA:** Também não emite dados da entidade (que agora já deixou tecnicamente de existir no servidor). Passa diretamente os dois últimos argumentos, e todos confiam no escopo temporal do escopo de memória do Javascript, logo as propriedades antes ativas dele você consegue capturar por `this`.

## Conclusão e Diretriz Ouro
- Nunca confie apenas na replicação cega de parâmetros nos ganchos. 
- Para os casos como `_onUpdate` ou `_onDelete` onde a base nativa já existe ou sumiu de vez do backend, recupere informações de contexto da entidade através do próprio objeto instanciado (`this.parent`, `this.name`, `this.system`, etc), e não via parâmetros de callback que contêm apenas "Deltas/Diffs" e opções.
