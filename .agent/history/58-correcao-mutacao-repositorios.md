# 58 - Correção: Mutação de Estado Compartilhado nos Repositórios

**Data:** 2026-06-19

## O que foi feito

Corrigido bug onde traços (Traços) com particularidade compartilhavam valores entre personagens diferentes. A causa raiz era mutação direta dos objetos estáticos do repositório através do método `#mountTraitObject` no `TraitDialog`.

A correção foi aplicada em duas camadas:
1. **Camada 1 (Repositórios):** Os métodos de busca individual (`getItemByTypeAndId`, `getEnhancementById`, `getEnhancementEffectById`) agora retornam `deepClone` dos objetos, impedindo mutação acidental por qualquer consumidor futuro.
2. **Camada 2 (Consumidor):** O `TraitDialog.#mountTraitObject` agora cria uma cópia shallow (`{ ...foundTrait }`) antes de modificar a propriedade `particularity`.

## Arquivos alterados

| Arquivo | Alteração |
| :--- | :--- |
| `module/repository/trait-repository.mjs` | Adicionado import `FoundryApi`; `getItemByTypeAndId` retorna `deepClone` |
| `module/repository/superequipment-trait-repository.mjs` | Adicionado import `FoundryApi`; `getItemByTypeAndId` retorna `deepClone` |
| `module/repository/enhancement-repository.mjs` | `getEnhancementById` e `getEnhancementEffectById` retornam `deepClone` |
| `module/creators/dialog/trait-dialog.mjs` | `#mountTraitObject` usa spread copy antes de mutar |

## Decisões técnicas

- **Defesa em profundidade:** Corrigir apenas o consumidor resolveria o bug atual, mas não protegeria contra futuros consumidores que façam o mesmo erro. A proteção no repositório é preventiva.
- **Padrão existente seguido:** `AbilityRepository.getItem()`, `SubstanceEffectRepository.getItem()` e `EnhancementRepository.getEnhancementFamilyByEffectId()` já usavam `deepClone` — apenas alinhamos os demais.
- **Métodos de lista (`getItems`, `getItemsByType`) não foram alterados:** Retornam arrays novos via spread, mas os objetos internos são referências diretas. Isso é aceitável porque esses métodos são usados para renderização (leitura) e não para mutação. A proteção via `deepClone` nos métodos de busca individual é suficiente.

## Testes sugeridos

1. Personagem A adiciona traço "Atormentado" com particularidade "Segredo do A"
2. Personagem B adiciona "Atormentado" → particularidade deve estar vazia
3. Preencher particularidade no B com "Segredo do B" → no A deve continuar "Segredo do A"
4. Repetir com traço bom "Aliado Excepcional"
5. Verificar SuperEquipamentos com particularidade TEXT
