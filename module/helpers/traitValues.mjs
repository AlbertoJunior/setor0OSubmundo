import { TraitUtils } from "../core/trait/trait-utils.mjs";

export default function traitValues(item, value, ...params) {
  params.pop();

  const map = {
    'xp': (item) => TraitUtils.getXp(item),
    'description': (item) => TraitUtils.getDescription(item),
    'requirement': (item) => TraitUtils.getRequirement(item),
    'morph': (item) => TraitUtils.getMorph(item),
    'type': (item) => TraitUtils.getType(item),
    'haveParticularity': (item) => TraitUtils.getHaveParticularity(item),
    'effects': (item) => TraitUtils.getEffectsWithLocalizedKey(item),
  };

  if (!map[value]) return undefined;

  return map[value](item, params);
}
