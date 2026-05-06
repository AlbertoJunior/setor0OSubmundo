# Manual do Sistema - Setor 0 O Submundo

Este manual tem como objetivo guiar jogadores e narradores (Mestres) sobre o funcionamento de ferramentas específicas, atalhos de interface e comandos exclusivos construídos para o sistema de RPG *Setor 0 - O Submundo* no Foundry VTT.

---

## 1. TextEditor Enrichers (Referências Rápidas)

Os TextEditor Enrichers são atalhos que você pode digitar em qualquer caixa de texto rica do Foundry (como Diários/Journals, Histórico de Personagem, Descrição de Itens e no próprio Chat). Quando o texto é salvo ou enviado, o Foundry transforma esses atalhos em links interativos e bonitos!

Atualmente, o sistema suporta marcações para **Traços**.

### 1.1 Marcação de Traços

Você pode referenciar rapidamente qualquer Traço existente no sistema digitando o comando `@Traco` seguido do nome exato do traço ou do ID do traço entre colchetes.

**Sintaxe Básica:**
`@Traco[Nome_do_Traco]` ou `@Traco[ID_do_Traco]`

**Exemplos Reais:**
- `@Traco[Atraente]` -> Gera um link: <i class="fas fa-bookmark"></i> Atraente
- `@Traco[Aliado Excepcional]` -> Gera um link: <i class="fas fa-bookmark"></i> Aliado Excepcional
- `@Traco[1]` -> Se 1 for o ID do traço Atraente, ele vai gerar o mesmo link acima.

Ao clicar nesse link gerado, o sistema abrirá imediatamente a janela de visualização detalhada do traço, contendo sua descrição, XP, particularidades e afins. Isso é extremamente útil ao preparar sessões em Diários!

#### Nome Customizado (Opcional)
Se você quiser que o texto do link seja diferente do nome oficial do traço para encaixar melhor no seu texto, use chaves `{}` logo após os colchetes.

**Sintaxe com Nome Customizado:**
`@Traco[Atraente]{Pessoa Muito Bonita}`

**Resultado:**
O link aparecerá como `<i class="fas fa-bookmark"></i> Pessoa Muito Bonita`, mas ao clicar, continuará abrindo as regras do traço Atraente.
