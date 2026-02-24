# Setor 0 RPG para o Foundry VTT
[🌐 Site oficial do Setor 0](https://setor0rpg.com.br)

![Status: Alpha](https://img.shields.io/badge/status-alpha-orange)
![Foundry v13](https://img.shields.io/badge/foundry-v13-orange)
![Foundry v12](https://img.shields.io/badge/foundry-v12-green)
![License: Custom](https://img.shields.io/badge/license-custom-blue)
![PT-BR](https://img.shields.io/badge/lang-pt--br-green)
![EN](https://img.shields.io/badge/lang-en-orange)

---

Este é o sistema oficial de RPG **Setor 0**, totalmente integrado ao **Foundry VTT**, oferecendo suporte nativo para criação de personagens, rolagens personalizadas, efeitos automatizados e muito mais.

> ⚠️ **Aviso**: Este sistema está atualmente em fase **Alpha**, e pode conter bugs ou funcionalidades incompletas.

## 🧩 Como usar

### Instalação

1. Baixe ou clone este repositório.
2. Mova a pasta para o diretório `Data/systems` do seu Foundry VTT.
3. A pasta deve ter o nome `setor0OSubmundo`, exatamente dessa forma.
    ```text
    setor0OSubmundo
    ```
4. Se não aparecer, reinicie o Foundry.
5. Crie um novo mundo com o sistema.

  > 🚧 Ainda será disponibilizado um manifesto para instalação direta via URL.

### Compartilhando com seus jogadores
Caso você não possua um servidor para hospedar o Foundry e compartilhar o link, você pode criar um `QuickTunnel` com o `CloudFlare`. Da seguinte maneira:

1. Baixe e instale o [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
2. Configure ele como variável de ambiente com o nome `cloudflared`.
    1. Se for preciso, peça ajuda a alguma IA para fazer essa etapa.
3. Abra seu `Prompt de Comando`.
4. Execute o código.
    ```console
    cloudflared tunnel --url http://localhost:30000
    ```
5. Pegue o link que foi apresentado no console e compartilhe.

## Legenda de ícones
<details>

    🧩 Instalação
    🧬 Funcionalidades
    🎨 Interfaces de Usuário
    📜 Licença
    🤝 Contribuindo
    ✅ Pronto
    ⚠️ Aviso
    🛠️ Em desenvolvimento
    🚧 Planejado

</details>

## 🧬 Funcionalidades
<details>
  <summary>Idiomas suportados</summary>
  
    ✅ Português
    🚧 English
</details>

### Personagens

#### Jogador (PJ)
* 🚧 Bônus de Nível 6.
* ✅ Aprimoramentos com efeitos passivos e ativos.
* ✅ Sistema de inventário com mochila e itens equipados.
* ✅ Atalhos customizados por Personagem.
* ✅ Morfologia (Humano, Ciborgue, Androide, Sintético).
* ✅ Fama e Influência.
* 🚧 Transacionar itens entre personagens.
* 🚧 Importar personagem do site.
* 🚧 Calculo de XP e pontos utilizados.

#### Não Jogáveis (PNJ)
* ✅ Ficha.
* ✅ Rolagem.
* ✅ Equipamentos.
* ✅ Converter Personagem Jogável (PJ) para PNJ.

### Sistemas
* ✅ Aprimoramentos.
* ✅ Traços Bons e Ruins.
* ✅ Inventário.
* ✅ SuperEquipamentos.
* ✅ Atalhos.
* ✅ Aliados e Informantes.

### Efeitos
* ✅ Efeitos específicos do Setor 0.
* ✅ Efeitos ativos baseado em Aprimoramentos.
* ✅ Efeitos ativos baseado em Traços.
* ✅ Efeitos ativos baseado em Equipamentos.
* ✅ Efeitos que são ativados durante um combate são desativados automaticamente ao final dele.

### Equipamentos
* ✅ Ficha.
* ✅ SuperEquipamentos.
* ✅ Rolagem pelo Equipamento.
* ✅ Rolagem dividida pelo Equipamento.
* ✅ Atalhos customizados por Equipamento.
* ✅ Exibição detalhada no chat com acesso rápido á Ficha.

### Rolagens
* ✅ Padrão (Atributos + Habilidade).
* ✅ Padrão (Dividida).
* ✅ Virtudes.
* ✅ Simplificada.
* ✅ Simplificada (Personagens Não Jogáveis).
* ✅ Customizada.
* ✅ Sobrecarga.
* ✅ Vida.
* ✅ Iniciativa.
* ✅ Perseverança (pelo chat).
* ✅ Rolagem com Crítico variável.
* ✅ Rolagem com Especialização.
* ✅ Rolagens considerando as penalidades e todos os bônus.

### Tokens
* 🚧 Ocultar efeitos ativos de Tokens inimigos (implementar a classe BasePlaceableHUD).

### Compêndio
* ✅ Carregar compêndio.
* ✅ Imagens.
* 🚧 Compêndio base do sistema.
* 🚧 Inimigos.
* ✅ Armas (Armas Brancas e Armas de Projeção).
  * ✅ Armas Brancas.
  * ✅ Armas de Projeção.
* ✅ Veículos.
* ✅ Substâncias.
* 🚧 Traços de SuperEquipamentos.

<details>
  <summary>Como exportar</summary>

  É possível exportar o compêndio utilizando o seguinte comando:
  ```js
  setor0OSubmundo.MacroMethods.exportCompendium()
  ```
  
  Após executar o código, será perguntando onde você deseja salvar o Zip que contém todos os elementos que estavam nos compêndios.

  Ou então, como GM, clicando no botão do Setor 0 no menu de Sistemas e selecionando a opção de Exportar Compêndio.
</details>

<details>
  <summary>Como importar</summary>

  Por padrão o sistema sempre vai tentar buscar os compêndios que estão na pasta do sistema: `./packs/src/*`, o Zip que é gerado  já vem com a estrutura de pastas correta para ser extraido dentro de `src`.

  ```text
  systems/
  └── setor0OSubmundo/
      └── packs/
          └── src/
              ├── enhancements/
              ├── inimigos/
              ├── itens/
              ├── macros/
              ├── personagens/
              └── tracos/
  ```
  
</details>

<details>
  <summary>Como resetar</summary>

  Caso queira resetar o compendium já carregado, como GM, clicando no botão do Setor 0 no menu de Sistemas e selecionando a opção de apagar e Recarregar Compêndios.

</details>


### Macros
O Setor 0 conta com um sistema de Macros pré-definidos para novos jogadores. Todo novo jogador recebe em sua Hotbar 3 macros iniciais, dois deles servem para abrir a ficha do Personagem em uma página específica, como a da `mochila` ou dos `atalhos`, o terceiro serve para realizar um teste de `Sobrecarga`, que é comum no sistema.

* ✅ Macros iniciais pré-configurados para novos jogadores.
* ✅ Compendium de Macros para Mestres e Jogadores.
* ✅ Funções padrão para criar novos Macros

<details>
  <summary>Métodos Globais para Macros</summary>
  
  ```mjs
  globalThis.setor0OSubmundo.MacroMethods {
     overload: async (actor) => {
        // recebe um Actor e executa uma rolagem de Sobrecarga (enviando no chat)
     },
     customs: {
        rollable: async (actor, rollTestId) => {
            // recebe um Actor e um id referente a um RollTestData e realiza a rolagem (enviando no chat)
        }
     }
     ...
  }
  ```
</details>

<details>
  <summary>Como usar os métodos</summary>
  
  - Ao criar o commando do macro, utilize o seguinte código:
  
  ```mjs
  globalThis.setor0OSubmundo.MacroMethods.rollable(actor, rollId);
  ```

  - Um Exemplo de uso real:
  
  ```js
  const selectedToken = canvas.tokens.controlled[0];
  if (!selectedToken) {
    ui.notifications.warn("Selecione um token primeiro.");
    return;
  }
  
  const actor = selectedToken.actor;
  if(!actor?.sheet.canRollOrEdit) {
    ui.notifications.warn("Sem permissão para esse personagem.");
    return;
  }
  
  await globalThis.setor0OSubmundo.MacroMethods.customs.rollable({actor, id: "642750db952e4aed87227edcf74bc05e"});
  ```
</details>

## 🎨 Interfaces de Usuário
<details>

- ✅ Tema escuro para fichas de Personagens.
- ✅ Botões compactos na ficha de Personagem.
- ✅ Botões compactos na ficha de Items.
- ✅ Botões compactos nos cabeçalhos.
- 🛠️ Tradução de alguns elementos do Foundry.
- ✅ Suporte a Application V2 do Foundry.
</details>

### Telas
<details>
    <summary>Ficha de Personagem</summary>

  ![](imgs/screenshots/sheet-unedit-page1.jpeg)
  ![](imgs/screenshots/sheet-inedit-page1.jpeg)
  ![](imgs/screenshots/sheet-enhancements.jpeg)
  ![](imgs/screenshots/sheet-bag.jpeg)
</details>

<details>
    <summary>Ficha de Equipamento</summary>

  ![](imgs/screenshots/add_equipment.jpeg)
  ![](imgs/screenshots/sheet-equipment_edit_and_add_roll.jpeg)
</details>

<details>
  <summary>Rolagens</summary>

  ![](imgs/screenshots/roll_attribute.jpeg)
  ![](imgs/screenshots/roll_virtue.jpeg)
</details>

## 📜 Licença

Este projeto está licenciado sob uma **Licença Personalizada com Todos os Direitos Reservados**.  
O uso, redistribuição e modificação do código exigem autorização prévia do autor.  
Consulte o arquivo [`LICENSE`](./LICENSE) para mais detalhes.

## 🤝 Contribuindo

Este é um projeto com direitos reservados.  
Sugestões, correções e contribuições são bem-vindas, mas devem ser discutidas e aprovadas previamente.  
Se você deseja contribuir, entre em contato pelos canais oficiais ou abra uma issue neste repositório.
Consulte o arquivo [`CONTRIBUTING`](./CONTRIBUTING.md) para mais detalhes.

---
## ⚠️ P.S.

Desenvolvimento: 90% dedicação, 5% gambiarras e 5% que provavelmente estão perdidos por aí —  
afinal, nem todo Aprimoramento precisa ser balanceado. Fiquem atentos, mas se der pau, é feature. Se funcionar, foi planejado.  
Bem-vindo ao **Setor 0**.

E só pra facilitar... podem usar **Perseverança**. 😉