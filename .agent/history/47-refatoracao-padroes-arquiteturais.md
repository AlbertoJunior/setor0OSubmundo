# Refatoração e Adesão Aos Padrões (v14 Ready)
- Data: 28/03/2026
- Responsável: Agent
- Categorias: Refatoração Core, UI

## Contexto
Durante uma varredura para garantir que os padrões do projeto estavam em conformidade (visando maior facilidade para estabilidade e adoção da versão de longo prazo V14), foram encontrados pequenos vícios legados (`system.xxx`) ignorando a abordagem `No-Hardcoded` imposta, assim como estilos em linha na interface de atalhos.

## Alterações Realizadas
1. **Interface de Atalhos HBS (`shortcuts.hbs`)**: Um estilo _inline_ com interpolação Handlebars que configurava esteticamente o atalho Especialista (`border: 2px ridge var(--primary-color-alpha)`) foi removido e substituído atráves da técnica utilitária (CSS-in-Class) via `.S0-border-ridge .S0-border-medium .S0-border-primary-alpha`, mantendo a reatividade e respeitando as Cascade Layers do V13.
2. **Utilitário de CSS**: Injetadas as classes `.S0-border-ridge` e `.S0-border-primary-alpha` requeridas na folha `utilities.css`.
3. **Enumerações (`characteristic-enums.mjs`)**: Foram adicionados e definidos os blocos omissos `MANEUVERS` (`'system.manobras'`) e `OTHERS` (`'system.outros'`) ao enum central `CharacteristicType`.
4. **Isolamento de Escopo (`actor-experience-utils.mjs`)**: Modificado o método formador do proxy de experiência `buildActorDataProxy` (linhas 68-69) para abandonar a recuperação das chaves fixas em código e transicionar ao Enum extrator, prevenindo _silent breaks_ caso o Data Model da v14 seja ajustado.

## Avaliação de Risco sobre Override `v2.mjs`
Fiz um reestudo detalhado da classe fachada de Override e do painel técnico documentado (artigo _foundry-v13-applicationv2-prototype-pollution.md_). Havia sugerido reintroduzir um _mergeObject_, porém isso fatalmente quebraria o App V2. A diretiva da API estipula e comprova que a forma literal sem referência ancestral é a única forma segura que protege contra Poluição de _Prototype_, delegando o _Deep Clone_ de herança para o V2 Framework Core. Em respeito à criticidade arquitetural, a fachada foi intencionalmente mantida como base sólida.
