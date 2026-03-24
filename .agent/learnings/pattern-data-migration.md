# Padrão de Arquitetura para Migrações de Dados ⚠️

> [!WARNING] IMPORTANTE
> O método documentado aqui foi a primeira iteração adotada para contornar problemas de limpeza agressiva de Schemas (`Schema Validation`) implementados no Foundry V13. Ele atende de forma limpa e organizada o escopo atual do projeto, porém **não é considerado o estado-da-arte definitivo livre de falhas**. Em migrações futuras, sempre que possível, pesquise arquiteturas de migração utilizadas em sistemas consolidados (como DnD5e ou Pathfinder 2e) para verificar se existem fluxos de interceptação e refatoração de DB melhores e mais performáticos do que a injeção em duas vias adotada aqui.

## O Problema do Foundry V13 (Schema Validation)
Ao criar novos `DataModels` ou alterar a Nomenclatura das Chaves Oficiais de Dados (ex: mudar o nome da variável de `change` para `changes`), o Foundry V13, ao instanciar as entidades para o jogo iniciar, **descarta sumariamente qualquer propriedade não existente no Schema**.
Isso inviabiliza scripts convencionais em Hooks como o `ready` de migrarem os mundos antigos, pois quando o Hook rodar o script para tentar ler `.change`, essa variável já terá sido destruída na memória ram.

## Solução Adotada (O Fluxo de Duas Vias Modificado - Database-First)

A migração oficial de mundos passados divide a responsabilidade em duas fases: a *"Acomodação em Memória"* e a *"Persistência Física"*, operando estritamente através do mapeamento **Database-First** para contornar o loop infinito gerado por atualizações de delta "Vazio".

### Via 1: Acomodação em Memória (O Sensor DataModel)
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

Neste estágio, a lógica **NÃO DEVE** limpar ou converter o dado para o novo modelo! Se o fizer, o Foundry assumirá que a ficha do banco que vai pro `.update()` na Via 2 já é idêntica à ficha em memória, cancelando a promessa do banco por "ausência de diferenças" (Empty Diff) causando um loop de migração infinita.
Ao invés disso, o DataModel atua puramente como um **Sensor**: Ele recebe o Clone original, checa a existência da formatação suja, e se ela existir ele altera um sinalizador estático (Getter) chamado `_needsForceRun`, retornando o objeto original inalterado.

### Por que `_needsForceRun`? (O Catch de Importações de Tela)
O `MigrationHandler` tradicionalmente só inicia migrações cujas versões ultrapassem o `lastMigratedVersion` gravado em `game.settings`. Se o mestre importar um Ator ou Compêndio desatualizado da internet meses após o mundo já ter migrado, essa ficha antiga passaria despercebida e nunca mais seria corrigida. O `_needsForceRun` que acabamos de sinalizar na Via 1 funciona como um "Bypass", dizendo ao `MigrationHandler` no próximo Loading para re-rodar pontualmente aquela classe de migração e limpar as fichas intrusas.

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

Este Script é avaliado pelo `MigrationHandler`. Se a versão for inferior ou se a flag instância em memória local `needsForceRun` for verdadeira, ele inicia o script assíncrono referenciado em `migrate`:

1. Checa a raiz usando a função `needsMigration(document._source)`, que varrerá os dados velhos, os quais **garantidamente estarão intocados** pela Via 1.
2. Se sim, significa que a entidade precisa ser atualizada fisicamente.
3. Como os dados estão puros de banco, a **PRÓPRIA FUNÇÃO `migrate()` constrói um `deepClone` do `_source` e efetua a varredura alteradora ativamente no payload.**
4. Passamos este payload sujo modificado em memória profunda direto para um update: `await item.update(itemDataSourceModificado)`.
5. O Foundry tomará um susto perante a diferença gritante entre o banco físico e o payload, e gravará permanentemente a alteração para todos, finalizando a cadeia.

## ⚠️ Exceção Crítica: Propriedades Eliminadas pelo Schema

> [!CAUTION]
> O padrão "Sensor Puro" da Via 1 **NÃO funciona** quando a propriedade sendo migrada **não existe no schema atual** do DataModel.
>
> Exemplo: migrar `effect.change` (Object) → `effect.changes` (Array). O `StandardEffectField` define `changes` mas **não** `change`. Resultado: a Schema Validation do V13 **destrói** `change` de `_source` antes da Via 2 poder lê-la, gerando um loop infinito de re-migração.

### Solução: Via 1 Transformadora
Quando a propriedade antiga não sobrevive ao Schema Validation:
1. **Via 1 (`migrateDataModel`)** deve **transformar** os dados (não apenas sinalizar)
2. **Via 2 (`migrate`)** deve forçar `.update()` usando **deleção explícita** (ver abaixo)
3. A Via 2 não busca mais pela propriedade antiga — ela envia os dados em memória como payload direto

```javascript
// PADRÃO: Via 1 Transformadora (para propriedades eliminadas pelo schema)
migrateDataModel: function (source) {
  const effects = getObject(source, EFFECTS_PATH);
  if (Array.isArray(effects)) {
    for (const effect of effects) {
      if (effect.oldProp && !Array.isArray(effect.oldProp)) {
        effect.newProp = [effect.oldProp]; // transforma AQUI
        delete effect.oldProp;
        _needsForceRun = true;
      }
    }
  }
  return source;
}
```

### ⚠️ Merge Recursivo e Deleção Explícita (`-=key`)

> [!CAUTION]
> O `Document.update()` do Foundry faz **merge recursivo** por padrão. Isso significa que ao enviar um objeto/array sem determinada propriedade, o Foundry **NÃO remove** a propriedade ausente do banco — ele apenas adiciona/atualiza as presentes. Propriedades velhas sobrevivem indefinidamente ao merge, causando loop de re-migração.

**Regra obrigatória para Via 2 de migrações que renomeiam/removem chaves:**
Usar caminhos **dot-notated flat** com a sintaxe de deleção do Foundry `"-=chave": null` para cada índice do array.

```javascript
// PADRÃO: Via 2 com deleção explícita (OBRIGATÓRIO para remoção de chaves)
function getEffectsUpdateData(item) {
  const effects = getObject(item, EFFECTS_ENUM);
  const payload = {};
  effects.forEach((effect, index) => {
    // SET: grava a nova propriedade
    payload[`${EFFECTS_ENUM.system}.${index}.newProp`] = effect.newProp;
    // DELETE: remove explicitamente a propriedade antiga do banco
    payload[`${EFFECTS_ENUM.system}.${index}.-=oldProp`] = null;
  });
  return payload;
}
```

> [!IMPORTANT]
> **Nunca** envie o array inteiro (`"system.effects": [...]`) esperando que propriedades ausentes sejam removidas. Isso **não funciona** — o merge recursivo preserva propriedades do banco.

### Quando usar cada padrão?
| Cenário | Via 1 | Via 2 |
| :--- | :--- | :--- |
| Propriedade antiga **existe** no schema (ex: renomear valor dentro de um ObjectField) | Sensor Puro (só sinaliza) | Transforma e persiste |
| Propriedade antiga **não existe** no schema (ex: `change` → `changes`) | **Transformadora** (converte dados) | Deleção explícita via `-=key` (dot-notated) |

## Onde os Padrões Residem
- Classes estáticas (congeladas) das regras: `module/migration/migrations/[seu-script].mjs`
- Exportação das classes: `module/migration/migrations/index.mjs`
- Loop condicional do Foundry `MigrationHandler` (acionado internamente no hook): `module/migration/migration-handler.mjs`


