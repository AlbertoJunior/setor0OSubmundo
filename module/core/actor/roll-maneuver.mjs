import { ActorEquipmentUtils } from "./actor-equipment-utils.mjs";
import { EquipmentUtils } from "../equipment/equipment-utils.mjs";
import { NotificationsUtils } from "../../creators/message/notifications.mjs";
import { localize, getObject } from "../../utils/utils.mjs";
import { CreateFormDialog } from "../../creators/dialog/create-dialog.mjs";
import { playerRollHandle } from "../../base/sheet/actor/player/methods/player-roll-methods.mjs";
import { ManeuverType } from "../../enums/maneuver-enums.mjs";
import { EquipmentCharacteristicType } from "../../enums/equipment-enums.mjs";
import { ManeuverUtils } from "../../utils/maneuver-utils.mjs";

export class RollManeuver {

  /**
   * Inicia o fluxo de rolagem de uma manobra.
   * Se a habilidade exigir arma equipada, filtra as armas disponíveis e
   * exibe o carrossel de seleção dentro do dialog de modificadores.
   *
   * @param {Actor} actor - O ator que está rolando.
   * @param {Item} maneuver - O item manobra a ser rolado.
   */
  static async roll(actor, maneuver) {
    const skill = getObject(maneuver, ManeuverType.SKILL);
    const requiredWeaponType = ManeuverUtils.getRequiredWeaponType(skill);

    let availableWeapons = [];

    if (requiredWeaponType) {
      const equippedItems = ActorEquipmentUtils.getEquippedItems(actor);
      availableWeapons = equippedItems.filter(i => i.type === requiredWeaponType);

      if (availableWeapons.length === 0) {
        NotificationsUtils.warning(localize("Manobra.Arma_Obrigatoria"));
        return;
      }
    }

    const needsWeapon = availableWeapons.length > 0;

    // Estado de seleção de arma (closure compartilhado com render e onConfirm)
    const state = { selectedWeaponId: null };

    CreateFormDialog.open(
      localize("Modificadores"),
      "rolls/modifiers",
      {
        presetForm: {
          canBeHalf: true,
          canBeSpecialist: true,
          needsWeapon,
          weapons: availableWeapons,
          maneuver: {
            name: maneuver.name,
            damage: getObject(maneuver, ManeuverType.DAMAGE) || 0,
            automaticDamage: getObject(maneuver, ManeuverType.AUTOMATIC_DAMAGE) || 0,
            useDamageWeapon: getObject(maneuver, ManeuverType.USE_DAMAGE_WEAPON) ?? true,
          },
          values: {
            bonus: 0,
            automatic: 0,
            specialist: getObject(maneuver, ManeuverType.SPECIALIST),
            critic: getObject(maneuver, ManeuverType.CRITIC),
            difficulty: getObject(maneuver, ManeuverType.DIFFICULTY),
          }
        },
        render: (html) => RollManeuver.#renderRollDialog(html, needsWeapon, availableWeapons, state),
        onConfirm: async (data) => RollManeuver.#handleConfirmRoll(actor, maneuver, needsWeapon, availableWeapons, state, data)
      }
    );
  }

  static #renderRollDialog(html, needsWeapon, availableWeapons, state) {
    if (!needsWeapon) return;

    const verifyAndSetInnerTextElement = (element, text) => {
      if (element)
        element.innerText = text;
    }

