# Foundry V14: ActiveEffect Changes Schema Migration

## Problema
No Foundry V14 (Release 14.349+, Issue 13740), a propriedade `changes` da documentação de modelo `ActiveEffect` (o Array que armazena os modificadores do efeito) sofreu um *Breaking Change* e foi realocada do root document data para o objeto `system`.
A raiz de acesso que em V12/V13 era `ActiveEffect#changes` passou a ser estritamente `ActiveEffect#system#changes`. Essa quebra afeta silenciosamente utilitários e scripts que criavam efeitos na ficha e passavam o Array de `changes` direto.

## Causa
Evolução nativa da arquitetura do Foundry para transformar `ActiveEffect` em *Primary Documents* com *system data models* padronizados.

## Solução
Implementar uma Factory ou Adapter na saída do Utilitário de Criação (ex: `ActiveEffectsUtils.createEffectData`) e invocar um Formatador que reconheça a versão em uso via `game?.release?.generation >= 14` (runtime safe).
Se estiver num ambiente de migração v14, converte e exclui do root:
```javascript
newData.system = newData.system || {};
newData.system.changes = newData.changes;
delete newData.changes;
```
Se não, retorna o array no root e mantém compatibilidade legada.

## Contexto Técnico
- Document Data Models / Primary Documents
- Foundry VTT v14 / Compatibilidade Backward
- Foundry Api Runtime Version Validation
