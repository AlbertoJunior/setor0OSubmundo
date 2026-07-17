import { v2Overrides } from "./v2.mjs";

const VERSION_NAME = 'S0-V3';

export const v3Overrides = Object.freeze(
  {
    ...v2Overrides,
    VersionName: VERSION_NAME,
    formatActiveEffectData,
  }
);

function formatActiveEffectData(data) {
  if (data.changes) {
    const newData = foundry.utils.deepClone(data);
    newData.system = newData.system || {};
    newData.system.changes = newData.changes;
    delete newData.changes;
    return newData;
  }
  return data;
}
