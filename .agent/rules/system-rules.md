---
trigger: always_on
---

# System Rules

## Learning & Knowledge Management
- Sempre que solicitado a "aprender", "registrar aprendizado" ou "lembrar algo":
  1. **Criação:** Gere um arquivo `.md` em `.agent/learnings/` com nome descritivo (ex: `feature-auth-logic.md`).
  2. **Conteúdo:** Documente o Problema, Causa, Solução e Contexto Técnico.
  3. **Indexação:** Imediatamente após criar o arquivo, atualize o arquivo `.agent/learnings/_index.md`. 
     - Adicione uma linha com o link para o arquivo e uma descrição de uma frase.
     - Mantenha o índice organizado por categorias ou ordem cronológica inversa.
  4. **Knowledge Sync:** Se o aprendizado for uma regra de arquitetura ou padrão de código que deve ser seguido globalmente, adicione um resumo desse padrão no arquivo principal de regras ou no `_index.md` da pasta `.agent/docs/`. Se o aprendizado for específico de uma versão do Foundry VTT, certifique-se de indexá-lo na pasta correta (v12 ou v13) para evitar conflitos de API.

## Indexação e Organização
- Sempre que criar ou atualizar um arquivo de documentação ou aprendizado:
  1. Identifique a pasta de destino (ex: v13, v12, learnings ou app).
  2. Atualize o `_index.md` **daquela pasta específica**.
  3. Se for uma categoria nova, verifique se o `docs/_index.md` (raiz) precisa ser atualizado para listar essa nova categoria.
  4. O formato do índice deve ser: `[Nome do Arquivo](caminho/relativo) - Breve descrição da funcionalidade/aprendizado`.
  5. O modelo sugerido de index deve ser:
    
```
# Índice de Documentação - [Versão/Pasta]

| Arquivo | Descrição | Última Atualização |
| :--- | :--- | :--- |
| [setup.md](./setup.md) | Configuração inicial do ambiente Foundry VTT | 14/02/2026 |
| [api-hooks.md](./api-hooks.md) | Referência de hooks de sistema | 14/02/2026 |
```