import { describe, it, expect, vi } from 'vitest';
import { ActiveEffectsUtils } from '../../../module/core/effect/active-effects-utils.mjs';
import { ActiveEffectsTypes, ActiveEffectType, ActiveEffectsOriginTypes } from '../../../module/enums/active-effects-enums.mjs';
import { SYSTEM_ID } from '../../../module/constants.mjs';
import { ActiveEffectUpdater } from '../../../module/base/updater/active-effect-updater.mjs';

describe('ActiveEffectsUtils', () => {

  it('deve usar o enum ActiveEffectsTypes e ler propriedades de sistema corretamente via getObject (Anti-Hardcode)', () => {
    // Efeito mockado com estrutura V13 (DataModel)
    const mockEffect = {
      system: {
        type: ActiveEffectsTypes.BUFF,
        originId: 'item-123',
        originType: ActiveEffectsOriginTypes.ITEM,
        canRemove: false
      }
    };

    expect(ActiveEffectsUtils.hasType(mockEffect)).toBe(true);
    expect(ActiveEffectsUtils.isBuff(mockEffect)).toBe(true);
    expect(ActiveEffectsUtils.isDebuff(mockEffect)).toBe(false);
    expect(ActiveEffectsUtils.getOriginId(mockEffect)).toBe('item-123');
    expect(ActiveEffectsUtils.getOriginType(mockEffect)).toBe(ActiveEffectsOriginTypes.ITEM);
    expect(ActiveEffectsUtils.canRemoveEffect(mockEffect)).toBe(false);
  });

  it('deve cair no fallback V12 quando as propriedades de sistema não existirem', () => {
    // Efeito mockado com estrutura V12 (Flags)
    const mockEffectLegacy = {
      flags: {
        [SYSTEM_ID]: {
          type: ActiveEffectsTypes.DEBUFF,
          originId: 'legacy-321',
          originType: ActiveEffectsOriginTypes.TRAIT,
          canRemove: true
        }
      }
    };

    expect(ActiveEffectsUtils.hasType(mockEffectLegacy)).toBe(true);
    expect(ActiveEffectsUtils.isBuff(mockEffectLegacy)).toBe(false);
    expect(ActiveEffectsUtils.isDebuff(mockEffectLegacy)).toBe(true);
    expect(ActiveEffectsUtils.getOriginId(mockEffectLegacy)).toBe('legacy-321');
    expect(ActiveEffectsUtils.getOriginType(mockEffectLegacy)).toBe(ActiveEffectsOriginTypes.TRAIT);
    expect(ActiveEffectsUtils.canRemoveEffect(mockEffectLegacy)).toBe(true);
  });

  it('createEffectData deve definir o tipo explicitamente como ActiveEffectType.DEFAULT e mapear fallbacks duplos', () => {
    const params = {
      id: 'custom-effect',
      name: 'Super Força',
      flags: {
        originId: 'origin-123',
        originType: 1
      }
    };

    const result = ActiveEffectsUtils.createEffectData(params);

    // O tipo do Efeito Ativo criado deve ser o do nosso DataModel
    expect(result.type).toBe(ActiveEffectType.DEFAULT);
    expect(result.name).toBe('Super Força');

    // As injeções V13 (System) e V12 (Flags) devem estar simultaneamente corretas
    expect(result.system.originId).toBe('origin-123');
    expect(result.flags[SYSTEM_ID].originId).toBe('origin-123');
  });

  it('deve delegar a ativação/desativação de efeitos para o ActiveEffectUpdater', async () => {
    const mockEffect = {
      update: vi.fn().mockResolvedValue(true)
    };

    // Espionar o chamador original
    const spySetDisabledStatus = vi.spyOn(ActiveEffectUpdater, 'setDisabledStatus').mockResolvedValue();

    await ActiveEffectsUtils.enableEffect(mockEffect);
    expect(spySetDisabledStatus).toHaveBeenCalledWith(mockEffect, false);

    await ActiveEffectsUtils.disableEffect(mockEffect);
    expect(spySetDisabledStatus).toHaveBeenCalledWith(mockEffect, true);

    spySetDisabledStatus.mockRestore();
  });
});
