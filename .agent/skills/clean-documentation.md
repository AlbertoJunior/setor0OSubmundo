---
name: "clean-documentation"
description: "Limpa arquivos HTML de documentação, removendo conteúdo desnecessário (SVG/HTML) e otimizando para IA context."
scope: "workspace"
---

## Uso

```bash
clean-documentation <path> [--output <path>]
```

## Opções

- `--output <path>`: Salva os arquivos limpos em um diretório diferente, útil para preservar os dados originais.

## Etapas de Interação com o Usuário

1. Antes de invocar o comando de limpeza, **sempre pergunte** ao usuário:
   *"Onde você deseja armazenar a saída? Mesma pasta ou nova pasta?"*

2. Interpretando a resposta:
   - Se a resposta indicar **"mesma pasta"** (ou substituição in-place): Processe *sem* usar a flag `--output` (ex: `node .agent/scripts/clean-documentation.mjs v14`).
   - Se a resposta for **"nova pasta"** mas não houver um nome definido: Defina a flag com o sufixo `-cleaned` (ex: `--output v14-cleaned`).
   - Se a resposta trouxer um **nome detalhado** ou específico: Defina a flag com esse exato nome (ex: `--output pastasuperlimpa`).

## Instruções de Execução (Para o Agente)

Sempre que foi solicitado o uso desta "skill", ou sempre que você (Agente) decidir limpar uma nova base de documentação HTML, **NÃO tente ler ou parsear o HTML sozinho**. 

Ao invés disso, você DEVE executar via terminal (usando a ferramenta de bash/powershell) o script local encarregado dessa função:
```bash
node .agent/scripts/clean-documentation.mjs <path>
```
*Observação: A versão atual do script local `.mjs` nativamente já opera de forma recursiva e salva na mesma estrutura de pastas, logo flags como `--recursive` ou `--output` podem ser ignoradas nas chamadas atuais, precisando focar apenas em repassar a pasta alvo (ex: `v13`, `v14`, etc).*