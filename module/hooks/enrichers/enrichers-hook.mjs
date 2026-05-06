import { TraitRepository } from "../../repository/trait-repository.mjs";
import { TraitDialog } from "../../creators/dialog/trait-dialog.mjs";
import { FoundryApi } from "../../api/foundry-api.mjs";

export class EnrichersHookHandle {
  static handle() {
    this.#registerTraitEnricher();
    this.#registerClickListeners();
  }

  static #registerTraitEnricher() {
    // Busca @Traco[NomeOuID] ou @Traco[NomeOuID]{Nome Customizado}
    const pattern = /@Traco\[([^\]]+)\](?:{([^}]+)})?/g;

    FoundryApi.registerCustomEnricher(pattern, (match, options) => {
      const traitIdentifier = match[1];
      const customName = match[2];

      const goodTraits = TraitRepository.getGoodTraits();
      const badTraits = TraitRepository.getBadTraits();
      const allTraits = [...goodTraits, ...badTraits];

      // Tenta achar pelo ID, ou então pelo nome.
      const trait = allTraits.find(t => t.id == traitIdentifier || t.name.toLowerCase() === traitIdentifier.toLowerCase());

      const displayName = customName || trait?.name || traitIdentifier;

      const a = document.createElement("a");
      a.classList.add("content-link");
      a.innerHTML = `<i class="fas fa-bookmark"></i> ${displayName}`;

      if (trait) {
        a.dataset.customLink = "Trait";
        a.dataset.id = trait.id;
        a.dataset.type = trait.type;
      } else {
        a.classList.add("broken");
      }
      return a;
    });
  }

  static #registerClickListeners() {
    document.body.addEventListener("click", this.#onClickCustomLink.bind(this));
  }

  static #onClickCustomLink(event) {
    const a = event.target.closest("a.content-link[data-custom-link]");
    if (!a) return;

    const customLinkType = a.dataset.customLink;

    if (customLinkType === "Trait") {
      event.preventDefault();
      event.stopPropagation();

      const traitId = a.dataset.id;
      const traitType = a.dataset.type;

      if (traitId && traitType) {
        const fakeItem = { sourceId: traitId };
        TraitDialog.openByTrait(fakeItem, traitType, null);
      }
    }
  }
}
