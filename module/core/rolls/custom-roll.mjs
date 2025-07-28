import { getObject, localize, toKeyLang } from "../../utils/utils.mjs";
import { BaseActorCharacteristicType, CharacteristicType } from "../../enums/characteristic-enums.mjs";
import { EnhancementRepository } from "../../repository/enhancement-repository.mjs";
import { ActorUtils } from "../actor/actor-utils.mjs";
import { CoreRollMethods } from "./core-roll-methods.mjs";

export class CustomRoll {
    static data = Object.freeze({
        attributes: CustomRoll.#transformOnSet(CharacteristicType.ATTRIBUTES),
        skills: CustomRoll.#transformOnSet(CharacteristicType.SKILLS),
        virtues: CustomRoll.#transformOnSet(CharacteristicType.VIRTUES),
        repertory: CustomRoll.#transformOnSet(CharacteristicType.REPERTORY),
        others: CustomRoll.#getOthers(),
    });

    static #transformOnSet(characteristicType) {
        return new Set(Object.values(characteristicType).filter(o => o.id).filter(Boolean).map(o => o.id));
    }

    static #getOthers() {
        return new Set(
            [
                BaseActorCharacteristicType.BOUNTY,
                BaseActorCharacteristicType.INFLUENCE,
                CharacteristicType.CORE,
            ].map(i => i.id)
        );
    }

    static mountData(actor) {
        const enhancements = new Set(ActorUtils.getAllEnhancements(actor) || []);
        return {
            ...CustomRoll.data,
            enhancements: enhancements
        };
    }

    static async discoverAndRoll(actor, params) {
        const {
            primary, secondary, tertiary,
            special_primary, special_secondary, special_tertiary,
            bonus, specialist, half
        } = params;

        const data = this.mountData(actor);

        const primaryValues = this.operateAllPossibilities(actor, data, primary, special_primary);
        const secondaryValues = this.operateAllPossibilities(actor, data, secondary, special_secondary);
        const tertiaryValues = tertiary ? this.operateAllPossibilities(actor, data, tertiary, special_tertiary) : null;
        const penalty = ActorUtils.calculatePenalty(actor);

        const totalDiceAmount = this.calculateDiceAmount(primaryValues, secondaryValues, tertiaryValues);
        const halfDiceAmount = Math.floor(totalDiceAmount / 2);
        const adjustedForHalf = half ? halfDiceAmount : totalDiceAmount;
        const finalDiceAmount = Math.max(adjustedForHalf - penalty + bonus, 0);

        const rollsResults = await CoreRollMethods.rollDiceAmountWithOverload(actor, finalDiceAmount);

        return {
            roll: rollsResults,
            attrs: {
                attr1: {
                    label: primaryValues.label,
                    value: primaryValues.value,
                },
                attr2: {
                    label: secondaryValues.label,
                    value: secondaryValues.value,
                },
                attr3: {
                    label: tertiaryValues?.label,
                    value: tertiaryValues?.value,
                },
            },
            modifiers: {
                specialist: specialist,
                bonus: bonus,
                penalty: penalty,
            },
        }
    }

    static calculateDiceAmount(primaryValues, secondaryValues, tertiaryValues, penalty) {
        const sumPrimaryAndSecondary = Number(primaryValues.value) + Number(secondaryValues.value);
        if (tertiaryValues) {
            const mean = Math.floor(sumPrimaryAndSecondary / 2)
            return mean + Number(tertiaryValues.value);
        } else {
            return sumPrimaryAndSecondary;
        }
    }

    static operateAllPossibilities(actor, params, characteristic, special) {
        if (characteristic === 'zero' || characteristic === 0) {
            return { label: 'Zero', value: 0 };
        }

        const checks = [
            () => this.#tryGetValue(actor, params.attributes, characteristic, ActorUtils.getAttributeValue),
            () => this.#tryGetValue(actor, params.skills, characteristic, ActorUtils.getAbilityValue),
            () => this.#tryGetValue(actor, params.virtues, characteristic, ActorUtils.getVirtueValue),
            () => this.#tryGetValue(actor, params.repertory, characteristic, this.#repertoryValueGetter),
            () => this.#tryGetValue(actor, params.others, characteristic, this.#baseValueGetter),
            () => this.#tryEnhancement(actor, params.enhancements, characteristic, special)
        ];

        for (const check of checks) {
            const result = check();
            if (result) return result;
        }

        return { label: 'Zero', value: 0 };
    }

    static #tryGetValue(actor, collection, characteristic, valueGetter) {
        if (collection?.has?.(characteristic)) {
            return {
                label: localize(toKeyLang(characteristic)),
                value: valueGetter(actor, characteristic),
            };
        }
        return null;
    }

    static #repertoryValueGetter(actor, characteristic) {
        return getObject(actor, CharacteristicType.REPERTORY)[characteristic] || 0;
    }

    static #baseValueGetter(actor, characteristic) {
        return getObject(actor, CharacteristicType.SIMPLE)[characteristic] || 0;
    }

    static #tryEnhancement(actor, enhancements, characteristic, special) {
        if (characteristic == CharacteristicType.ENHANCEMENT.id) {
            if (enhancements.some(e => e.id == special)) {
                const enhancementSelected = EnhancementRepository.getEnhancementById(special);
                return {
                    label: enhancementSelected.name,
                    value: ActorUtils.getEnhancementLevel(actor, enhancementSelected),
                };
            }
        }
        return null;
    }
}