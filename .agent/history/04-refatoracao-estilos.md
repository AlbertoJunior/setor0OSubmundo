# 04 - Refatoração de Estilos CSS

**Data:** 2026-02-13
**Tipo:** Refatoração de código (Feito na versão FAST do Gemini 3 Pro High)

## Contexto
O arquivo `styles/system-styles.css` estava monolítico, contendo mais de 1500 linhas, misturando definições de variáveis, layouts, e estilos específicos de componentes. Isso dificultava a manutenção e a legibilidade. Além disso, identificou-se a necessidade de padronizar valores "hardcoded" (magic numbers) e organizar melhor os overrides do Foundry.

## O que foi feito

### Modularização dos Estilos
O arquivo `system-styles.css` foi removido e seu conteúdo foi distribuído em novos arquivos focados em responsabilidades específicas:

1.  **`styles/variables.css`**: Contém todas as variáveis CSS globais (`:root`, `body`), cores, fontes e z-indexes.
2.  **`styles/styles-base.css`**: Define estilos base de layout, tipografia geral e containers padrão da ficha.
3.  **`styles/components/styles-actor.css`**: Estilos específicos para a ficha de ator (personagem).
4.  **`styles/components/styles-items.css`**: Estilos para itens, inventário, equipamentos e aprimoramentos.
5.  **`styles/components/styles-chat.css`**: Estilos para as mensagens de chat e resultados de rolagem.
6.  **`styles/components/styles-dialog.css`**: Estilos para diálogos e botões.

### Padronização e Limpeza
-   **Criação de novas variáveis**:
    -   `--border-def`: Para padronizar bordas de containers.
    -   `--z-index-*`: Para organizar camadas de sobreposição (dropdown, tooltip, modal).
-   **Remoção de Código Duplicado**: O arquivo `styles/edit-foundry-styles.css` foi revisado e regras redundantes (como redefinição de background em hover) foram removidas.

### Atualização do Sistema
-   **`system.json`**: A lista de estilos foi atualizada para carregar os novos arquivos na ordem correta, garantindo a cascata de estilos apropriada.

## Arquivos Criados
-   `styles/variables.css`
-   `styles/styles-base.css`
-   `styles/components/styles-actor.css`
-   `styles/components/styles-items.css`
-   `styles/components/styles-chat.css`
-   `styles/components/styles-dialog.css`

## Arquivos Removidos
-   `styles/system-styles.css`

## Arquivos Modificados
-   `system.json`
-   `styles/edit-foundry-styles.css`
