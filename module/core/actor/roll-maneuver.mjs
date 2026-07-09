import { ActorEquipmentUtils } from "./actor-equipment-utils.mjs";
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
    let selectedWeaponId = null;

    CreateFormDialog.open(
      localize("Modificadores"),
      "rolls/modifiers",
      {
        presetForm: {
          canBeHalf: true,
          canBeSpecialist: true,
          needsWeapon,
          weapons: availableWeapons,
          values: {
            bonus: 0,
            automatic: 0,
            specialist: getObject(maneuver, ManeuverType.SPECIALIST),
            critic: getObject(maneuver, ManeuverType.CRITIC),
            difficulty: getObject(maneuver, ManeuverType.DIFFICULTY),
          }
        },
        render: (html) => {
          if (!needsWeapon) return;

          // Setup de delegação de clique para seleção de arma
          html.addEventListener('click', (e) => {
            const option = e.target.closest('.S0-weapon-option');
            if (!option) return;

            const weaponId = option.dataset.weaponId;

            // Toggle: se clicou na mesma, desseleciona
            if (selectedWeaponId === weaponId) {
              selectedWeaponId = null;
              option.classList.remove('S0-marked');
              return;
            }

            // Remove seleção anterior de todas as opções
            const weaponOptions = html.querySelectorAll('.S0-weapon-option');
            weaponOptions.forEach(o => o.classList.remove('S0-marked'));

            // Seleciona a nova arma
            selectedWeaponId = weaponId;
            option.classList.add('S0-marked');
          });
        },
        onConfirm: async (data) => {
          if (needsWeapon && !selectedWeaponId) {
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

          // Se tem arma selecionada, adiciona dano da arma aos parâmetros
          if (selectedWeaponId) {
            const weapon = availableWeapons.find(w => w.id === selectedWeaponId);
            if (weapon) {
              inputParams.weaponName = weapon.name;
              inputParams.weaponDamage = getObject(weapon, EquipmentCharacteristicType.DAMAGE) || 0;
              inputParams.weaponTrueDamage = getObject(weapon, EquipmentCharacteristicType.TRUE_DAMAGE) || 0;
            }
          }

          await playerRollHandle.default(actor, inputParams);
        }
      }
    );
  }
}
