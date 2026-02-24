import { SYSTEM_HOOKS, SYSTEM_ID, REGISTERED_MIGRATIONS } from "../../constants.mjs";
import { logDiffMigration } from "../../utils/utils.mjs";

// MIGRATION VERSION 0.0.3
export const ActiveEffectsMigration = Object.freeze({
  version: '0.0.3',
  description: "Migração para Active Effects ('Change' to 'Changes')",
  migrate: migrateActiveEffects,
  migrateDataModel: function (source) {
    if (Array.isArray(source.effects)) {
      for (const effect of source.effects) {
        if (effect.change && !Array.isArray(effect.change)) {
          effect.changes = [effect.change];
          effect.change = null; // Mark for deletion by Schema validation
        }
      }
    }
  }
});

Hooks.once(SYSTEM_HOOKS.MIGRATIONS_INIT, async function () {
  REGISTERED_MIGRATIONS.add(ActiveEffectsMigration);
});

async function migrateActiveEffects() {
  const diffLog = { diffs: [] };

  await migrateWorldItems(diffLog);
  await migrateWorldActors(diffLog);
  await migrateCompendiums(diffLog);
  logDiffMigration('0.0.3', diffLog);
}

async function migrateWorldItems(diffLog) {
  for (const item of game.items) {
    try {
      const itemDataSource = item._source;
      if (needsActiveEffectsMigration(itemDataSource)) {
        const updateData = item.toObject(); // The DataModel has already converted change -> changes inside here
        diffLog.diffs.push({
          source: `WorldItem - ${item.name}`,
          de: itemDataSource.system,
          para: updateData.system
        });
        await item.update(updateData);
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
        const itemDataSource = item._source;
        if (needsActiveEffectsMigration(itemDataSource)) {
          const updateData = item.toObject();
          itemsToUpdate.push(updateData);

          diffLog.diffs.push({
            source: `WorldActor (${actor.name}) - Item ${item.name}`,
            de: itemDataSource.system,
            para: updateData.system
          });
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

    const wasLocked = pack.locked;
    try {
      await pack.configure({ locked: false });
      const documents = await pack.getDocuments();

      for (const doc of documents) {
        if (doc.documentName === "Item") {
          const itemDataSource = doc._source;
          if (needsActiveEffectsMigration(itemDataSource)) {
            const updateData = doc.toObject();
            diffLog.diffs.push({
              source: `Compendium (${pack.collection}) - Item ${doc.name}`,
              de: itemDataSource.system,
              para: updateData.system
            });
            await doc.update(updateData);
          }
        } else if (doc.documentName === "Actor") {
          const itemsToUpdate = [];
          for (const item of doc.items) {
            const itemDataSource = item._source;
            if (needsActiveEffectsMigration(itemDataSource)) {
              const updateData = item.toObject();
              itemsToUpdate.push(updateData);

              diffLog.diffs.push({
                source: `Compendium (${pack.collection}) - Actor (${doc.name}) - Item ${item.name}`,
                de: itemDataSource.system,
                para: updateData.system
              });
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

function needsActiveEffectsMigration(itemData) {
  // If the item had effects, the migrateDataModel from DataModels already cleaned it up in memory. 
  // We just need to check if the old "change" field still exists in the raw `_source` to know if we MUST save the new clean object to DB.

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
