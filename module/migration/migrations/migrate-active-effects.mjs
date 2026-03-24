import { SYSTEM_HOOKS, SYSTEM_ID, REGISTERED_MIGRATIONS } from "../../constants.mjs";
import { EquipmentCharacteristicType } from "../../enums/equipment-enums.mjs";
import { getObject, logDiffMigration } from "../../utils/utils.mjs";

// MIGRATION VERSION 0.0.3
let _needsForceRun = false;

export const ActiveEffectsMigration = Object.freeze({
  version: '0.0.3',
  description: "Migração para Active Effects ('Change' to 'Changes')",
  get needsForceRun() { return _needsForceRun; },
  migrate: migrateActiveEffects,

  /**
   * Via 1 — Interceptação no DataModel (pré-Schema Validation).
   *
   * Diferente do padrão "sensor puro" documentado em pattern-data-migration.md,
   * esta migração PRECISA transformar os dados aqui, porque a propriedade `change`
   * não existe no schema (StandardEffectField só define `changes`).
   * Se não transformarmos agora, o Schema Validation do V13 destruirá `change`
   * antes da Via 2 poder lê-la, causando um loop infinito de re-migração.
   *
   * O Foundry detectará a diferença entre o banco (change) e a memória (changes)
   * e a Via 2 forçará a persistência no banco.
   *
   * @param {object} source - Dados crus do banco, sem prefixo `system`.
   * @returns {object} source transformado.
   */
  migrateDataModel: function (source) {
    const effects = getObject(source, EquipmentCharacteristicType.SUBSTANCE.EFFECTS.id);
    if (Array.isArray(effects)) {
      for (const effect of effects) {
        if (effect.change && !Array.isArray(effect.change)) {
          // Transforma change (Object) → changes (Array)
          effect.changes = [effect.change];
          delete effect.change;
          _needsForceRun = true;
        }
      }
    }
    return source;
  }
});

Hooks.once(SYSTEM_HOOKS.GM_REGISTER_MIGRATIONS, () => {
  REGISTERED_MIGRATIONS.add(ActiveEffectsMigration);
});

/**
 * Via 2 — Persistência Física (hook `ready`, apenas GM).
 *
 * Como a Via 1 já transformou os dados em memória, a Via 2 agora apenas
 * força `.update()` nos itens que possuem effects. O Foundry comparará
 * a memória (transformada) com o banco (formato antigo) e só gravará
 * aqueles com diferença real (non-empty diff).
 */
async function migrateActiveEffects() {
  const diffLog = { diffs: [] };

  await migrateWorldItems(diffLog);
  await migrateWorldActors(diffLog);
  await migrateCompendiums(diffLog);

  if (diffLog.diffs.length > 0) {
    logDiffMigration(ActiveEffectsMigration, diffLog);
  }
}

/** @type {object} Referência curta ao enum de effects para evitar repetição. */
const EFFECTS_ENUM = EquipmentCharacteristicType.SUBSTANCE.EFFECTS;

/**
 * Verifica se o item possui effects que podem ter sido migrados na Via 1.
 *
 * @param {object} item - O documento Item do Foundry (instância em memória).
 * @returns {boolean} true se o item possui effects para persistir.
 */
function hasEffects(item) {
  const effects = getObject(item, EFFECTS_ENUM);
  return Array.isArray(effects) && effects.length > 0;
}

/**
 * Monta o payload de update com caminhos dot-notated por efeito.
 * Usa a sintaxe `-=` do Foundry para deletar explicitamente a propriedade `change`
 * de cada efeito no banco. O merge recursivo padrão do Foundry não remove
 * propriedades ausentes, por isso a deleção explícita é obrigatória.
 *
 * @param {object} item - Documento Item do Foundry.
 * @returns {object} Payload flat com set de `changes` e delete de `change` por índice.
 */
function getEffectsUpdateData(item) {
  const effects = getObject(item, EFFECTS_ENUM);
  const payload = {};
  effects.forEach((effect, index) => {
    payload[`${EFFECTS_ENUM.system}.${index}.changes`] = effect.changes;
    payload[`${EFFECTS_ENUM.system}.${index}.-=change`] = null;
  });
  return payload;
}

/**
 * Monta o payload de update para um Embedded Item dentro de um Actor.
 * Inclui `_id` obrigatório para `updateEmbeddedDocuments` e usa a mesma
 * estratégia de deleção explícita via `-=`.
 *
 * @param {object} item - Documento Item embarcado do Foundry.
 * @returns {object} Payload flat com _id, set de `changes` e delete de `change` por índice.
 */
function getEmbeddedEffectsUpdateData(item) {
  const payload = getEffectsUpdateData(item);
  payload._id = item.id;
  return payload;
}

async function migrateWorldItems(diffLog) {
  for (const item of game.items) {
    try {
      if (hasEffects(item)) {
        await item.update(getEffectsUpdateData(item));
        logMigration(diffLog, item.name, "WorldItem");
      }
    } catch (e) {
      console.error(`Erro migrando Item do Mundo: ${item.name}`, e);
    }
  }
}

async function migrateWorldActors(diffLog) {
  for (const actor of game.actors) {
    try {
      const itemsToUpdate = [];
      for (const item of actor.items) {
        if (hasEffects(item)) {
          itemsToUpdate.push(getEmbeddedEffectsUpdateData(item));
          logMigration(diffLog, item.name, `WorldActor (${actor.name})`);
        }
      }
      if (itemsToUpdate.length > 0) {
        await actor.updateEmbeddedDocuments("Item", itemsToUpdate);
      }
    } catch (e) {
      console.error(`Erro migrando Ator do Mundo: ${actor.name}`, e);
    }
  }
}

async function migrateCompendiums(diffLog) {
  for (const pack of game.packs) {
    if (pack.metadata.type !== "Item" && pack.metadata.type !== "Actor") continue;
    if (pack.metadata.packageType !== "system" && pack.metadata.system !== SYSTEM_ID) continue;

    const packCollection = `Compendium (${pack.collection})`;
    const wasLocked = pack.locked;
    try {
      await pack.configure({ locked: false });
      const documents = await pack.getDocuments();

      for (const doc of documents) {
        if (doc.documentName === "Item") {
          if (hasEffects(doc)) {
            await doc.update(getEffectsUpdateData(doc));
            logMigration(diffLog, doc.name, packCollection);
          }
        } else if (doc.documentName === "Actor") {
          const itemsToUpdate = [];
          for (const item of doc.items) {
            if (hasEffects(item)) {
              itemsToUpdate.push(getEmbeddedEffectsUpdateData(item));
              logMigration(diffLog, item.name, `${packCollection} - Actor (${doc.name})`);
            }
          }
          if (itemsToUpdate.length > 0) {
            await doc.updateEmbeddedDocuments("Item", itemsToUpdate);
          }
        }
      }
    } catch (e) {
      console.error(`Erro migrando Compêndio: ${pack.collection}`, e);
    } finally {
      await pack.configure({ locked: wasLocked });
    }
  }
}

/**
 * Registra a migração no diffLog para rastreabilidade.
 */
function logMigration(diffLog, itemName, source) {
  diffLog.diffs.push({
    source: `${source} - Item (${itemName})`,
    de: "change (Objeto literal)",
    para: "changes (Array)"
  });
}
