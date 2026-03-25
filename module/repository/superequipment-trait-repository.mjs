import { SYSTEM_ID } from "../constants.mjs";
import { CharacteristicType } from "../enums/characteristic-enums.mjs";
import { SuperEquipmentParticularityType } from "../enums/equipment-enums.mjs";
import { StandardEffectChangeField } from "../data/field/effect-fields.mjs";
import { SuperEquipmentTraitField } from "../data/field/equipment-field.mjs";

export class SuperEquipmentTraitRepository {
  static #goodTrait = [
    SuperEquipmentTraitField.toJson({
      id: 'good1',
      name: '+1 Dado',
      cost: 1,
      limit: 2,
      description: 'Para alguma Habilidade não combativa.',
      particularity: {
        type: SuperEquipmentParticularityType.SKILL,
        change: StandardEffectChangeField.toJson({ value: 1 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good2',
      name: '+8 de Alcance',
      cost: 1,
      limit: 3,
      description: 'Para itens que usem pojéteis.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good3',
      name: '+1 de Resistência (Proteção)',
      cost: 1,
      limit: 2,
      description: 'Para Equipamentos de Proteção'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good4',
      name: '-1 Ponto de Movimento para Recarregar',
      cost: 1,
      limit: 2,
      description: 'Qualquer item que seja necessário recarregar, como Armas de Projeção, Armas a Laser, entre outros.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good5',
      name: '+2 de Resistência',
      cost: 1,
      limit: 2,
      description: 'Para Armas de Projeção, Veículos e SuperEquipamentos.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good6',
      name: 'Compacto',
      cost: 1,
      limit: 2,
      description: 'Diminui o grau de Ocultação/Ocultabilidade do item.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good7',
      name: 'Efeito Diverso',
      cost: 1,
      limit: 3,
      description: 'Efeito negociável com o narrador. É recomendado procurar por SuperEquipamentos já existentes para ter ideias.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good8',
      name: 'Substituir algum membro ou órgão',
      cost: 1,
      limit: 1,
      description: 'Funciona como uma prótese.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good80',
      name: '+2 Pontos de Movimento',
      cost: 1,
      limit: 2,
      description: 'Aumenta em 2 os Pontos de Movimento.',
      particularity: {
        type: SuperEquipmentParticularityType.FIXED,
        description: '+2 Pontos de Movimento',
        change: StandardEffectChangeField.toJson({ key: CharacteristicType.BONUS.PM.system, value: 2 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good9',
      name: '+1 Aceleração ou Velocidade Máxima',
      cost: 2,
      limit: 3,
      description: 'Para Veículos.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good10',
      name: '+1 Cadência',
      cost: 2,
      limit: 2,
      description: 'Aumenta em 1 a Cadência (CdD) das Armas de Projeção.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good11',
      name: '+1 Dano',
      cost: 2,
      limit: 2,
      description: 'Para Armas Brancas, Armas de Projeção, ou qualquer outro item que seja usado para causar dano.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good12',
      name: '+1 Dificuldade de Hacking',
      cost: 2,
      limit: 3,
      description: 'Aumenta a Dificuldade para ser Hackeado. A Dificuldade máxima é 9.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good13',
      name: 'Efeito Diverso',
      cost: 2,
      limit: 3,
      description: 'Efeito negociável com o narrador. É recomendado procurar por SuperEquipamentos já existentes para ter ideias.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good14',
      name: 'Tipo de Dano',
      cost: 2,
      limit: 1,
      description: 'Aplica um atributo elemental ao dano causado por armas, podendo ser Elétrico, Incendiário ou Congelante',
      particularity: {
        type: SuperEquipmentParticularityType.DAMAGE_TYPE
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good15',
      name: '+1 Dano Automático',
      cost: 3,
      limit: 2,
      description: 'Causa Dano Automático.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good16',
      name: '-1 Dificuldade',
      cost: 3,
      limit: 3,
      description: 'Diminui em 1 a Dificuldade dos testes enquanto estiver usando este item. A Dificuldade mínima é 5.',
      particularity: {
        type: SuperEquipmentParticularityType.SKILL
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good17',
      name: '+2 Atributo',
      cost: 3,
      limit: 3,
      description: 'Temporariamente aumenta em 2 um Atributo escolhido.',
      particularity: {
        type: SuperEquipmentParticularityType.ATTRIBUTE,
        change: StandardEffectChangeField.toJson({ value: 2 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good18',
      name: 'Efeito Diverso',
      cost: 3,
      limit: 3,
      description: 'Efeito negociável com o narrador. É recomendado procurar por SuperEquipamentos já existentes para ter ideias.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'good19',
      name: '-1 Dificuldade para Sucessos Crítico',
      cost: 4,
      limit: 1,
      description: 'Habilidade pré-definida (dif. Mínima 7)',
      particularity: {
        type: SuperEquipmentParticularityType.SKILL
      }
    }),
  ];

  static #badTrait = [
    SuperEquipmentTraitField.toJson({
      id: 'bad1',
      name: 'Barulhento',
      cost: 1,
      limit: 1,
      description: 'Este SuperEquipamento sempre que estiver em uso faz muito barulho e pode chamar a atenção.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad2',
      name: 'Defeito Diverso',
      cost: 1,
      limit: 2,
      description: 'Defeito negociável com o narrador. É recomendado procurar por SuperEquipamentos já existentes para ter ideias.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad3',
      name: 'Má Reputação',
      cost: 1,
      limit: 1,
      description: 'Sempre que usar este SuperEquipamento será mal visto por outros seres que conhecem a Má Reputação deste item. Seja por ele ter sido roubado de alguém importante ou ter algum estigma associado, qualquer coisa é válida.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad4',
      name: 'Restrição de uso',
      cost: 1,
      limit: 1,
      description: 'Defina com o narrador alguma situação ou cenário que este SuperEquipamento não pode ser utilizado.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad5',
      name: '-1 de Cadência',
      cost: 1,
      limit: 2,
      description: 'Para Armas de Projeção. O valor mínimo para a Cadência é 1.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad6',
      name: '-2 de Capacidade',
      cost: 1,
      limit: 2,
      description: 'Para Armas de Projeção. O valor mínimo para a Capacidade é 1.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad7',
      name: '-2 de Resistência',
      cost: 1,
      limit: 2,
      description: 'Diminui a Resistência em 2. O valor mínimo para a Resistência é 1.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad8',
      name: '-2 no Ataque (Corpo-a-Corpo)',
      cost: 1,
      limit: 2,
      description: 'Diminui dois Dados do Ataque Corpo-a-Corpo do usuário.',
      particularity: {
        type: SuperEquipmentParticularityType.FIXED,
        description: '-2 no Ataque (Corpo-a-Corpo)',
        change: StandardEffectChangeField.toJson({ key: CharacteristicType.BONUS.OFENSIVE_MELEE.system, value: -2 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad9',
      name: '-2 no Ataque (Armas de Projeção)',
      cost: 1,
      limit: 2,
      description: 'Diminui dois Dados do Ataque com Armas de Projeção do usuário.',
      particularity: {
        type: SuperEquipmentParticularityType.FIXED,
        description: '-2 no Ataque (Armas de Projeção)',
        change: StandardEffectChangeField.toJson({ key: CharacteristicType.BONUS.OFENSIVE_PROJECTILE.system, value: -2 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad10',
      name: '-2 na Defesa',
      cost: 1,
      limit: 2,
      description: 'Diminui dois Dados da Defesa do usuário.',
      particularity: {
        type: SuperEquipmentParticularityType.FIXED,
        description: '-2 na Defesa',
        change: StandardEffectChangeField.toJson({ key: CharacteristicType.BONUS.DEFENSIVE.system, value: -2 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad11',
      name: '-3 Pontos de Movimento para recarregar',
      cost: 1,
      limit: 2,
      description: 'Precisa ser recarregado custando 3 Pontos de Movimentos a mais. Se não for uma Arma de Projeção, precisa ser recarregado a cada dois usos.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad12',
      name: '+1 na Dificuldade de uso',
      cost: 2,
      limit: 2,
      description: 'Aumenta a Dificuldade para usar o SuperEquipamento em 1. A Dificuldade máxima é 10.',
      particularity: {
        type: SuperEquipmentParticularityType.SKILL
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad13',
      name: '-1 na Dificuldade para ser Hackeado',
      cost: 2,
      limit: 1,
      description: 'Diminui a Dificuldade para ser Hackeado. A Dificuldade mínima é 5.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad14',
      name: 'Requer teste de Sobrecarga',
      need_activate: true,
      cost: 2,
      limit: 2,
      description: 'Para utilizar os Efeitos do SuperEquipamento o usuário precisa ativá-lo com um Teste de Sobrecarga. Fica ativo pela cena.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad15',
      name: '-4 no Ataque (Corpo-a-Corpo)',
      cost: 2,
      limit: 1,
      description: 'Diminui quatro Dados do Ataque Corpo-a-Corpo do usuário.',
      particularity: {
        type: SuperEquipmentParticularityType.FIXED,
        description: '-4 no Ataque (Corpo-a-Corpo)',
        change: StandardEffectChangeField.toJson({ key: CharacteristicType.BONUS.OFENSIVE_MELEE.system, value: -4 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad16',
      name: '-4 no Ataque (Armas de Projeção)',
      cost: 2,
      limit: 1,
      description: 'Diminui quatro Dados do Ataque com Armas de Projeção do usuário.',
      particularity: {
        type: SuperEquipmentParticularityType.FIXED,
        description: '-4 no Ataque (Armas de Projeção)',
        change: StandardEffectChangeField.toJson({ key: CharacteristicType.BONUS.OFENSIVE_PROJECTILE.system, value: -4 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad17',
      name: '-4 na Defesa',
      cost: 2,
      limit: 1,
      description: 'Diminui quatro Dados da Defesa do usuário.',
      particularity: {
        type: SuperEquipmentParticularityType.FIXED,
        description: '-4 na Defesa',
        change: StandardEffectChangeField.toJson({ key: CharacteristicType.BONUS.DEFENSIVE.system, value: -4 }),
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad18',
      name: 'Atrai atenção indesejada',
      cost: 3,
      limit: 1,
      description: 'Sempre que o SuperEquipamento estiver visível, o narrador pode pedir um Teste de Procurado.',
      particularity: {
        type: SuperEquipmentParticularityType.TEXT
      }
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad19',
      name: 'Sofre 2 de Dano Letal',
      need_activate: true,
      cost: 3,
      limit: 2,
      description: 'Para utilizar os Efeitos do SuperEquipamento o usuário precisa ativá-lo e sofre 2 de Dano Letal Automático. Fica ativo pela cena.'
    }),
    SuperEquipmentTraitField.toJson({
      id: 'bad20',
      name: 'Defeituoso',
      need_activate: true,
      cost: 4,
      limit: 1,
      description: 'Para ativar teste com 1 dado Dificuldade 8'
    }),
  ];

  static #loadedGoodFromPack = [];
  static #loadedBadFromPack = [];

  static async _loadFromPack() {
    const compendium = (await game.packs.get(`${SYSTEM_ID}.superequipmenttraits`)?.getDocuments());
    if (!compendium) {
      return;
    }

    const good = [];
    const bad = [];

    for (const item of compendium) {
      const { id, name, cost, limit, description, particularity, type } = item;
      const trait = { id, name, cost, limit, description, particularity };

      if (type === 'good') {
        good.push(trait);
      } else if (type === 'bad') {
        bad.push(trait);
      }
    }

    SuperEquipmentTraitRepository.#loadedGoodFromPack = good;
    SuperEquipmentTraitRepository.#loadedBadFromPack = bad;
  }

  static getGoodTraits() {
    return [
      ...SuperEquipmentTraitRepository.#goodTrait,
      ...SuperEquipmentTraitRepository.#loadedGoodFromPack
    ];
  }

  static getBadTraits() {
    return [
      ...SuperEquipmentTraitRepository.#badTrait,
      ...SuperEquipmentTraitRepository.#loadedBadFromPack
    ];
  }

  static getItemsByType(type) {
    const items = type === 'good' ? this.getGoodTraits() : this.getBadTraits();
    return items.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
  }

  static getItemByTypeAndId(type, traitId) {
    return this.getItemsByType(type).find(element => element.id == traitId);
  }

  static getTraitsNeedActivate() {
    return [
      ...this.getGoodTraits(),
      ...this.getBadTraits(),
    ].filter(trait => trait.need_activate);
  }
}