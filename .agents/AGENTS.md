# Diretrizes do Setor 0 - O Submundo

Este projeto possui um repositório interno dedicado a fornecer contexto, histórico e regras para você (o agente de IA). Ele está localizado na pasta `.agent`.

**AÇÕES OBRIGATÓRIAS:**
1. Sempre que iniciar uma nova tarefa ou tiver dúvidas sobre o comportamento esperado neste projeto, verifique os arquivos dentro da pasta `.agent/rules/`. As regras contidas lá são absolutas.
2. Ao finalizar qualquer tarefa, você **DEVE** ler o arquivo `.agent/rules/update-agent.md` e executar a regra de versionamento descrita nele (criar o histórico da feature e fazer o commit na pasta `.agent`).
3. Antes de modificar a arquitetura ou o código core do sistema, consulte a pasta `.agent/learnings/` para garantir que você não violará nenhum padrão do projeto.
4. Para evitar refazer trabalhos ou para encontrar como algo foi implementado anteriormente, consulte a pasta `.agent/history/`. Isso ajuda a localizar arquivos relevantes e entender o contexto de decisões passadas.
