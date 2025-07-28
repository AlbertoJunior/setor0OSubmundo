import { validEquipmentTypes } from "../../module/enums/equipment-enums.mjs";
import { MorphologyRepository } from "../../module/repository/morphology-repository.mjs";
import { DistrictRepository } from "../../module/repository/district-repository.mjs";
import { EnhancementRepository } from "../../module/repository/enhancement-repository.mjs";
import { TraitRepository } from "../../module/repository/trait-repository.mjs";
import { LanguageRepository } from "../../module/repository/language-repository.mjs";
import { localizeType } from "../utils/utils.mjs";
import { AbilityRepository } from "../../module/repository/ability-repository.mjs";
import { AttributeRepository } from "../../module/repository/attribute-repository.mjs";
import { RepertoryRepository } from "../../module/repository/repertory-repository.mjs";
import { VirtuesRepository } from "../../module/repository/virtues-repository.mjs";
import { FameRepository } from "../../module/repository/fame-repository.mjs";
import { NpcQualityRepository } from "../../module/repository/npc-quality-repository.mjs";
import { EquipmentInfoParser } from "../../module/core/equipment/equipment-info.mjs";
import { SuperEquipmentTraitRepository } from "../../module/repository/superequipment-trait-repository.mjs";

function getActorEquipmentTypes() {
    return validEquipmentTypes().map(item => {
        const type = EquipmentInfoParser.equipmentTypeIdToTypeString(item);
        return {
            id: item,
            label: localizeType(`Item.${type}`),
            type: type.toLowerCase(),
        }
    });
}

const repositoryMap = {
    'morphology': MorphologyRepository.getItems(),
    'district': DistrictRepository.getItems(),
    'enhancement': EnhancementRepository.getItems(),
    'trait-good': TraitRepository.getGoodTraits(),
    'trait-bad': TraitRepository.getBadTraits(),
    'language': LanguageRepository.getItems(),
    'attribute': AttributeRepository.getItems(),
    'ability': AbilityRepository.getItems(),
    'repertory': RepertoryRepository.getItems(),
    'virtue': VirtuesRepository.getItems(),
    'fame': FameRepository.getItems(),
    'npc-fame': FameRepository.getItemsNpc(),
    'npc-quality': NpcQualityRepository.getItems(),
    'equipment-types': getActorEquipmentTypes,
    'equipment-occultability': EquipmentInfoParser.getOccultabilityTypes,
    'equipment-damage-type': EquipmentInfoParser.getDamageTypes,
    'equipment-hand-type': EquipmentInfoParser.getHandTypes,
    'equipment-melee-size': EquipmentInfoParser.getMeleeSize,
    'equipment-vehicle-type': EquipmentInfoParser.getVehicleTypes,
    'equipment-substance-type': EquipmentInfoParser.getSubstanceTypes,
    'superequipment-good-traits': SuperEquipmentTraitRepository.getGoodTraits,
    'superequipment-bad-traits': SuperEquipmentTraitRepository.getBadTraits,
}

export default function fetchRepository(repositoryName) {
    const resolver = repositoryMap[repositoryName];
    if (resolver) {
        return resolver;
    }

    console.warn(`-> [${repositoryName}] não existe no mapper`);
    return [];
}