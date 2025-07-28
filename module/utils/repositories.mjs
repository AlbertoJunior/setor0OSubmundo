import { logTable } from "../utils/utils.mjs";
import { DistrictRepository } from "../repository/district-repository.mjs";
import { EnhancementRepository } from "../repository/enhancement-repository.mjs";
import { EquipmentRepository } from "../repository/equipment-repository.mjs";
import { LanguageRepository } from "../repository/language-repository.mjs";
import { MorphologyRepository } from "../repository/morphology-repository.mjs";
import { RepertoryRepository } from "../repository/repertory-repository.mjs";
import { SuperEquipmentTraitRepository } from "../repository/superequipment-trait-repository.mjs";
import { TraitRepository } from "../repository/trait-repository.mjs";

export class RepositoriesUtils {
    static async loadFromPackages() {
        const repositories = [
            { repo: DistrictRepository, method: '_loadFromPack' },
            { repo: EnhancementRepository, method: '_loadFromPack' },
            { repo: EquipmentRepository, method: '_loadFromPack' },
            { repo: LanguageRepository, method: '_loadFromPack' },
            { repo: MorphologyRepository, method: '_loadFromPack' },
            { repo: RepertoryRepository, method: '_loadFromPack' },
            { repo: SuperEquipmentTraitRepository, method: '_loadFromPack' },
            { repo: TraitRepository, method: '_loadFromPack' },
        ];

        const results = await Promise.all(
            repositories.map(({ repo, method }) =>
                (async () => {
                    try {
                        await repo[method]();
                        return { Repository: repo.name, Status: "Sucesso" };
                    } catch (error) {
                        return { Repository: repo.name, Status: "Falha", error: error };
                    }
                })()
            )
        );

        logTable('Todos os pacotes foram processados!', results);
    }

    static async loadFromGame() {
        const repositories = [
            { repo: EquipmentRepository, method: '_loadFromGame' }
        ];

        const results = await Promise.all(
            repositories.map(({ repo, method }) =>
                (async () => {
                    try {
                        await repo[method]();
                        return { Repository: repo.name, Status: "Sucesso" };
                    } catch (error) {
                        return { Repository: repo.name, Status: "Falha", error: error };
                    }
                })()
            )
        );

        logTable('Todos os objetos do Jogo foram processados!', results);
    }
}