# Limitações de Importação Dinâmica no Foundry VTT

**Data:** 14/02/2026
**Contexto:** Foundry VTT v12/v13
**Agente:** Antigravity Agent

## O Problema
Em um ambiente de desenvolvimento de sistemas para Foundry VTT que utiliza módulos ES nativos (sem um passo de build como Vite ou Webpack), não é possível realizar "glob imports" ou varredura de diretórios em tempo de execução de forma segura para os jogadores.

O objetivo era carregar automaticamente todos os arquivos de helpers do Handlebars de uma pasta `module/helpers/`, evitando a necessidade de manter uma lista manual de strings com os nomes dos arquivos.

## A Limitação Técnica
1.  **Browser Environment:** Browsers não têm acesso ao sistema de arquivos para listar o conteúdo de uma pasta (e.g., `fs.readdir` não existe).
2.  **FilePicker API:** O Foundry VTT possui a API `FilePicker` que permite listar arquivos, mas ela exige permissão de "Browse Files". Jogadores normalmente não possuem essa permissão, o que faria com que o sistema falhasse ao carregar para eles.
3.  **ES Modules:** A especificação ES Modules não suporta importação de diretórios ou coringas (`import * from './helpers/*.mjs'`) nativamente. Isso é uma feature de bundlers.

## A Solução Proposta (Rejeitada)
A proposta foi criar um arquivo `index.mjs` que exportasse todos os helpers, centralizando as importações.
Exemplo:
```javascript
// module/helpers/index.mjs
export { default as helper1 } from './helper1.mjs';
export { default as helper2 } from './helper2.mjs';
```
E então importar e iterar sobre esse objeto no carregador.

## Decisão
Foi decidido **não implementar** o `index.mjs` neste momento. O motivo é que, sem o ganho real da importação dinâmica automática (que dispensaria qualquer edição manual ao criar um arquivo novo), a criação de um arquivo de índice apenas adiciona uma camada extra de exports manuais que pode causar confusão futura sem trazer um benefício significativo de automação.

## Futuro
Esta decisão deve ser reavaliada se:
1.  O projeto adotar um passo de build (Build Step) com ferramentas como **Vite** ou **Rollup**, que suportam `import.meta.glob`.
2.  O Foundry VTT implementar uma nova API ou método seguro para carregamento dinâmico de módulos de sistema que não dependa de permissões de FilePicker.
