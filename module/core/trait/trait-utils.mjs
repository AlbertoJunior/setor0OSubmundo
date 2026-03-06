import { CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { TraitCharacteristicType } from "../../enums/trait-enums.mjs";
import { localize, getObject, gameLocalize, keyJsonToKeyLang } from "../../utils/utils.mjs";

export class TraitUtils {
  static getXp(item) {
    return getObject(item, TraitCharacteristicType.XP) || 0;
  }

  static getDescription(item) {
    return getObject(item, TraitCharacteristicType.DESCRIPTION);
  }

  static getRequirement(item) {
    return getObject(item, TraitCharacteristicType.REQUIREMENT);
  }

  static getMorph(item) {
    return getObject(item, TraitCharacteristicType.MORPH);
  }

  static getType(item) {
    return getObject(item, TraitCharacteristicType.TYPE);
  }

  static getHaveParticularity(item) {
    return getObject(item, TraitCharacteristicType.HAVE_PARTICULARITY);
  }

  static getEffects(item) {
    return getObject(item, TraitCharacteristicType.EFFECTS) || [];
  }

  static getEffectsWithLocalizedKey(item) {
    const effects = this.getEffects(item);
    return effects.map(effect => {
      let localizedKey = effect.key;

      if (effect.key.startsWith(`${CharacteristicType.BONUS.SKILL.system}.`)) {
        const segments = effect.key.split('.');
        const skillNameKey = keyJsonToKeyLang(segments[segments.length - 1]);
        const skillName = gameLocalize(skillNameKey);
        localizedKey = `${localize(CharacteristicType.BONUS.SKILL.label || CharacteristicType.BONUS.SKILL.id)} (${skillName !== skillNameKey ? skillName : segments[segments.length - 1]})`;

        return {
          ...effect,
          localizedKey: localizedKey
        };
      }

      // Find the matching characteristic label
      for (const characteristicCategoryKey in CharacteristicType.BONUS) {
        const category = CharacteristicType.BONUS[characteristicCategoryKey];
        if (typeof category !== 'object' || category === null) continue;

        let hasSubCategories = false;

        for (const characteristicSubCategoryKey in category) {
          const subCategory = category[characteristicSubCategoryKey];
          if (typeof subCategory === 'object' && subCategory !== null) {
            if (subCategory.system === effect.key) {
              localizedKey = localize(`${subCategory.label || subCategory.id}`);
              break;
            }
            hasSubCategories = true;
          }
        }

        if (!hasSubCategories && category.system === effect.key) {
          localizedKey = localize(`${category.label || category.id}`);
          break;
        }
      }

      return {
        ...effect,
        localizedKey: localizedKey
      };
    });
  }
}
