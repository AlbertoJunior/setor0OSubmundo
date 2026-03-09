# A "Obrigatoriedade" da Ferramenta Ativa em Scene Controls (Foundry v13)

## Problema
Ao construir a barra lateral (Scene Controls) com `Hooks.on('getSceneControlButtons')`, pode surgir a vontade de criar uma aba de Controle que contenha APENAS botões (como janelas de Configurações, Calculadoras ou Modais) sem nenhuma ferramenta primária "selecionável" no canvas (Aquelas em que você clica e ela fica selecionada como uma sub-ferramenta principal na esquerda).
Para isso, a ideia natural seria não definir a propriedade `activeTool` no objeto de configuração da aba.

## Causa
Entretanto, a engine interna do Foundry v13 (`ui.controls`) possui uma forte dependência ("hardcoded") no ciclo de vida de ativação de suas abas de controle de cena (ex: `#postActivate` dentro do `foundry.js`).
Quando um painel sem a propriedade `activeTool` é clicado, o Foundry tentará processar a ferramenta vazia. Ele chamará propriedades na ferramenta base (como as chamadas disparadoras `onChange` na ferramenta selecionada). Como o `activeTool` retornado é `undefined`, o listener `SceneControl_onToolChange` dispara uma promessa não tratada (`Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'onChange')`) que paralisa a UI e "mata" permanentemente os eventos de click de todos os botões daquela aba para aquela sessão, impedindo inclusive que o usuário clique em configurações ou mude de aba livremente.

Tentativas de definir abas primárias através da injeção limpa de ferramentas "invisíveis" como:
- Dummy Tool configurada na API do Foundry com `visible: false`
- Dummy Tool configurada no painel, mas interceptada em renderização síncrona com `.style.display = 'none'`

Tendem a colapsar também pois inviabilizam a inicialização interna da plataforma. O `visible: false` evita até mesmo que ele puxe a ferramenta nas querys JS.

## Solução e Padrão Adotado
Enquanto a limitação global das dependências do ciclo de vida perdurar na v13, **não será possível livrar o painel inteiramente de uma gambiarra (workaround) visando uma estrutura sem Dummy Tools**.

O sistema Setor 0 O Submundo continuará a utilizar um `tools.none` como uma ferramenta primária (que satisfaz a estrutura de dados V13 e impede crashs) e fará a intervenção em HTML ocultando-a com CSS no método de `onChange` de nível de grupo (o grupo "setor0").
```js
  controls.setor0 = {
    // ...
    activeTool: 'none',
    onChange: (event, active) => {
      // ... Forçamento visual pra esconder da UI sem bloquear eventListeners globais nativos
      const button = document.querySelector(`button[data-action="tool"][data-tool="none"]`);
      if (button) button.classList.add('hidden');
    }
  }
```

## Perspectiva v14
Sugere-se acompanhar os logs do repositório core da Foundry Virtual Tabletop, pois a reestruturação da Application UI é prometida receber extensões naturais na Versão 14. Modos que permitam `"standalone buttons tabs"` possivelmente mitigarão a necessidade deste workaround no futuro.
