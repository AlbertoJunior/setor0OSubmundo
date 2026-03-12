import { FoundryApi } from "../../api/foundry-api.mjs";
import { SYSTEM_HOOKS, SYSTEM_ID, REGISTERED_MIGRATIONS } from "../../constants.mjs";
import { hardnessEnhancement } from "../../core/enhancement/enhancement-items/hardness.mjs";
import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { getObject, logDiffMigration } from "../../utils/utils.mjs";

// MIGRATION VERSION 0.0.3
const mapper = {
  '50': hardnessEnhancement.effects[0].id,
  '51': hardnessEnhancement.effects[1].id,
  '52': hardnessEnhancement.effects[2].id,
  '53': hardnessEnhancement.effects[3].id,
  '54': hardnessEnhancement.effects[4].id,
  '55': hardnessEnhancement.effects[5].id,
  '56': hardnessEnhancement.effects[6].id,
}

let _needsForceRun = false;

export const HardnessIdsMigration = Object.freeze({
  version: '0.0.3',
  description: "IDs de Rigidez (Hardness)",
  get needsForceRun() { return _needsForceRun; },
  migrate: migrateHardnessIds,
  migrateDataModel: function (source) {
    if (_needsForceRun) return source;

    const enhancements = getObject(source, CharacteristicType.ENHANCEMENT_ALL.id) || {};
    const foundHardnessEnhancements = Object.values(enhancements)
      .filter(enhancement => enhancement?.id == hardnessEnhancement.id);

    if (foundHardnessEnhancements.length > 0) {
      const levels = foundHardnessEnhancements[0].levels;
      if (!levels) return source;

      let hasChanges = false;

      for (const nv of Object.keys(levels)) {
        const currentId = levels[nv]?.id;
        if (currentId && mapper[currentId] !== undefined) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) {
        console.warn(`Migração de IDs de Rigidez (Hardness) encontrada. Forçando execução da rotina.`);
        _needsForceRun = true;
      }
    }
    return source;
  }
});

Hooks.once(SYSTEM_HOOKS.GM_INIT, async function () {
  REGISTERED_MIGRATIONS.add(HardnessIdsMigration);
});

async function migrateHardnessIds() {
  const diffLog = { diffs: [] };

  await migrateWorldActors(diffLog);
  await migrateCompendiums(diffLog);
  if (diffLog.diffs.length > 0) {
    logDiffMigration(`${HardnessIdsMigration.description}`, diffLog);
  }
}

async function migrateWorldActors(diffLog) {
  for (const actor of game.actors) {
    try {
      const actorDataSource = FoundryApi.deepClone(actor._source);
      if (needsHardnessIdsMigration(actorDataSource)) {
        migrate(actorDataSource, actor.name, "WorldActor", diffLog);
        await actor.update(actorDataSource);
      }
    } catch (e) {
      console.error(`Erro migrando Ator do Mundo: ${actor.name}`, e);
    }
  }
}

async function migrateCompendiums(diffLog) {
  for (const pack of game.packs) {
    if (pack.metadata.type !== "Actor") continue;
    if (pack.metadata.packageType !== "system" && pack.metadata.system !== SYSTEM_ID) continue;

    const packCollection = `Compendium (${pack.collection})`;
    const wasLocked = pack.locked;
    try {
      if (wasLocked) await pack.configure({ locked: false });
      const documents = await pack.getDocuments();

      for (const doc of documents) {
        if (doc.documentName === "Actor") {
          const actorDataSource = FoundryApi.deepClone(doc._source);
          if (needsHardnessIdsMigration(actorDataSource)) {
            migrate(actorDataSource, doc.name, packCollection, diffLog)
            await doc.update(actorDataSource);
          }
        }
      }
    } catch (e) {
      console.error(`Erro migrando: ${packCollection}`, e);
    } finally {
      if (wasLocked) await pack.configure({ locked: true });
    }
  }
}

function migrate(actorDataSource, actorName, source, diffLog) {
  const enhancements = getObject(actorDataSource, CharacteristicType.ENHANCEMENT_ALL) || {};
  const enhancementsArray = Object.values(enhancements);
  for (const enh of enhancementsArray) {
    if (enh && enh.id == hardnessEnhancement.id && enh.levels) {
      for (const nv in enh.levels) {
        if (mapper[enh.levels[nv]?.id]) {
          enh.levels[nv].id = mapper[enh.levels[nv].id];
        }
      }
    }
  }

  diffLog.diffs.push({
    source: `${source} - Actor (${actorName})`,
    de: "IDs antigos (50-56)",
    para: "IDs atualizados (400+)"
  });
}

function needsHardnessIdsMigration(actorData) {
  const enhancements = getObject(actorData, CharacteristicType.ENHANCEMENT_ALL) || {};
  const enhancementsArray = Object.values(enhancements);

  for (const enh of enhancementsArray) {
    if (enh && enh.id == hardnessEnhancement.id && enh.levels) {
      for (const nv in enh.levels) {
        if (enh.levels[nv]?.id && mapper[enh.levels[nv].id] !== undefined) {
          return true;
        }
      }
    }
  }
  return false;
}
