# 41 - Migração IDs de Rigidez (Hardness)

## 📌 O que foi feito
Ajustada a lógica de migração do sistema para suportar a conversão dos IDs antigos inerentes ao aprimoramento "Rigidez" (dos IDs nas faixas 50 a 56 para a nova faixa de 400 em diante). Foi solucionada uma ocorrência de *shadowing* (variáveis bloqueadas no escopo devido a redundância de nomes) e construída a persistência física completa no banco de dados via `migrateHardnessIds()`, seguindo a arquitetura em duas vias (Memória DataModel + DB Sync) definida para o Foundry V13.

## 📁 Arquivos alterados
- `module/migration/migrations/migrate-hardness-ids.mjs`: Centralização da correção. Refatoração do `migrateDataModel()` adicionando verificações estritas baseadas no mapeador para não limpar ou sobrescrever IDs novos com nulls. Implementação completa do `migrate()` usando métodos `migrateWorldActors()` e `migrateCompendiums()` gerando DiffLogs organizados via Terminal em ambas as fases (Via 1 em memória e Via 2 Update FileSystem).

## 🧠 Decisões técnicas relevantes
- **Verificação via Mapper Estrito:** A varredura de níveis tanto na ramificação de DataModel quanto na varredura física avalia rigorosamente a existência de chaves mapeáveis (50 a 56). 
- **Database-First Approach (Bypass do Schema Validation):** Diante do fato de que o Foundry V13 mascara a representação na Via 1 instanciando um novo Documento Perfeito, o pipeline de diffing de banco entrava em loop infinito caso tentássemos pareá-los via `actor.toObject()` (que enviava dados limpos contra o banco sujo, resultando no bloqueio da persistência por "ausência de diff formal"). Toda a conversão migrou para a fase do banco de dados (Via 2), forjando ativamente o payload utilizando `deepClone` sobre o malfadado `_source` originado do banco de dados sujo e injetando a correção de chaves via Mapeador, forçando um Diff genuíno para gravar o item. 
- **Re-Migração por Importação Temporária (`needsForceRun`):** Como o orquestrador `MigrationHandler` é engatilhado prioritariamente por checagem de sistema (`lastMigratedVersion`), fichas velhas avulsas importadas por mestres podiam furar o sistema se o Mundo já estivesse migrado. Para tapar a falha, o `migrateDataModel` da Via 1 foi mantido atuando como um *Sensor Em Memória*. Caso ele identifique sujeiras na inicialização (sem corrigi-las para não quebrar o diff), ele engatilha o getter estático `_needsForceRun = true`, forçando o Handler Base a bypassar as checagens e mandar o Sync Sync rodar novamente no Background. 

## 🧪 Testes sugeridos
- **Teste de Duplicação e Persistência:** Acessar o Foundry utilizando um Actor do banco de dados desatualizado e inicializado com os níveis antigos. O primeiro `logDiffMigration` originado da classe deverá ser injetado. Após atualizar via DB Sync, recarregar a sessão ou re-excecutar explicitamente o Script comprovará a inoperância assertiva mediante a constatação de IDs superiores a 400, sem que o `null` ocorra.
- **Checagem Indivídual Sem Mapeamento:** Adicionar IDs inválidos de forma raw e checar se o migrador fará vista grossa ou os substituirá. O esperado é que o migrador trate qualquer número ou ID diferido desse range (50~56) como escopo irrelevante saltando do fluxo impeditivo.

## 📚 Gestão do Conhecimento
- **Status:** Sem novos aprendizados gerados ou registrados. A arquitetura utilizada (duas vias DataModel/Ready) operou consoante ao escopo previamente fixado no `.agent/learnings/pattern-data-migration.md`.
