# Contribuindo para o Setor 0

Olá, e obrigado por se interessar em contribuir com o sistema `Setor 0 - O Submundo` para o Foundry VTT!

Este é um projeto com direitos autorais protegidos e licença personalizada.  
Isso significa que nem tudo pode ser modificado ou redistribuído livremente, mas contribuições são **muito bem-vindas**, desde que feitas com responsabilidade e com nossa autorização prévia.

---

## 🧠 O que você pode fazer

- Reportar bugs ou comportamentos estranhos.
- Sugerir novas funcionalidades ou ajustes no sistema.
- Criar issues para discutir melhorias ou ideias.
- Criar pull requests com correções ou melhorias **mas serão avaliados e até discutidos previamente antes de serem aprovados ou recusados.**

---

## 🚫 O que você **não** deve fazer

- Criar forks públicos do sistema com alterações significativas sem autorização.
- Redistribuir, publicar ou modificar o sistema em outro repositório.
- Usar o conteúdo (como regras, ambientação ou imagens) para criar outro sistema derivado.

---

## ✅ Como contribuir (passo a passo)

1. [Abra uma issue](https://github.com/AlbertoJunior/setor0OSubmundo/issues) com o que deseja relatar ou sugerir.
2. Aguarde o feedback. Se aprovado, você pode:
   - Enviar um pull request com a melhoria.
   - Ou continuar a discussão para alinhar melhor a proposta.
3. Ao clonar o repositório, execute `npm install` na raiz para instalar as dependências necessárias (como o framework de testes).
4. Siga os padrões de código e mantenha o estilo do projeto.
5. Sempre teste sua contribuição (rodando os testes unitários locais com `npm test`) antes de enviar!

---

## 🛠️ Estrutura e Ferramentas de Desenvolvimento
Se você pretende contribuir com o código, aqui estão alguns pontos importantes:

### Estrutura de Pastas
<details>
   <summary>module</summary>

   * module/ – Contém todos os códigos referentes ao sistema.
   * module/base – Scripts referentes as fichas (sheet) e atualizações (updater) dos elementos.
   * module/core – Scripts referentes as lógicas do sistema, rolagens, aprimoramentos, efeitos, combate e tudo que precise de lógica.
   * * Modificações em configurações do Foundry normalmente são feitas nesses arquivos, como o combate e token.
   * module/creators – São scripts que servem como utilitários para construção de elemementos, geralmente HBS (HTML).
   * module/enums – Enums que são muito utilizados para referênciar as caracterísiticas dos elementos (Tipos, Atributos, Efeitos...).
   * module/hooks – Todo gerênciamento que envolve Hooks deve ser feito aqui, criando arquivos específicos para cada coisa, como o 'init', 'ready', 'createItem' e outros.
   * module/repository – Tudo que for referente a busca de arquivos e documentos devem estar nessa pasta.
   * module/utils – Qualquer classe utilitária que seja genérica.
</details>

<details>
   <summary>lang</summary>

   * lang/ – Contém os arquivos de tradução para os idiomas
</details>

<details>
   <summary>styles</summary>

   * styles/ – Estilos CSS ou elementos de fonte utilizados na interface.
</details>

<details>
   <summary>templates</summary>

   * templates/ – Todos os elementos .hbs ou .html devem estar nessa pasta, separado em subpasta por tema.
</details>

<details>
   <summary>tests</summary>

   * tests/ – Contém os testes unitários do sistema e lógica de negócio.
</details>

### Padrões e Boas Práticas (Arquitetura V13)
O projeto segue as práticas de arquitetura `Clean Code` mantendo a separação de responsabilidades e, fundamentalmente, aderindo as seguintes regras **obrigatórias**, em função da transição contínua para o Foundry V13:

#### 1. Proibição de Caminhos Fixos (No-Hardcoded)
É estritamente proibido o uso de caminhos textuais fixos (como `'system.atributos.forca'`) espalhados pelo código. Toda e qualquer alteração de dados *Actor* ou *Item* deve ser mapeada em enumeradores de domínio (ex: `CharacteristicType` ou `ItemType`).

- Usamos funções extratoras híbridas, como o utilitário `getObject()`, que recupera as instâncias a partir dos Enums de controle, prevenindo que pequenas refatorações do Data Model quebrem toda a base lógica.

Exemplo arquitetural:
```mjs
export const CharacteristicType = Object.freeze({
   SHORTCUTS: {
      id: 'atalhos',
      system: 'system.atalhos',
   },
});

const current = getObject(actor, CharacteristicType.SHORTCUTS) || [];
current.push(rollable);
await ActorUpdater.verifyAndUpdateActor(actor, CharacteristicType.SHORTCUTS, current);
```

#### 2. Interface, Estilos (S0-) e Application V2
Priorizamos a performance e a arquitetura visual na migração para o Foundry V13:
- **Estilos Inline restritos**: Substitua atributos de estilo (`<div style="...">`) por **Classes Utilitárias (Utility Classes)** predefinidas no sistema. Elas utilizam o prefixo `S0-` (ex: `S0-w-full`, `S0-text-center`, `S0-d-flex`).
- **Cascade Layers CSS**:  No Foundry V13, o motor de CSS está organizado através do encapsulamento em `@layer`. Siga essas declarações nativas para prevenir que a especificidade fuja do controle.
- **ApplicationV2 e Prototype Pollution**: Componentes migrados para o Application V2 do v13 **nunca** devem utilizar propriedades iterativas nativas como `foundry.utils.mergeObject(super.DEFAULT_OPTIONS)` diretamente nos Object Filters ou getters se isso gerar mutação, pois isso causa poluição (prototype pollution) nas classes bases do Foundry. 

#### 3. Registros de Conhecimento, Agentes e Histórico
> **Nota:** A pasta `.agent` é **opcional** no desenvolvimento padrão e pode ser obtida de um repositório próprio. Para contribuições manuais (humanas) ela não é estritamente necessária, porém é **exigida** caso você esteja utilizando uma IA ou Agente para codificar no projeto.

Toda IA colaborativa, agente automático ou engenheiro responsável por manter código nesse sistema deve participar do fluxo de **Gestão do Conhecimento**. Ao resolver problemas complexos ou estabelecer um novo padrão:
1. Documente e crie um artigo técnico breve na pasta estrita `.agent/learnings/`.
2. Adicione-o imediatamente ao índice em `.agent/learnings/_index.md`.
3. Ao finalizar a rotina ou pull request, atualize e centralize suas referências operacionais em `.agent/history/`. 

Com este padrão, toda e qualquer IA consultará previamente essas fontes de aprendizado, evitando assim aplicar metodologias que já fracassaram na nossa infraestrutura ou que conflitem com o Foundry V13.

#### 4. Testes Unitários
Agora o projeto conta com uma suíte de testes unitários na pasta `tests/`. Sempre que você criar uma nova regra de negócio, utilitário ou corrigir um bug complexo, é altamente recomendado adicionar ou atualizar os testes correspondentes para garantir que a funcionalidade continue operando como o esperado. Todo pull request de lógica core deve passar nos testes existentes.

---

## ❤️ Agradecimento

Mesmo com todas as restrições, agradecemos profundamente cada pessoa que contribui, reporta ou compartilha o sistema. O `Setor 0` é feito com carinho (e um pouco de loucura), e toda ajuda é bem-vinda — desde que respeitando os limites do Domo.

---

Qualquer dúvida, nos procure via [https://setor0rpg.com.br](https://setor0rpg.com.br) ou abra uma issue.