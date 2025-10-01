import { getObject, localize } from "../../../../../utils/utils.mjs";
import { ActorEquipmentUtils } from "../../../../../core/actor/actor-equipment-utils.mjs";
import { ActorUtils } from "../../../../../core/actor/actor-utils.mjs";
import { NpcUtils } from "../../../../../core/npc/npc-utils.mjs";
import { RollSimplified } from "../../../../../core/rolls/simplified-roll.mjs";
import { CreateFormDialog } from "../../../../../creators/dialog/create-dialog.mjs";
import { NotificationsUtils } from "../../../../../creators/message/notifications.mjs";
import { CharacteristicType, NpcCharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { DefaultActions } from "../../../../../utils/default-actions.mjs";
import { FoundryApi } from "../../../../../api/foundry-api.mjs";

export const npcRollHandle = {
    [OnEventType.ROLL]: async (actor, event) => NpcRollMethods.handleRoll(actor, event),
    rollEquipment: async (actor, event) => NpcRollMethods.handleEquipmentRoll(actor, event),
    rollableItem: async (actor, rollTest, item, half, mode) => NpcRollMethods.rollByEquipment(actor, { item, rollTest }, half, mode),
}

class NpcRollMethods {
    static #skillMap = {
        [NpcCharacteristicType.SKILLS.PRIMARY.id]: NpcCharacteristicType.SKILLS.PRIMARY,
        [NpcCharacteristicType.SKILLS.SECONDARY.id]: NpcCharacteristicType.SKILLS.SECONDARY,
        [NpcCharacteristicType.SKILLS.TERTIARY.id]: NpcCharacteristicType.SKILLS.TERTIARY,
        [NpcCharacteristicType.SKILLS.QUATERNARY.id]: NpcCharacteristicType.SKILLS.QUATERNARY
    };

    static handleRoll(actor, event) {
        const rollSkill = event.currentTarget.dataset.subcharacteristic;

        const selectedSkill = this.#skillMap[rollSkill];
        if (!selectedSkill) {
            return;
        }

        const skillName = getObject(actor, selectedSkill.SKILL_NAME);
        const value = getObject(actor, selectedSkill.VALUE);
        if (value == 0 || skillName == undefined || skillName == '') {
            return;
        }

        const rollInformations = { value, skillName };
        this.#openDialogModifiers(actor, rollInformations);
    }

    static async #openDialogModifiers(actor, rollInformations) {
        CreateFormDialog.open(
            localize("Modificadores"),
            "rolls/modifiers",
            {
                presetForm: {
                    canBeHalf: NpcUtils.canHalfTest(actor),
                    canBeOverload: NpcUtils.canBeOverloaded(actor),
                    canBeSpecialist: NpcUtils.canBeSpecialist(actor),
                    canBePenalty: true,
                    values: {
                        overload: ActorUtils.getOverload(actor),
                        penalty: NpcUtils.calculatePenalty(actor),
                    }
                },
                onConfirm: async (data) => {
                    const copiedActor = FoundryApi.duplicate(actor);
                    this.#setNpcOverload(copiedActor, Number(data.overload));
                    this.#mountRollInformations(copiedActor, rollInformations, data);
                }
            },
        );
    }

    static async #mountRollInformations(actor, rollInformations, data) {
        const { value, skillName, item } = rollInformations;

        const simplifiedRoll = await RollSimplified.roll(
            actor,
            {
                value,
                skillName,
                item,
                ...data,
            }
        );

        await DefaultActions.processSimplefiedRoll(actor, simplifiedRoll);
    }

    static async handleEquipmentRoll(actor, event) {
        const equipmentId = event.currentTarget.dataset.itemId;
        const rollEquipmentInformations = ActorEquipmentUtils.getItemAndRollTest(actor, equipmentId);
        await this.rollByEquipment(actor, rollEquipmentInformations);
    }

    static async rollByEquipment(actor, rollEquipmentInformations, half, mode) {
        if (!rollEquipmentInformations) {
            NotificationsUtils.warning(localize('Aviso.Teste.Erro_Sem_Teste_Padrao'));
            return;
        }
        const rollTest = rollEquipmentInformations.rollTest;

        const ability = rollTest.ability;
        const skills = Object.values(this.#skillMap);

        const matchedSkill = skills.find(skill => getObject(actor, skill.SKILL_NAME) === ability);
        if (!matchedSkill) {
            NotificationsUtils.warning(localize('Aviso.Teste.Erro_Sem_Habilidade'));
            return;
        }

        const skillName = getObject(actor, matchedSkill.SKILL_NAME);
        const value = getObject(actor, matchedSkill.VALUE);

        const informationsToRoll = {
            value: value,
            skillName: skillName,
            ...rollEquipmentInformations,
            isHalf: half,
            mode: mode,
        };

        this.#setNpcOverload(actor, rollTest.overload || 0);

        const simplifiedRoll = await RollSimplified.rollByEquipment(actor, informationsToRoll);
        await DefaultActions.processSimplefiedRoll(actor, simplifiedRoll);
    }

    static #setNpcOverload(actor, value) {
        actor.system[CharacteristicType.OVERLOAD.id] = value;
    }
}