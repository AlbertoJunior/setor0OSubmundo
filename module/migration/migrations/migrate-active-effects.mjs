import { FoundryApi } from "../../api/foundry-api.mjs";
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
  migrateDataModel: function (source) {
    if (_needsForceRun) return source;

    const effects = getObject(source, EquipmentCharacteristicType.SUBSTANCE.EFFECTS.id)
    if (Array.isArray(effects)) {
      for (const effect of effects) {
        if (effect.change && !Array.isArray(effect.change)) {
          _needsForceRun = true;
          break;
        }
      }
    }
    return source;
  }
});

Hooks.once(SYSTEM_HOOKS.GM_REGISTER_MIGRATIONS, () => {
  REGISTERED_MIGRATIONS.add(ActiveEffectsMigration);
});

async function migrateActiveEffects() {
  const diffLog = { diffs: [] };

  await migrateWorldItems(diffLog);
  await migrateWorldActors(diffLog);
  await migrateCompendiums(diffLog);

  if (diffLog.diffs.length > 0) {
    logDiffMigration('0.0.3', diffLog);
  }
}

async function migrateWorldItems(diffLog) {
  for (const item of game.items) {
    try {
      const itemDataSource = FoundryApi.deepClone(item._source);
      if (needsActiveEffectsMigration(itemDataSource)) {
        migrate(itemDataSource, item.name, "WorldItem", diffLog);
        await item.update(itemDataSource);
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
      const actorDataSource = FoundryApi.deepClone(actor._source);

      for (const itemDataSource of actorDataSource.items) {
        if (needsActiveEffectsMigration(itemDataSource)) {
          migrate(itemDataSource, itemDataSource.name, `WorldActor (${actor.name})`, diffLog);
          itemsToUpdate.push(itemDataSource);
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
          const itemDataSource = FoundryApi.deepClone(doc._source);
          if (needsActiveEffectsMigration(itemDataSource)) {
            migrate(itemDataSource, doc.name, packCollection, diffLog);
            await doc.update(itemDataSource);
          }
        } else if (doc.documentName === "Actor") {
          const itemsToUpdate = [];
          const docDataSource = FoundryApi.deepClone(doc._source);

          for (const itemDataSource of docDataSource.items) {
            if (needsActiveEffectsMigration(itemDataSource)) {
              migrate(itemDataSource, itemDataSource.name, `${packCollection} - Actor (${doc.name})`, diffLog);
              itemsToUpdate.push(itemDataSource);
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

function migrate(itemDataSource, itemName, source, diffLog) {
  const effects = itemDataSource.system?.effects;
  if (Array.isArray(effects)) {
    for (const effect of effects) {
      if (effect.change && !Array.isArray(effect.change)) {
        effect.changes = [effect.change];
        effect.change = null;
      }
    }
  }

  diffLog.diffs.push({
    source: `${source} - Item (${itemName})`,
    de: "change (Objeto literal)",
    para: "changes (Array)"
  });
}

function needsActiveEffectsMigration(itemData) {
  const effects = itemData.system?.effects;
  if (Array.isArray(effects)) {
    for (const effect of effects) {
      if (effect.change && !Array.isArray(effect.change)) {
        return true;
      }
    }
  }
  return false;
}
