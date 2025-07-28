import { EnhancementDuration } from "../../enums/enhancement-enums.mjs";
import { EnhancementRepository } from "../../repository/enhancement-repository.mjs";
import { EnhancementInfoParser } from "../../core/enhancement/enhancement-info.mjs";
import { localize } from "../../utils/utils.mjs";
import { OnEventType } from "../../enums/on-event-type.mjs";
import { CreateFormDialog } from "./create-dialog.mjs";
import { ChatCreator } from "../../utils/chat-creator.mjs";
import { EnhancementMessageCreator } from "../message/enhancement-message.mjs";
import { ActiveEffectsUtils } from "../../core/effect/active-effects.mjs";
import { TEMPLATES_PATH } from "../../constants.mjs";
import { ActorUtils } from "../../core/actor/actor-utils.mjs";
import { playerRollHandle } from "../../base/sheet/actor/player/methods/player-roll-methods.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class EnhancementDialog {
    static async open(enhancementEffect, actor, onConfirm) {
        const haveActor = actor != undefined;

        const enhancementFamily = EnhancementRepository.getEnhancementFamilyByEffectId(enhancementEffect.id);
        const content = await this.#mountContent(enhancementEffect, enhancementFamily);

        const buttons = [{
            label: localize("Chat"),
            onClick: () => this.#sendEffectToChat(enhancementEffect, actor)
        }];

        const canActive = haveActor && typeof onConfirm === 'function';
        if (canActive) {
            const hasActivated = ActorUtils.getEffects(actor)
                .map(effect => ActiveEffectsUtils.getOriginId(effect))
                .includes(enhancementEffect.id);

            const isUsableType = enhancementEffect.duration === EnhancementDuration.USE;
            const useOrActiveText = isUsableType ? "Usar" : "Ativar";

            buttons.push({
                label: localize(hasActivated ? "Desativar" : useOrActiveText),
                onClick: onConfirm
            });
        }

        FoundryApi.createDialog(
            {
                title: enhancementEffect.name,
                content: content,
                buttons: buttons,
                render: (html) => {
                    if (haveActor) {
                        $(html)
                            .find(`[data-action="${OnEventType.ROLL}"]`)
                            .click((event) => this.#onRollEvent(actor, enhancementEffect, event));
                    }
                }
            },
            { width: 480 }
        );
    }

    static async #mountContent(enhancementEffect, enhancementFamily) {
        const data = {
            ...enhancementEffect,
            overload: EnhancementInfoParser.overloadValueToString(enhancementEffect.overload),
            duration: EnhancementInfoParser.durationValueToString(enhancementEffect.duration),
            family: enhancementFamily.name,
            familyId: enhancementFamily.id,
        };
        return await FoundryApi.renderTemplate(`${TEMPLATES_PATH}/enhancement/enhancement-dialog.hbs`, data);
    }

    static async #onRollEvent(actor, enhancementEffect, event) {
        const rollId = event.currentTarget.dataset.itemId;
        const possibleTests = enhancementEffect.possible_tests || [];
        const rollTest = possibleTests.find(test => test.id == rollId);
        if (!rollTest) {
            return;
        }

        CreateFormDialog.open(
            localize("Modificadores"),
            "rolls/modifiers",
            {
                presetForm: {
                    canBeHalf: true,
                    canBeSpecialist: true,
                    defaultDifficulty: rollTest.difficulty,
                    defaultCritic: rollTest.critic,
                },
                onConfirm: async (data) => {
                    const rollMessage = `${enhancementEffect.name}: ${rollTest.name}`;
                    const difficulty = Number(data.difficulty);
                    const critic = Number(data.critic);
                    const bonus = Number(data.bonus);
                    const automatic = Number(data.automatic);
                    const isHalf = Boolean(data.half);
                    const isSpecialist = Boolean(data.specialist);
                    const mode = data.chatSelect;

                    if (rollTest.ability) {
                        rollTest.critic = critic;
                        rollTest.difficulty = difficulty;
                        rollTest.bonus = bonus;
                        rollTest.automatic = automatic;
                        rollTest.specialist = isSpecialist;
                        rollTest.rollMessage = rollMessage;
                        rollTest.mode = mode;

                        await playerRollHandle.shortcut(actor, rollTest);
                    } else {
                        const inputParams = {
                            primary: rollTest.primary_attribute,
                            secondary: rollTest.secondary_attribute,
                            tertiary: rollTest.tertiary_attribute,
                            special_primary: rollTest.special_primary,
                            special_secondary: rollTest.special_secondary,
                            special_tertiary: rollTest.special_tertiary,
                            half: isHalf,
                            specialist: isSpecialist,
                            bonus: bonus,
                            automatic: automatic,
                            difficulty: difficulty,
                            critic: critic,
                            rollMode: mode,
                        }

                        await playerRollHandle.custom(actor, inputParams);
                    }
                }
            }
        );
    }

    static async #sendEffectToChat(effect, actor) {
        const message = await EnhancementMessageCreator.mountContentInfo(effect);
        ChatCreator.sendToChat(actor, message);
    }
}