    // Setup de delegação de clique para seleção de arma
    html.addEventListener('click', (e) => {
      const option = e.target.closest('.S0-weapon-option');
      if (!option) return;

      const weaponId = option.dataset.weaponId;
      const damageElement = html.querySelector('#maneuver-damage-info .weapon-value');
      const automaticDamageElement = html.querySelector('#maneuver-automatic-info .weapon-value');

      const textWeapon = localize('Arma');
      // Toggle: se clicou na mesma, desseleciona
      if (state.selectedWeaponId === weaponId) {
        state.selectedWeaponId = null;
        option.classList.remove('S0-marked');
        verifyAndSetInnerTextElement(damageElement, textWeapon);
        verifyAndSetInnerTextElement(automaticDamageElement, textWeapon);
        return;
      }

      // Remove seleção anterior de todas as opções
      const weaponOptions = html.querySelectorAll('.S0-weapon-option');
      weaponOptions.forEach(o => o.classList.remove('S0-marked'));

      // Seleciona a nova arma
      state.selectedWeaponId = weaponId;
      option.classList.add('S0-marked');

      const weapon = RollManeuver.#findWeapon(availableWeapons, state.selectedWeaponId);
      if (weapon) {
        const weaponDamage = getObject(weapon, EquipmentCharacteristicType.DAMAGE) || 0;
        const weaponTrueDamage = getObject(weapon, EquipmentCharacteristicType.TRUE_DAMAGE) || 0;
        verifyAndSetInnerTextElement(damageElement, `${weaponDamage} (${textWeapon})`);
        verifyAndSetInnerTextElement(automaticDamageElement, `${weaponTrueDamage} (${textWeapon})`);
      }
    });
  }

  static async #handleConfirmRoll(actor, maneuver, needsWeapon, availableWeapons, state, data) {
    if (needsWeapon && !state.selectedWeaponId) {
      NotificationsUtils.error(localize("Manobra.Selecione_Arma"));
      return;
    }

    const inputParams = {
      attr1: getObject(maneuver, ManeuverType.PRIMARY_ATTRIBUTE),
      attr2: getObject(maneuver, ManeuverType.SECONDARY_ATTRIBUTE),
      ability: getObject(maneuver, ManeuverType.SKILL),
      bonus: Number(data.bonus),
      automatic: Number(data.automatic),
      difficulty: Number(data.difficulty),
      critic: Number(data.critic),
      specialist: Boolean(data.specialist),
      name: maneuver.name,
      isHalf: Boolean(data.half),
      rollMode: data.chatSelect,
    };

    const useDamageWeapon = getObject(maneuver, ManeuverType.USE_DAMAGE_WEAPON) ?? false;
    const maneuverDamage = getObject(maneuver, ManeuverType.DAMAGE) || 0;
    const maneuverAutoDamage = getObject(maneuver, ManeuverType.AUTOMATIC_DAMAGE) || 0;

    // Se tem arma selecionada, adiciona informações formatadas para o chat e adiciona dano
    if (state.selectedWeaponId) {
      const weapon = RollManeuver.#findWeapon(availableWeapons, state.selectedWeaponId);
      if (weapon) {
        inputParams.weapon = RollManeuver.#buildWeaponRollInfo(weapon, maneuver, useDamageWeapon);
      }
    } else if (maneuverDamage > 0 || maneuverAutoDamage > 0) {
      inputParams.weapon = RollManeuver.#buildManeuverRollInfo(maneuver, maneuverDamage, maneuverAutoDamage);
    }

    await playerRollHandle.default(actor, inputParams);
  }

  static #findWeapon(availableWeapons, weaponId) {
    return availableWeapons.find(w => w.id === weaponId);
  }

  static #buildWeaponRollInfo(weapon, maneuver, useDamageWeapon) {
    const weaponInfo = EquipmentUtils.getItemRollInformation(weapon);
    const weaponDamage = weaponInfo.damage || 0;
    const weaponTrueDamage = weaponInfo.true_damage || 0;

    const maneuverDamage = getObject(maneuver, ManeuverType.DAMAGE) || 0;
    const maneuverAutoDamage = getObject(maneuver, ManeuverType.AUTOMATIC_DAMAGE) || 0;

    const totalDamage = maneuverDamage + (useDamageWeapon ? weaponDamage : 0);
    const totalTrueDamage = maneuverAutoDamage + (useDamageWeapon ? weaponTrueDamage : 0);

    weaponInfo.name = `${maneuver.name} + ${weaponInfo.name}`;
    weaponInfo.damage = totalDamage;
    weaponInfo.true_damage = totalTrueDamage;

    const labelDamage = localize('Dano');
    const labelAutoDamage = localize('Dano_Automatico');
    const labelManeuver = localize('Manobra.Manobra');
    const labelWeapon = localize('Arma');

    weaponInfo.changes = weaponInfo.changes.map(change => {
      if (change.startsWith(`${labelDamage}:`)) {
        let label = `${labelDamage}: ${maneuverDamage} (${labelManeuver})`;
        if (useDamageWeapon)
          label += ` + ${weaponDamage} (${labelWeapon})`;
        return label;
      }

      if (change.startsWith(`${labelAutoDamage}:`)) {
        let label = `${labelAutoDamage}: ${maneuverAutoDamage} (${labelManeuver})`;
        if (useDamageWeapon)
          label += ` + ${weaponTrueDamage} (${labelWeapon})`;
        return label;
      }

      return change;
    });

    return weaponInfo;
  }

  static #buildManeuverRollInfo(maneuver, damage, autoDamage) {
    return {
      name: maneuver.name,
      damage: damage,
      true_damage: autoDamage,
      changes: [
        `${localize('Dano')}: ${damage}`,
        `${localize('Dano_Automatico')}: ${autoDamage}`
      ]
    };
  }

}
