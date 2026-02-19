import { selectCharacteristicAndReturnLength } from "../../../../../utils/utils.mjs";
import { BaseActorCharacteristicType, CharacteristicType } from "../../../../../enums/characteristic-enums.mjs";
import { DefaultActions } from "../../../../../utils/default-actions.mjs";
import { ActorUpdater } from "../../../../updater/actor-updater.mjs";
import { OnEventType } from "../../../../../enums/on-event-type.mjs";
import { ActorEquipmentUtils } from "../../../../../core/actor/actor-equipment-utils.mjs";
import { ActorUtils } from "../../../../../core/actor/actor-utils.mjs";

function selectLifeCharacteristic(event, addClassIfBlank) {
  let toUpdate = event.currentTarget;
  let addedBlank = false;
  while (toUpdate) {
    const haveSuperficial = toUpdate.classList.contains('S0-superficial');
    const haveLetal = toUpdate.classList.contains('S0-letal');
    if (haveSuperficial && !addedBlank) {
      toUpdate.classList.replace('S0-superficial', 'S0-letal');
      return;
    } else if (haveLetal && !addedBlank) {
      toUpdate.classList.remove('S0-letal');
      return;
    } else if (!haveSuperficial && !haveLetal) {
      addedBlank = true;
      toUpdate.classList.add(addClassIfBlank);
      toUpdate = toUpdate.previousElementSibling;
    } else {
      return;
    }
  }
}

function mountLifeCharacteristicToUpdate(event) {
  const parentElement = event.currentTarget.parentElement;
  return [
    {
      systemCharacteristic: BaseActorCharacteristicType.VITALITY.SUPERFICIAL_DAMAGE,
      value: parentElement.querySelectorAll('.S0-superficial').length
    },
    {
      systemCharacteristic: BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE,
      value: parentElement.querySelectorAll('.S0-letal').length
    },
  ];
}

const mapContextual = {
  health: async (actor, event) => {
    selectLifeCharacteristic(event, 'S0-superficial');
    const keysToUpdate = mountLifeCharacteristicToUpdate(event);
    ActorUpdater.verifyKeysAndUpdateActor(actor, keysToUpdate);
  }
}

const mapCheck = {
  virtue: async (actor, event) => {
    const itemType = event.currentTarget.dataset.itemType;
    const characteristicKey = ActorUtils.getCharacteristicVirtue(itemType);
    if (!characteristicKey) {
      return;
    }

    const value = selectCharacteristicAndReturnLength(event.currentTarget);
    ActorUpdater.verifyAndUpdateActor(actor, characteristicKey.USED, value);
  },
  overload: async (actor, event) => {
    const value = selectCharacteristicAndReturnLength(event.currentTarget);
    ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.OVERLOAD, value);
  },
  life: async (actor, event) => {
    const value = selectCharacteristicAndReturnLength(event.currentTarget);
    ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.LIFE, value);
  },
  health: async (actor, event) => {
    selectLifeCharacteristic(event, 'S0-letal')
    const keysToUpdate = mountLifeCharacteristicToUpdate(event);
    ActorUpdater.verifyKeysAndUpdateActor(actor, keysToUpdate);
  },
  protect: async (actor, event) => {
    const value = selectCharacteristicAndReturnLength(event.currentTarget);
    ActorEquipmentUtils.updateArmorEquippedActualResistance(actor, value);
  }
}

const mapRoll = {
  overload: async (actor, event) => {
    DefaultActions.processOverloadRoll(actor);
  },
  initiative: async (actor, event) => {
    DefaultActions.processInitiativeRoll(actor);
  },
  life: async (actor, event) => {
    DefaultActions.processLifeRoll(actor);
  }
}

const mapRemove = {
  all: async (actor, event) => {
    const keysToUpdate = [
      {
        systemCharacteristic: CharacteristicType.VIRTUES.CONSCIOUSNESS.USED,
        value: 0
      },
      {
        systemCharacteristic: CharacteristicType.VIRTUES.PERSEVERANCE.USED,
        value: 0
      },
      {
        systemCharacteristic: CharacteristicType.VIRTUES.QUIETNESS.USED,
        value: 0
      },
      {
        systemCharacteristic: CharacteristicType.OVERLOAD,
        value: 0
      },
      {
        systemCharacteristic: BaseActorCharacteristicType.VITALITY.SUPERFICIAL_DAMAGE,
        value: 0
      },
      {
        systemCharacteristic: BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE,
        value: 0
      },
    ];

    ActorUpdater.verifyKeysAndUpdateActor(actor, keysToUpdate);
  },
  virtue: async (actor, event) => {
    const itemType = event.currentTarget.dataset.itemType;
    const characteristicKey = ActorUtils.getCharacteristicVirtue(itemType);
    if (!characteristicKey) {
      return;
    }
    ActorUpdater.verifyAndUpdateActor(actor, characteristicKey.USED, 0);
  },
  overload: async (actor, event) => {
    ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.OVERLOAD, 0);
  },
  health: async (actor, event) => {
    const keysToUpdate = [
      {
        systemCharacteristic: BaseActorCharacteristicType.VITALITY.SUPERFICIAL_DAMAGE,
        value: 0
      },
      {
        systemCharacteristic: BaseActorCharacteristicType.VITALITY.LETAL_DAMAGE,
        value: 0
      },
    ];
    ActorUpdater.verifyKeysAndUpdateActor(actor, keysToUpdate);
  },
  protect: async (actor, event) => {
    ActorEquipmentUtils.updateArmorEquippedActualResistance(actor, 999);
  }
}

function handleMethodOnMap(map, actor, event) {
  const type = event.currentTarget.dataset.type;
  const method = map[type];
  if (method) {
    method(actor, event);
  } else {
    console.log(event);
  }
}

export const handleStatusMethods = {
  [OnEventType.CONTEXTUAL]: async (actor, event) => {
    handleMethodOnMap(mapContextual, actor, event);
  },
  [OnEventType.CHECK]: async (actor, event) => {
    handleMethodOnMap(mapCheck, actor, event);
  },
  [OnEventType.REMOVE]: async (actor, event) => {
    handleMethodOnMap(mapRemove, actor, event);
  },
  [OnEventType.ROLL]: async (actor, event) => {
    handleMethodOnMap(mapRoll, actor, event);
  }
}