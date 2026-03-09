# Limpeza e Otimização da Documentação v13

## O que foi feito
1. O diretório `.agent/docs/v13/` continha 1.697 arquivos `html` originais somando aproximadamente 104 MB, contendo sidebars, estilos inline, scripts compilados e incontáveis `<svg>` inuteis.
2. Como o processamento via Agent (LLM) seria demorado e custoso (~26 milhões de tokens) foi elaborado um script local em ambiente Node.js.
3. O Script varreu tudo recursivamente e extraiu apenas a `<div class="col-content">` via Regex de cada HTML, mantendo os links, descrições e comentários de código limpos e removendo `scripts`, `styles` e `svgs`.
4. Os novos arquivos foram persistidos em `.agent/docs/v13-clean/`, simulando o ambiente offline muito mais "Agent-Friendly" com uma redução para 78MB sem lixo visual.
5. O Script utilitário local `clean-docs.mjs` foi automaticamente deletado após o sucesso da aplicação.

## Arquivos Alterados / Inseridos
- `c:\Users\jrdap\AppData\Local\FoundryVTT\Data\systems\setor0OSubmundo\.agent\docs\v13-clean\` (1.697 novos documentos limpos).
- `.agent/history/36-limpeza-docs-v13.md` (Este arquivo de histórico)
- `.agent/history/_index.md` (Entrada adicionada)

## Decisões Técnicas
- **Zero Token Cleanup**: Ao invés de delegar o `parsing` ao LLM utilizando prompt, o que causaria longas travas na requisição e uso exagerado de input context, a decisão técnica foi de auto-execução de scripts locais com Regex, sendo a abordagem mais barata e rápida e escalável para cenários similares futuros.
- **V13 Clean Source**: Futuras consultas na base do V13 podem focar exclusivamente na base limpa para economizar o window reading.

## Testes Sugeridos
- Validar a leitura e interpretação de um arquivo no `v13-clean` qualquer pelas ferramentas do Agente no futuro (Ex: acessar `interfaces/CONFIG.DiceFulfillmentMethod.html`) para atestar facilidade de leitura e extração de propriedades e retornos.
