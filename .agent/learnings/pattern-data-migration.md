# Padrão de Arquitetura para Migrações de Dados ⚠️

> [!WARNING] IMPORTANTE
> O método documentado aqui foi a primeira iteração adotada para contornar problemas de limpeza agressiva de Schemas (`Schema Validation`) implementados no Foundry V13. Ele atende de forma limpa e organizada o escopo atual do projeto, porém **não é considerado o estado-da-arte definitivo livre de falhas**. Em migrações futuras, sempre que possível, pesquise arquiteturas de migração utilizadas em sistemas consolidados (como DnD5e ou Pathfinder 2e) para verificar se existem fluxos de interceptação e refatoração de DB melhores e mais performáticos do que a injeção em duas vias adotada aqui.

## O Problema do Foundry V13 (Schema Validation)
Ao criar novos `DataModels` ou alterar a Nomenclatura das Chaves Oficiais de Dados (ex: mudar o nome da variável de `change` para `changes`), o Foundry V13, ao instanciar as entidades para o jogo iniciar, **descarta sumariamente qualquer propriedade não existente no Schema**.
Isso inviabiliza scripts convencionais em Hooks como o `ready` de migrarem os mundos antigos, pois quando o Hook rodar o script para tentar ler `.change`, essa variável já terá sido destruída na memória ram.

## Solução Adotada (O Fluxo de Duas Vias)

A migração oficial de mundos passados divide a responsabilidade em duas fases: a "Acomodação em Memória" e a "Persistência Física".

### Via 1: Acomodação em Memória (O "Porteiro" DataModel)
No próprio arquivo `DataModel` do Item respectivo (ex: `equipment-data-model.mjs`), declaramos uma interceptação via classe mãe `static migrateData(source)`:
Esta função é executada para **cada ficha** sendo lida no HD do host *antes* do Schema ser criado.

```javascript
/* >>> module/data/equipment-data-model.mjs <<< */
class SubstanceDataModel extends BaseEquipmentDataModel {
  static migrateData(source) {
    super.migrateData(source);
    // Aqui injetamos a regra de migração originada de um script encapsulado
    ActiveEffectsMigration.migrateDataModel(source); 
    return source;
  }
}
```

Neste estágio, a lógica pega o valor de `.change`, injeta ele pro array de `.changes` recém lançado e destrói o velho. Quando o DataModel finalmente constrói o Personagem, o Foundry lê a nova ficha perfeitamente validada.
O jogador poderia perfeitamente jogar uma sessão inteira, contudo, o banco de dados original (no Servidor) continua com a chave `.change` gravada e toda vez que abrissem o mundo essa mesma varredura seria forçada a ocorrer de novo.

### Via 2: A Persistência Física (Background Sync em Ready)
Para oficializar e substituir as velharias do banco de dados (salvando recursos da CPU). Criou-se um construtor de Scripts Dinâmicos chamado **`MigrationHandler`** que roda apenas pelo GM na fase de **`ready`**.

```javascript
/* >>> module/migration/migrations/migrate-active-effects.mjs <<< */
export const ActiveEffectsMigration = Object.freeze({
  version: '0.0.3', // Limite da versão que necessita este upgrade
  description: "Migração para Active Effects",
  migrate: migrateActiveEffects, // O script que fará a varredura .update() nos itens na fase Ready
  migrateDataModel: function(source) { ... } // O "Porteiro" da Via 1
});
```

Este Script olha a versão do Schema do mundo do Jogador (`game.settings.get`). Se a versão for **inferior** à da Migração a ser executada (ex: `0.0.3`), ele inicia o script assíncrono referenciado em `migrate`, varrendo todos os itens registrados e acionando o seguinte fluxo:

1. Checa a raiz original para ver se a chave velha obsoleta existia ( `item._source` tem `.change`? )
2. Se sim, significa que o Item precisa ser atualizado fisicamente.
3. Como `item.toObject()` já traz a versão modernizada em memória processada pelo Porteiro (Via 1), passamos ele direto para um update: `await item.update(item.toObject())`.
4. Todos os mundos são limpos. Ele avança a flag para a versão mais recente e os Scripts nunca mais rodam naquele Mundo.  

## Onde os Padrões Residem
- Classes estáticas (congeladas) das regras: `module/migration/migrations/[seu-script].mjs`
- Exportação das classes: `module/migration/migrations/index.mjs`
- Loop condicional do Foundry `MigrationHandler` (acionado internamente no hook): `module/migration/migration-handler.mjs`
