import { NotificationsUtils } from "../../message/notifications.mjs";
import { localize, randomId } from "../../../utils/utils.mjs";
import { ActorType, CharacteristicType } from "../../../enums/characteristic-enums.mjs";
import { TEMPLATES_PATH } from "../../../constants.mjs";
import { ActorExperienceUtils } from "../../../core/actor/actor-experience-utils.mjs";
import { ActorUpdater } from "../../../base/updater/actor-updater.mjs";
import { OwnershipUtils } from "../../../utils/ownership-utils.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ExperienceCalculatorDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);
    this.actor = null;
    this.xpData = null;
    this.isApproximate = false;
    this.thresholdExpanded = false;
    this.calculationMode = null;
    this.thresholds = {
      attributes: 4,
      abilities: 5,
      enhancements: 4
    };
  }

  static DEFAULT_OPTIONS = {
    classes: ["S0-V2", "S0-dialog"],
    tag: "form",
    window: {
      title: "S0.CONTROL.EXPERIENCE_CALCULATOR_BUTTON.Dialog_Title",
      icon: "fas fa-calculator",
      resizable: true,
      controls: []
    },
    position: {
      width: 780,
      height: 580
    },
    actions: {
      calculateOptimized: ExperienceCalculatorDialog.prototype._onCalculateOptimized,
      calculateApproximate: ExperienceCalculatorDialog.prototype._onCalculateApproximate,
      recalculate: ExperienceCalculatorDialog.prototype._onRecalculate,
      toggleThresholds: ExperienceCalculatorDialog.prototype._onToggleThresholds,
      openSheet: ExperienceCalculatorDialog.prototype._onOpenSheet,
      applyExperience: ExperienceCalculatorDialog.prototype._onApplyExperience
    }
  };

  static PARTS = {
    content: {
      template: `${TEMPLATES_PATH}/dialog/experience-calculator.hbs`
    }
  };

  static async open(actor = null) {
    const app = new ExperienceCalculatorDialog({ id: `${randomId(10)}-experience-calculator-dialog` });
    if (actor) app.actor = actor;
    app.render(true);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.xpData = this.xpData;
    context.thresholds = this.thresholds;
    context.isApproximate = this.isApproximate;
    context.thresholdExpanded = this.thresholdExpanded;
    context.calculationMode = this.calculationMode;

    const availableActors = game.actors
      .filter(actor => actor.type === ActorType.PLAYER && OwnershipUtils.canDoSomething(actor))
      .map(actor => ({ id: actor.id, name: actor.name, selected: this.actor?.id === actor.id }));

    context.availableActors = availableActors;

    const xp = this.xpData || {};
    context.xpList = [
      { label: localize("Atributos.Atributos"), value: xp.atributos ?? "-" },
      { label: localize("Repertorio"), value: xp.repertorio ?? "-" },
      { label: localize("Virtude.Virtudes"), value: xp.virtudes ?? "-" },
      { label: localize("Habilidades"), value: xp.habilidades ?? "-" },
      { label: localize("Nucleo"), value: xp.nucleo ?? "-" },
      { label: localize("Aprimoramentos"), value: xp.aprimoramentos ?? "-" },
      { label: localize("Tracos_Bons"), value: xp.tracos_bons ?? "-" },
      { label: localize("Tracos_Ruins"), value: xp.tracos_ruins ?? "-" },
      { label: localize("Manobras"), value: xp.manobras ?? "-" },
      { label: localize("Outros"), value: xp.outros ?? "-" }
    ];

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    this._attachDragDropListeners(this.element);

    const thresholdInputs = this.element.querySelectorAll("input[data-threshold]");
    thresholdInputs.forEach(input => {
      input.addEventListener("change", (event) => {
        const type = event.currentTarget.dataset.threshold;
        this.thresholds[type] = parseInt(event.currentTarget.value) || 0;
      });
    });

    const selectActor = this.element.querySelector("select[name='selectedActor']");
    if (selectActor) {
      selectActor.addEventListener("change", this._onSelectActor.bind(this));
    }
  }

  setActor(actor) {
    this.actor = actor;
    this.xpData = null;
    this.render();
  }

  async _onSelectActor(event) {
    const actorId = event.currentTarget.value;
    if (!actorId) return;

    const actor = game.actors.get(actorId);
    if (!actor) return;

    this.setActor(actor);
  }

  _attachDragDropListeners(html) {
    const dropZone = html.querySelector(".S0-calculator-dropzone");
    if (!dropZone) return;

    dropZone.addEventListener("dragenter", this._onDragEnter.bind(this), false);
    dropZone.addEventListener("dragleave", this._onDragLeave.bind(this), false);
    dropZone.addEventListener("dragover", this._onDragOver.bind(this), false);
    dropZone.addEventListener("drop", this._onDrop.bind(this), false);
  }

  _onDragEnter(event) {
    event.preventDefault();
    event.currentTarget.classList.add("S0-drag-over");
  }

  _onDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("S0-drag-over");
  }

  _onDragOver(event) {
    event.preventDefault();
  }

  async _onDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("S0-drag-over");

    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      return;
    }

    if (data.type !== "Actor") return;

    const actor = await fromUuid(data.uuid);
    if (!actor) return;

    if (actor.type === ActorType.NPC) {
      NotificationsUtils.warning(localize("CONTROL.EXPERIENCE_CALCULATOR_BUTTON.NPC_Warning"));
      return;
    }

    this.setActor(actor);
  }

  async _onCalculateOptimized(event, target) {
    if (!this.actor) {
      NotificationsUtils.warning(localize("CONTROL.EXPERIENCE_CALCULATOR_BUTTON.No_Actor_Warning"));
      return;
    }

    try {
      this.isApproximate = false;
      this.calculationMode = "optimized";
      this.xpData = ActorExperienceUtils.calculateOptimizedExperience(this.actor);
      this.render();
    } catch (error) {
      console.error(error);
      NotificationsUtils.error(localize("S0.CONTROL.EXPERIENCE_CALCULATOR_BUTTON.Erro_Otimizada"));
    }
  }

  async _onCalculateApproximate(event, target) {
    if (!this.actor) {
      NotificationsUtils.warning(localize("S0.CONTROL.EXPERIENCE_CALCULATOR_BUTTON.No_Actor_Warning"));
      return;
    }

    try {
      this.isApproximate = true;
      this.calculationMode = "approximate";
      this.xpData = ActorExperienceUtils.calculateApproximateExperience(this.actor, this.thresholds);
      this.render();
    } catch (error) {
      console.error(error);
      NotificationsUtils.error(localize("S0.CONTROL.EXPERIENCE_CALCULATOR_BUTTON.Erro_Aproximada"));
    }
  }

  async _onRecalculate(event, target) {
    if (!this.actor) return;
    if (this.calculationMode === "optimized") {
      this._onCalculateOptimized(event, target);
    } else if (this.calculationMode === "approximate") {
      this._onCalculateApproximate(event, target);
    }
  }

  async _onToggleThresholds(event, target) {
    this.thresholdExpanded = !this.thresholdExpanded;

    // Animate container visually without full re-render if possible, or just set flag and re-render
    const container = this.element.querySelector(".S0-calculator-thresholds-container");
    const icon = target.querySelector("i");

    if (container) {
      if (this.thresholdExpanded) {
        container.classList.add("S0-expanded");
        if (icon) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        }
      } else {
        container.classList.remove("S0-expanded");
        if (icon) {
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      }
    }
  }

  async _onOpenSheet(event, target) {
    if (this.actor) {
      this.actor.sheet.render(true);
    }
  }

  async _onApplyExperience(event, target) {
    if (this.actor) {
      ActorUpdater.verifyAndUpdateActor(
        this.actor,
        CharacteristicType.EXPERIENCE.USED,
        this.xpData.total
      );
      NotificationsUtils.success(localize("CONTROL.EXPERIENCE_CALCULATOR_BUTTON.Exp_atribuida_ao_personagem"));
    }
  }
}
