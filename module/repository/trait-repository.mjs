import { SYSTEM_ID } from "../constants.mjs";
import { BaseActorCharacteristicType, CharacteristicType } from "../enums/characteristic-enums.mjs";
import { EffectChangeValueType } from "../enums/enhancement-enums.mjs";
import { TraitUtils } from "../core/trait/trait-utils.mjs";
import { localize } from "../utils/utils.mjs";
import { TraitType } from "../enums/trait-enums.mjs";
import { FoundryApi } from "../api/foundry-api.mjs";

export class TraitRepository {
  static #goodTrait = [
    {
      id: '1',
      name: 'Atraente',
      xp: 3,
      description: 'Você é especialmente atraente para os outros e instiga curiosidade e desejo. Você recebe +2 dados para qualquer teste que envolva sedução ou que sua aparência possa lhe trazer vantagem.'
    },
    {
      id: '2',
      name: 'Atraente - Galante',
      xp: 6,
      description: 'Você é especialmente atraente para os outros e instiga curiosidade e desejo. Você recebe +4 dados para qualquer teste que envolva sedução ou que sua aparência possa lhe trazer vantagem.'
    },
    {
      id: '3',
      name: 'Bom Senso',
      xp: 3,
      description: 'Você tem uma quantidade significativa de sabedoria cotidiana prática e costuma pensar antes de agir. Sempre que o personagem estiver a ponto de proceder de modo contrário ao bom senso, o narrador pode fazer sugestões ou avisá-lo sobre as implicações de tal ação — como a conhecida “voz da razão”.<br>Este é um traço muito útil para jogadores iniciantes pouco familiarizados com o cenário ou RPG em si e também para personagens com Inteligência 6.'
    },
    {
      id: '108',
      name: 'Celebridade',
      xp: 3,
      description: 'Você é conhecido por um grande feito no Setor 0, seja como campeão em corridas de rua, vencedor de um torneio importante, pesquisador, informante, hacker ou até mesmo mercenário. Considere seu nível de {\Influencia} como 1 — mesmo que não seja — para fins de aquisição de itens ou interpretação. Seu nível total não aumenta ao adquirir qualquer nível nessa característica.'
    },
    {
      id: '4',
      name: 'Concentração',
      xp: 3,
      description: 'Você tem a habilidade de focar a sua mente e desligar-se de qualquer distração ou perturbação. Desse modo, não é afetado por nenhuma das penalidades provenientes das circunstâncias que provocam distrações — tais como ruídos altos, luzes estroboscópicas, pendurar-se de ponta-cabeça, etc.'
    },
    {
      id: '5',
      name: 'Estrategista',
      xp: 3,
      description: 'Você é bom em estratégias e consegue montar planos e táticas eficientes em momentos de tensão ou que exijam raciocínio rápido. Com este traço, o personagem será capaz de usar a ação <i>Comandar Estratégia</i>.<br>Usando poucas palavras, você pode motivar seus companheiros e garantir a eles o efeito <i>Inspirado</i>. Os efeitos desta habilidade só podem ser aplicados a um único ser por turno.'
    },
    {
      id: '6',
      name: 'Flexível',
      xp: 3,
      description: 'O seu corpo é incrivelmente flexível e se dobra em posições incomuns. Reduza em dois pontos a Dificuldade de todos os testes de Destreza que envolvam flexibilidade corporal. Espremer-se através de um espaço pequeno é um exemplo de uso para este traço.'
    },
    {
      id: '7',
      name: 'Inspirador',
      xp: 3,
      description: 'Fora de combates, você consegue motivar qualquer ser a fazer algo melhor, seja para enganar, hackear, executar manobras perigosas ou ações arriscadas. Para qualquer ação que envolva habilidades, bastam algumas palavras e o alvo ficará <i>Inspirado</i> — para isso, usa-se o mesmo sistema de <i>Comandar Estratégia</i>.<br>Os efeitos desta habilidade só podem ser aplicados a um único ser por turno.'
    },
    {
      id: '8',
      name: 'Pacifista',
      xp: 3,
      description: 'Quando escolher não matar um alvo ao realizar uma Ação de Ataque, o personagem não sofre a penalidade de +1 de Dificuldade ao executar essa ação.'
    },
    {
      id: '9',
      name: 'Pechincheiro',
      xp: 3,
      description: 'Parece que você nasceu com o dom para negociar valores e levar alguma vantagem nisso — ou simplesmente ganha pelo cansaço. Recebe dois dados extras sempre que for tentar pechinchar.'
    },
    {
      id: '10',
      name: 'Aliado Excepcional',
      xp: 6,
      description: 'Você possui um aliado que é excelente naquilo que faz e que pode até ser conhecido de forma positiva por algo muito bom que tenha feito. Esse aliado tem 2 dados a mais na área de atuação dele.<br><i>Observação:</i> Para comprar este Traço, o jogador precisa definir algumas características básicas do aliado, tais como nome, bairro, área de atuação (habilidade primária) e possuir pelo menos 1 ponto no Repertorio Aliado.',
      requirement: 'Possuir pelo menos 1 ponto no Repertorio Aliado.',
      particularity: '',
    },
    {
      id: '11',
      name: 'Aliado Extraordinário',
      xp: 9,
      description: 'Você possui um aliado que é extraordinário naquilo que faz e que pode até ser conhecido de forma positiva por algo muito bom que tenha feito. Esse aliado tem 4 dados a mais na área de atuação dele.<br><i>Observação:</i> Para comprar este Traço, o jogador precisa definir algumas características básicas do aliado, tais como nome, bairro, área de atuação (habilidade primária) e possuir pelo menos 1 ponto no Repertorio Aliado.',
      requirement: 'Possuir pelo menos 1 ponto no Repertorio Aliado.',
      particularity: '',
    },
    {
      id: '12',
      name: 'Comandante',
      xp: 6,
      description: 'Por ser um visionário em situações tensas, durante o combate você consegue comandar estratégias, expor pontos fracos, orquestrar táticas de ataque e defesa, entre outros. Já fora dessa situação, você consegue motivar seus aliados a fazerem coisas grandiosas mesmo quando parece impossível.<br>Quando utilizar os benefícios de <i>Inspirador</i> ou <i>Estrategista</i>, o personagem aumenta em +1 o limite de 3 dados para o efeito <i>Inspirado</i> , além de poder distribuir os dados entre os aliados que o escutaram da maneira que desejar.',
      requirement: 'Estrategista ou Inspirador'
    },
    {
      id: '80',
      name: 'Engenharia Veloz',
      xp: 6,
      description: 'Engenheiros extremamente habilidosos conseguem fabricar SuperEquipamentos em tempo recorde, seja pelo fato de já conhecerem todo o passo-a-passo do objeto a ser construído, ou por terem uma epifania durante o processo. Para construir qualquer SuperEquipamento considere que o tempo entre os testes de fabricação são reduzidos pela metade.'
    },
    {
      id: '13',
      name: 'Hipertimesia',
      xp: 6,
      description: 'Você se lembra, com todos os detalhes, da maioria das coisas que já que viu ou ouviu: documentos, fotos, conversas, sons, entre outros, podem ser guardados na memória. Sob condições de tensão que envolvam numerosas distrações, você precisa ser bem-sucedido num teste de (Inteligência + Percepção)/2 + Investigação (Dificuldade 6) para conseguir concentrar-se o suficiente para absorver o que seus sentidos detectam.'
    },
    {
      id: '14',
      name: 'Honrado',
      xp: 6,
      description: 'Você tem um código de ética pessoal do qual é adepto. Os detalhes sobre esse código devem ser bem elaborados e descritos e o personagem deve segui-lo à risca.<br>Os personagens com este traço ganham dois dados adicionais em todos os testes de Consciência ou de Perseverança quando estiverem agindo diretamente de acordo com seu código ou quando tentarem evitar situações que podem forçá-los a violá-lo.',
      particularity: '',
    },
    {
      id: '15',
      name: 'Inofensivo',
      xp: 6,
      description: 'Você tem uma aparência ou aura tão inofensiva que não representa qualquer ameaça para aqueles que o veem. Esta característica pode assegurar sua sobrevivência e, às vezes, até uma guarda baixa que facilita seus planos.<br>Porém, alguns seres mais mal-intencionados podem tentar se aproveitar da sua suposta ingenuidade e indefesa. Caso suas ações contradigam este traço, provavelmente deixarão de vê-lo desta forma e reagirão à ameaça.'
    },
    {
      id: '16',
      name: 'Inventor',
      xp: 6,
      description: 'Você dedicou anos de sua vida e especializou-se na produção de algum item manufaturado específico — ácidos, gases, venenos, SuperEquipamentos, entre outros. Agora, quando o estiver fabricando, ele será um pouco melhor. Sempre que obtiver pelo menos 1 Sucesso no Teste de Fabricação (ver na seção de construção do item), considere como se tivesse +1 Sucesso Automático.',
      particularity: '',
    },
    {
      id: '17',
      name: 'MedTec',
      xp: 6,
      description: 'Você dedicou anos de sua vida e se especializou na área da Medicina Tecnológica; agora é capaz de consertar e curar qualquer uma das morfologias, além de poder fazer cirurgias para implantar Aprimoramentos de forma mais fácil. Reduza em 1 a Dificuldade para realizar cirurgias de Aprimoramentos.<br><i>Observação:</i> Para comprar esse Traço é preciso ter Medicina e Tecnologia no nível 3 ou superior em cada uma.'
    },
    {
      id: '18',
      name: 'Produtor Econômico',
      xp: 6,
      description: 'Químicos cautelosos conseguem fabricar mais substâncias gastando menos recursos, pois aproveitam os compostos de uma produção para outra. Assim, são capazes acumular mais itens produzidos. Para fazer qualquer substância — ácidos, drogas, gases, venenos e antídotos — considere como se tivesse um nível a mais no Repertorio Recursos.'
    },
    {
      id: '19',
      name: 'Propósito Maior',
      xp: 6,
      description: 'Você tem um objetivo claro que o conduz em tudo que faz. Não se preocupa com futilidades e problemas cotidianos porque o seu propósito maior é tudo que importa para você. Embora, ocasionalmente, haja a possibilidade de ser conduzido por este desígnio e se ver forçado a se comportar de formas que contrariam as necessidades de sobrevivência pessoal, ele também pode lhe conferir uma grande obstinação.<br>Você adquire dois dados extras em todos os testes que ativamente o deixem mais próximo deste grande objetivo e deve ser bem-sucedido num teste de Consciência + Quietude (Dificuldade 7) para ignorá-lo momentaneamente por uma outra situação mais urgente. Você precisa decidir qual é o seu propósito maior e este deve ser alcançável, por mais difícil que seja.',
      particularity: '',
    },
    {
      id: '20',
      name: 'Aliado MedTec',
      xp: 9,
      description: 'Você possui um aliado que dedicou anos de sua vida para se especializar na área da Medicina Tecnológica. Ele é capaz de consertar e curar qualquer uma das morfologias, além de poder fazer cirurgias para incorporar Aprimoramentos. Este traço funciona como um nível no Repertorio Aliado e por isso funciona de forma idêntica.'
    },
    {
      id: '21',
      name: 'Ambidestro',
      xp: 9,
      description: 'Você consegue usar suas duas mãos tão distintamente que não possui uma mão "inábil", o que significa que a outra é tão funcional quanto a dominante. Você não sofre todas as penalidades ao usar a mão não-dominante, apenas o acréscimo de +1 na Dificuldade quando a utilizar.'
    },
    {
      id: '22',
      name: 'Aptidão',
      xp: 9,
      description: 'Você possui um talento natural em uma área de conhecimento específico, seja Medicina, Engenharia ou qualquer outra habilidade não combativa. As Dificuldades de todos os testes feitos para compreender, consertar ou operar qualquer coisa que envolva a área de aptidão é reduzida em um ponto.<br><i>Observação:</i> Este Traço só pode ser adquirido uma única vez.',
      particularity: '',
    },
    {
      id: '23',
      name: 'Defensor',
      xp: 9,
      description: 'Quando utilizar o Estilo Defensivo, o jogador poderá dividir sua quantidade total de dados pela metade. Desse modo, ele fará duas Ações de Defesa com metade dos dados em cada, ao invés de uma Ação com todos os dados.<br>Também permite que defenda aliados alvos de ataques, caso seja possível — Armas de Projeção tem regras específicas para defesa e esquiva. Se ainda não tiver usado sua Ação e o aliado estiver próximo o suficiente para alcançá-lo, o jogador poderá consumir sua Ação para fazer um Teste Defensivo. Os Sucessos desse teste são subtraídos dos Sucessos do Ataque.'
    },
    {
      id: '24',
      name: 'Destemido',
      xp: 9,
      description: 'Por algum motivo você não aprendeu a ser cauteloso e gosta de correr riscos, principalmente porque a sorte parece estar do seu lado nestes momentos. Sempre que suas ações forem um risco para sua própria vida — devem possuir Dificuldade a partir de 8 e a possibilidade de causar, no mínimo, três níveis de dano <i>Letal</i> se fracassar — você acrescenta +2 dados ao teste.'
    },
    {
      id: '25',
      name: 'Insuplantável',
      xp: 9,
      description: 'Sua postura defensiva é extremamente eficiente e impossibilita que seus inimigos se aproveitem de seus flancos.Quando em combate, você está sempre atento aos ataques vindos de todos os lados.'
    },
    {
      id: '26',
      name: 'Habilidoso',
      xp: 9,
      description: 'Você já deve ter feito de tudo um pouco durante a vida e, assim, obteve uma grande quantidade de habilidades e conhecimentos diversificados. Você pode fazer qualquer teste de habilidade mesmo que não possua nenhum nível nela, exceto quando a Dificuldade for 10; esse teste sofrerá o modificador de +1 na Dificuldade. Além disso, como é considerado que você tem algum conhecimento teórico sobre muitos assuntos, sempre que for comprar o primeiro nível de alguma habilidade ela custará de 1 XP ao invés de 2 XP.'
    },
    {
      id: '27',
      name: 'Mente Impenetrável',
      xp: 9,
      description: 'Sua mente é forte, firme e sólida: aqueles que tentam forçar suas vontades sobre você quase nunca possuem sucesso e dificilmente lhe convencem de algo. As Dificuldades para resistir à coerção mental ou qualquer tipo de persuasão pela Expressão, Hacking ou Performance sofrem um modificador de -1 na Dificuldade. <br>Ademais, caso seja necessário um tempo para realizar algum teste para resistir ou para ficar sob o efeito de alguma influência, este é reduzido pela metade.'
    },
    {
      id: '28',
      name: 'Montanha de músculos',
      xp: 12,
      description: 'Para a sua estatura, você possui muito mais músculos e/ou gordura que a maioria dos outros seres. Essa quantia anormal de massa lhe deixa extremamente evidente em locais públicos, porém lhe confere dois níveis a mais de Vitalidade e também +2 dados em testes de Força para carregar, empurrar, puxar e segurar coisas ou seres.',
      effects: [
        {
          key: BaseActorCharacteristicType.VITALITY.TOTAL.system,
          value: 2,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          typeOfValue: EffectChangeValueType.FIXED
        },
      ]
    },
    {
      id: '29',
      name: 'Quatro-braços',
      xp: 12,
      description: 'De alguma forma estranha, seu corpo reagiu bem à ideia de operar 4 braços simultaneamente; mesmo que estes não respondam com a mesma agilidade que seus braços originais, são totalmente funcionais. A iniciativa deles é equivalente à metade da sua e você pode usá-los para tudo o que seus outros membros idênticos conseguiriam fazer, além de ganhar +4 dados (2 para cada) para usar os braços extras em qualquer teste.<br>Eles podem ser utilizados em combate, possuindo seu próprio turno em que podem realizar ou uma ação Ofensiva, ou Defensiva. Estes braços possuem 4 dados para realizar a ação.'
    },
    {
      id: '30',
      name: 'Primor',
      xp: 12,
      description: 'Seu corpo e sua mente foram lapidados ao mais alto grau de excelência, alcançando um estado de perfeição raramente visto, mesmo entre os maiores prodígios do Setor 0. Ao adquirir este Traço, você aumenta em 1 a quantidade máxima de Atributos que podem alcançar o nível 6, somando-se ao limite natural da sua Morfologia. Este Traço não concede pontos automaticamente, mas permite que você evolua um Atributo adicional até o nível 6 futuramente.'
    },
  ];

  static #badTrait = [
    {
      id: '30',
      name: 'Vale da Estranheza',
      xp: 2,
      morph: 'Androide',
      description: 'Há algo em você que não passa naturalidade: pode ser seu modo "robótico" de falar, caminhar, se movimentar ou até mesmo o olhar fixamente distante, o que causa desconforto e estranheza para qualquer ser que lhe observe. Você perde dois dados em qualquer teste social cujos trejeitos estejam envolvidos ou visíveis.'
    },
    {
      id: '31',
      name: 'Preso às Leis da Robótica de Asimov',
      xp: 4,
      morph: 'Androide',
      description: 'Talvez por crença, fanatismo ou apenas por uma piada, durante a sua criação lhe impuseram uma ou mais das três famosas Leis da Robótica idealizadas há tempos remotos por um escritor do Mundo Antigo chamado Isaac Asimov, das quais você é incapaz de contradizer — por mais que tente.<br>1ª Lei: Você não pode ferir um humano ou, por inação, permitir que um ser humano sofra algum mal.'
    },
    {
      id: '32',
      name: 'Preso às Leis da Robótica de Asimov',
      xp: 6,
      morph: 'Androide',
      description: 'Talvez por crença, fanatismo ou apenas por uma piada, durante a sua criação lhe impuseram uma ou mais das três famosas Leis da Robótica idealizadas há tempos remotos por um escritor do Mundo Antigo chamado Isaac Asimov, das quais você é incapaz de contradizer — por mais que tente.<br>1ª Lei: Você não pode ferir um humano ou, por inação, permitir que um ser humano sofra algum mal.<br>2ª Lei: Você deve obedecer às ordens que lhe sejam dadas por seres humanos, exceto nos casos em que entrem em conflito com a Primeira Lei.'
    },
    {
      id: '33',
      name: 'Preso às Leis da Robótica de Asimov',
      xp: 8,
      morph: 'Androide',
      description: 'Talvez por crença, fanatismo ou apenas por uma piada, durante a sua criação lhe impuseram uma ou mais das três famosas Leis da Robótica idealizadas há tempos remotos por um escritor do Mundo Antigo chamado Isaac Asimov, das quais você é incapaz de contradizer — por mais que tente.<br>1ª Lei: Você não pode ferir um humano ou, por inação, permitir que um ser humano sofra algum mal.<br>2ª Lei: Você deve obedecer às ordens que lhe sejam dadas por seres humanos, exceto nos casos em que entrem em conflito com a Primeira Lei.<br>3ª Lei: Você deve proteger sua própria existência, desde que tal proteção não entre em conflito com a Primeira ou Segunda Leis.'
    },
    {
      id: '34',
      name: 'Núcleo das antigas',
      xp: 4,
      morph: 'Ciborgue',
      description: 'O seu Núcleo não é ruim, mas é antigo demais para dar suporte à novas peças. Você não pode adquirir o ponto extra de Aprimoramentos e deve iniciar apenas com 3 pontos, igual às outras morfologias.'
    },
    {
      id: '35',
      name: 'Desistente',
      xp: 4,
      morph: 'Ciborgue',
      description: 'Você, ao contrário da maioria dos outros Ciborgues, não é um indivíduo persistente. Sempre que algo aparenta não dar certo, logo aceita as consequências e segue sua vida. Você só pode gastar 1 ponto de Perseverança por turno, igual às outras morfologias.'
    },
    {
      id: '36',
      name: 'Estrutura infantil',
      xp: 4,
      morph: 'Sintético',
      description: 'Quando lhe projetaram, sabe-se lá por que, decidiram que você deveria se parecer com uma criança. Sua estrutura física é menor, sua voz é fina e seu corpo não é bem desenvolvido — portanto, não pode ter Força e Vigor acima de 4. Constantemente lhe confundem com uma criança e não permitem que você tenha acesso a locais para adultos.<br><br><i>Observação:</i> Você não pode comprar o traço <i>Estatura incômoda</i> ou <i>Montanha de Músculos</i>.'
    },
    {
      id: '37',
      name: 'Corpo frágil',
      xp: 4,
      morph: 'Sintético',
      description: 'Durante sua incubação, sua resistência natural foi removida ou esquecida de ser colocada, talvez para economizar recursos ou simplesmente porque achavam que você não precisaria. Ao contrário da maioria dos outros Sintéticos, você sente mais dor quando é ferido, o que significa que não possui o bônus de ignorar 1 da <i>Penalidade por Dano</i>.',
      effects: [
        {
          key: CharacteristicType.BONUS.DAMAGE_PENALTY.system,
          value: 1,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          typeOfValue: EffectChangeValueType.FIXED
        },
      ]
    },
    {
      id: '38',
      name: 'Últimos dias',
      xp: 8,
      morph: 'Sintético',
      description: 'Você já viveu o que seria tempo suficiente para um Sintético; seus anos de vida já estão chegando ao fim e seu corpo vem apresentando sintomas com mais frequência, talvez falte pouco para encontrar sua falência derradeira. Você começa o jogo com o <i>Teste de Vida</i> iniciando em 5 ao invés de 8, ou seja, mais 5 falhas e você morre.'
    },
    {
      id: '39',
      name: 'Aliado meia boca',
      xp: 2,
      description: 'Você possui um aliado que é muito ruim naquilo que faz — mas é seu amigo, fazer o quê? Ele também pode ser conhecido de forma negativa por algo ruim que tenha feito. Esse aliado tem 2 dados a menos nos testes em sua área de atuação.<br><br><i>Observação:</i> Para comprar este Traço, o jogador precisa definir algumas características básicas do aliado, tais como nome, bairro, área de atuação (habilidade primária) e possuir pelo menos 1 ponto no Repertorio Aliado.',
      particularity: '',
      requirement: 'Possuir pelo menos 1 ponto no Repertorio Aliado.',
    },
    {
      id: '40',
      name: 'Atormentado',
      xp: 2,
      description: 'Você fez ou soube de algo que não deveria e isto lhe causa constante tormento, seja por medo de que descubram o que você esconde ou por sofrer ameaça para que não o revele.<br>Caso esse segredo viesse à público poderia estragar seu disfarce, se afastarem de você, perderem a confiança ou até mesmo caçá-lo. Converse e defina com seu narrador os detalhes sobre o que lhe atormenta e as implicações disto.',
      particularity: '',
    },
    {
      id: '41',
      name: 'Bairrismo',
      xp: 2,
      description: 'Você é extremamente apegado ao seu bairro natal e quando alguém de fora dele o insulta — seja pela cultura, pelo povo, ou por qualquer outro motivo — você reage agressivamente. Para resistir às ofensas de um estrangeiro, você deve ser bem-sucedido em um teste de Quietude + Perseverança (Dificuldade 7) para não "partir para cima do intruso e quebrar sua cara". Você também reluta em sair dos limites do bairro e só o faz se for bem-sucedido em um teste de Consciência + Perseverança (Dificuldade 7) ou pagando um ponto de Perseverança.',
    },
    {
      id: '42',
      name: 'Carma',
      xp: 2,
      description: 'É como dizem: tudo que você fizer poderá voltar contra você; seja um segredo contado, uma zombaria desmedida ou um tiro disparado.<br>Converse e defina com seu narrador alguns gatilhos que podem fazer com que suas ações voltem contra si de alguma maneira.'
    },
    {
      id: '43',
      name: 'Cidadão esnobe',
      xp: 2,
      description: 'Você desdenha da cultura dos outros e não faz nenhuma questão de ser mais sociável, constantemente fazendo pouco de seus costumes e debochando de suas ritualísticas. Esse tipo de atitude pode lhe trazer muitos problemas e inimigos, caso você decida abrir a boca no momento errado — e geralmente você não vê motivos para ficar calado.<br>Defina com seu narrador um ou mais bairros, limitado a 5, que seu personagem não gosta e, para quaisquer situações que os envolvam, você deve ser bem-sucedido em um teste de Perseverança + Quietude (Dificuldade 7) para não ofender os habitantes dos bairros em questão.'
    },
    {
      id: '44',
      name: 'Clone',
      xp: 2,
      description: 'Você é um Androide ou um Sintético que teve seu modelo replicado ou simplesmente um Ciborgue muito parecido com outro, o que causa a confusão de identidades. Isso pode provocar inúmeras situações desagradáveis, ou mesmo perigosas, principalmente se o seu "clone" tiver péssima reputação ou estiver sendo procurado por algum crime.'
    },
    {
      id: '45',
      name: 'Compulsão',
      xp: 2,
      description: 'Em situações que lhe causam aflição, você apresenta um comportamento repetitivo para tentar aliviá-la. No entanto, esta compulsão acaba denunciando a sua identidade de alguma forma: sempre carregar e usar um produto higienizador; ordenar objetos simetricamente; pigarrear ou tossir com frequência; fazer contagens; estalar os dedos; entre outros.<br>Por ser uma atitude irracional, para tentar contê-la temporariamente você deve gastar um ponto de Perseverança.',
      particularity: '',
    },
    {
      id: '46',
      name: 'Desmedido',
      xp: 2,
      description: 'O personagem é impossibilitado de tornar não letal o seu ataque. Deste modo, suas investidas sempre matarão o alvo — desde que use alguma arma letal e cause dano suficiente — ainda que não seja sua intenção.'
    },
    {
      id: '47',
      name: 'Estatura incômoda',
      xp: 2,
      description: 'Você pode ser extremamente alto ou baixo demais, a questão é que sua estatura lhe prejudica em alguns momentos; seja para utilizar certos utensílios, tentar passar por locais apertados, acessar ambientes, se esconder, etc.'
    },
    {
      id: '48',
      name: 'Fedorento',
      xp: 2,
      description: 'Você exala um odor extremamente forte e característico e não há perfume que seja capaz de mascarar este cheiro: em Androides, um fedor de óleo queimado misturado à ferrugem; nos Ciborgues e Sintéticos, algo parecido com carne podre e carniça. Todos ao seu redor sentem este odor, a menos que sejam incapazes de sentir cheiros.'
    },
    {
      id: '49',
      name: 'Feio',
      xp: 2,
      description: 'Você é feio e desengonçado, o que faz com que alguns seres o evitem. Perde 2 dados em qualquer teste que envolva sedução ou que sua aparência possa lhe trazer desvantagem.'
    },
    {
      id: '50',
      name: 'Feio - Horroroso',
      xp: 4,
      description: 'Você é horroroso e desengonçado, o que faz com que alguns seres o evitem. Perde 4 dados em qualquer teste que envolva sedução ou que sua aparência possa lhe trazer desvantagem.'
    },
    {
      id: '51',
      name: 'Impaciente',
      xp: 2,
      description: 'Antigamente diziam que o segredo da natureza era a paciência; no entanto, hoje ela está completamente destruída. O que você poderia pensar disso, então? Que a paciência não serviu para nada — por mais que insistam em lhe dizer o contrário!<br>Sim, você é inquieto e precipitado, não aguenta ficar muito tempo parado esperando e age no calor do momento sem dar muita atenção às consequências. E também não tem paciência suficiente para se importar com isso.'
    },
    {
      id: '52',
      name: 'Indiferente',
      xp: 2,
      description: 'Você não se dá bem com palavras inspiradoras, na verdade não acredita que têm potencial e mal liga para elas. Isso significa que o efeito <i>Inspirado</i> não surte tanto efeito em você ou as vezes não tem efeito nenhum.<br>-1 dado quando <i>Inspirado</i>. Caso o personagem que esteja tentando inspirar tenha o Traço <i>Comandante</i>, você ainda poderá ter +3 dado pela grande habilidade dele.'
    },
    {
      id: '53',
      name: 'Indiferente',
      xp: 4,
      description: 'Você não se dá bem com palavras inspiradoras, na verdade não acredita que têm potencial e mal liga para elas. Isso significa que o efeito <i>Inspirado</i> não surte tanto efeito em você ou as vezes não tem efeito nenhum.<br>-2 dados quando <i>Inspirado</i>. Caso o personagem que esteja tentando inspirar tenha o Traço <i>Comandante</i>, você ainda poderá ter +2 dado pela grande habilidade dele.'
    },
    {
      id: '54',
      name: 'Indiferente',
      xp: 6,
      description: 'Você não se dá bem com palavras inspiradoras, na verdade não acredita que têm potencial e mal liga para elas. Isso significa que o efeito <i>Inspirado</i> não surte tanto efeito em você ou as vezes não tem efeito nenhum.<br>-3 dados quando <i>Inspirado</i>. Caso o personagem que esteja tentando inspirar tenha o Traço <i>Comandante</i>, você ainda poderá ter +1 dado pela grande habilidade dele.'
    },
    {
      id: '55',
      name: 'Inimigo',
      xp: 2,
      description: 'Alguém, desde um ser até um grupo, está com raiva suficiente de você, da sua família, dos seus amigos ou de qualquer outro laço que lhe respingue o sentimento para se declarar como seu inimigo.<br>Esses inimigos frequentemente tentam prejudicá-lo e o quão poderosos serão vai depender da quantidade de pontos que o jogador se arrisque a possuir:<br>+2 XP — Seu rival possui poder equivalente ao seu; ele não quer lhe matar, mas ficará extremamente feliz em te derrotar no que for possível.'
    },
    {
      id: '56',
      name: 'Inimigo',
      xp: 4,
      description: 'Alguém, desde um ser até um grupo, está com raiva suficiente de você, da sua família, dos seus amigos ou de qualquer outro laço que lhe respingue o sentimento para se declarar como seu inimigo.<br>Esses inimigos frequentemente tentam prejudicá-lo e o quão poderosos serão vai depender da quantidade de pontos que o jogador se arrisque a possuir:<br>+4 XP — Esse inimigo procura lesá-lo de todas as formas possíveis. Ele já esteve em seu caminho algumas vezes e sempre se mostrou um pouco melhor que você.'
    },
    {
      id: '57',
      name: 'Inimigo',
      xp: 6,
      description: 'Alguém, desde um ser até um grupo, está com raiva suficiente de você, da sua família, dos seus amigos ou de qualquer outro laço que lhe respingue o sentimento para se declarar como seu inimigo.<br>Esses inimigos frequentemente tentam prejudicá-lo e o quão poderosos serão vai depender da quantidade de pontos que o jogador se arrisque a possuir:<br>+6 XP — Pode se tratar de uma equipe inteira ou um ser extremamente sagaz, influente e poderoso que vai lhe caçar sempre que possível — com o único objetivo de ver seu fim. Juízes são ótimos inimigos.'
    },
    {
      id: '58',
      name: 'Pessimista',
      xp: 2,
      description: 'A primeira coisa que vem em sua mente é que tudo vai dar errado. Você realmente acredita nisso e deixa claro para os outros. Porém, seus comentários podem ser bastante inconvenientes e irritantes para alguns seres ao seu redor. Faça um teste de Perseverança + Consciência (Dificuldade 7) para tentar manter a boca fechada, embora não consiga disfarçar que não acredita naquele papinho otimista.'
    },
    {
      id: '59',
      name: 'Procurado',
      xp: 2,
      description: 'Você fez algo que irritou alguns seres de um ou vários bairros, por causa disso sua cabeça está a prêmio e eles farão de tudo para conseguir reivindicar este troféu.<br>Converse e defina com seu narrador os critérios do contrato, se é procurado vivo ou morto e os bairros em que estão ativos. Enquanto estiver nas regiões escolhidas, você sofrerá uma penalidade de +2 no Nível de Procurado. Este Traço pode ser adquirido até seis vezes.',
      particularity: '',
    },
    {
      id: '60',
      name: 'Tolerância zero',
      xp: 2,
      description: 'Há algo que lhe causa tanta antipatia que suas reações para com isto chegam a ser ilógicas. Pode ser, literalmente, qualquer coisa: uma situação específica; uma organização; um bairro; tipos de atitudes, costumes, objetos, alimentos ou criaturas; até mesmo perguntas que você considere idiotas podem ser o gatilho para uma resposta rude ou pior.<br>Quando relacionado com o alvo de sua intolerância, a Dificuldade em todos os testes recebe +1 ponto. Converse e defina com seu narrador sobre o que você não tolera. Este traço pode ser adquirido até 4 vezes.',
      particularity: '',
    },
    {
      id: '61',
      name: 'Anônimo?',
      xp: 4,
      description: 'O destino faz questão de deixar algo que mostre que você esteve ali: uma munição com cartucho muito característico; uma frase em um site invadido; uma pichação; uma assinatura digital; ou qualquer coisa que ligue a você.<br>Encontrar o que foi deixado geralmente requer dois Sucessos num teste de (Percepção + Inteligência)/2 + Investigação (Dificuldade 7); contudo, uma vez que o investigador encontre tal marca duas vezes, a exigência cai para um Sucesso. Esse padrão também revela algum detalhe pequeno sobre o personagem, como seus hábitos, gostos ou prazeres.',
      particularity: '',
    },
    {
      id: '62',
      name: 'Curioso',
      xp: 4,
      description: 'Você sente uma curiosidade fora do comum, o que constantemente o leva a abrir mão da sensatez para satisfazer esta necessidade. Desde entender o funcionamento de algo até descobrir um grande segredo, você facilmente se deixa levar e pode chegar a ser inconveniente ou a correr riscos.<br>Para resistir, faça um teste de Perseverança + Quietude; a Dificuldade deve ser determinada pela gravidade da situação e o potencial de risco para o personagem (mínima 5 e máxima 10).'
    },
    {
      id: '63',
      name: 'Em dívida',
      xp: 4,
      description: 'Você assinou um termo sem ler ou pediu/fez algo que o deixou em débito com um indivíduo — e ele vai cobrar o que achar conveniente. A sua dívida talvez nunca tenha um fim e, caso você se recuse a pagá-la, poderá sofrer as consequências.<br>Converse com seu narrador sobre qual é a sua dívida e o motivo dela, lembre-se também de que você deve descrever para quem está devendo. Caso o cobrador perceba que não vai cooperar, poderá colocar atrás de você alguém disposto a resolver este problema, substituindo este defeito por Inimigo (4 de XP).',
      particularity: '',
    },
    {
      id: '64',
      name: 'Fobia',
      xp: 4,
      description: 'Você sente um medo irracional de alguma coisa, geralmente algo improvável de lhe causar danos; mesmo assim, pode chegar a paralisá-lo ou fazê-lo evitar situações em que confronte aquilo que lhe causa tal pavor. Palhaços, robôs e altura são exemplos de fobias comuns.<br>Sempre que se deparar com o objeto de sua fobia, você pode gastar um ponto temporário de Quietude para controlar o pânico temporariamente ou fazer um teste de Perseverança + Consciência, a Dificuldade do teste é determinada pelo narrador. Se fracassar, deverá afastar-se do motivo imediatamente.',
      particularity: '',
    },
    {
      id: '65',
      name: 'Inaptidão',
      xp: 4,
      description: 'Existem habilidades ou conhecimentos em que você simplesmente não tem facilidade para aprender. Precisa de mais tempo e dedicação para aquilo entrar na sua cabeça e fazer sentido a ponto de conseguir usá-las sem mais problemas.<br>Por exemplo, você tem dificuldade em falar qualquer língua que seja diferente da usada no bairro onde vive ou continua errando aquela sequência de passos na aula de dança mesmo ensaiando mais que os outros.<br>Defina uma habilidade na qual será inapto e ela custará 3 pontos de XP por nível ao invés de 2 XP. Esta deve possuir, no mínimo, nível 1 e fazer sentido com o conceito do personagem, não sendo permitido escolher ter inaptidão numa habilidade que nunca usaria.',
      particularity: '',
    },
    {
      id: '66',
      name: 'Incapaz de acessar a Rede',
      xp: 4,
      description: 'Sua mente não consegue transpor a barreira da <i>Transferência</i> de consciência para a <i>Rede</i> e, sempre que tentava, acabava por ser um evento traumático. Você não pode acessar a Rede, a menos que seja bem-sucedido num teste de Consciência + Quietude (Dificuldade 8).'
    },
    {
      id: '67',
      name: 'Obsessão',
      xp: 4,
      description: 'Existe algo que você ama ou é fascinado ao ponto de desconsiderar o bom senso para suprir essa obsessão. Você reage positivamente a qualquer coisa relacionada à sua obsessão, até mesmo se não estiver em seus planos.<br>Por exemplo, se você é obcecado por carros exóticos, sairá do seu caminho para apreciá-los ou coleciona-los, desconsiderando todas as advertências; se você é obcecado por anime, toda a sua casa e pertences são decorados com pôsteres e hologramas e sempre tentará converter o tema da conversa para aquilo que gosta. Há muitas outras obsessões, incluindo artes marciais, armas, culinária, esportes, RPGs, etc. Converse e defina com o narrador qual será e como age em sua vida.<br>Um Teste de Consciência + Quietude (Dificuldade 7) pode ser feito para resistir à obsessão de forma temporária.',
      particularity: '',
    },
    {
      id: '68',
      name: 'Insanidade',
      xp: 4,
      description: 'Você sofre de uma forma de insanidade mental, seja devido a um defeito congênito, de fabricação ou algum trauma do passado.<br>Converse com seu narrador e defina qual é e como age na vida do personagem. Alguns exemplos são: Esquizofrenia; Estresse pós-traumático; Transtorno obsessivo-compulsivo (TOC); Transtorno bipolar.<br>Você pode conseguir conviver com sua forma de insanidade, mas sempre que ela estiver no ápice e você precisar se controlar, deve ser bem-sucedido em um teste de Consciência + Perseverança (Dificuldade 7) para superá-la temporariamente.',
      particularity: '',
    },
    {
      id: '69',
      name: 'Baixa tolerância à dor',
      xp: 6,
      description: 'Todo o seu circuito de alerta sensorial, orgânico ou não, é bastante sensível e reage aos menores estímulos, lhe causando dores desproporcionais à causa.<br>Você sofre a penalidade de -1 em seu Vigor para o cálculo de <i>Penalidade por Dano</i>. Caso o personagem adquira o efeito <i>Proeza da Dor</i> (Rigidez), este traço deve ser removido e a XP que ele concede devolvida.',
      effects: [
        {
          key: CharacteristicType.BONUS.DAMAGE_PENALTY.system,
          value: 1,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          typeOfValue: EffectChangeValueType.FIXED
        },
      ]
    },
    {
      id: '70',
      name: 'Cura demorada',
      xp: 6,
      description: 'Seu corpo não lhe ajuda quando precisa se regenerar: seus órgãos demoram de responder ou suas peças são difíceis de encontrar ou não se encaixam. Ou seja, seu corpo leva o dobro de tempo para ser reparado ou curado. Além disso, a Dificuldade dos testes para ser consertado ou curado é aumentada em 1.'
    },
    {
      id: '71',
      name: 'Lei de Murphy',
      xp: 6,
      description: 'Se alguma coisa tem a possibilidade de dar errado, ela vai dar errado — está explicado por que as coisas não dão muito certo para você.<br>Em algumas situações a cargo do narrador, quando o personagem precisar fazer algo consideravelmente difícil (Dificuldade 8 ou superior) ou extremamente fácil (Dificuldade 5) deve subtrair 3 do resultado; se ficar negativo, é uma falha crítica.<br>Caso o jogador questione, mostre a ele que uma lei universal agiu sobre sua vida e ele não tem controle sobre isso.'
    },
    {
      id: '72',
      name: 'Ódio',
      xp: 6,
      description: 'Você odeia algo ou alguém a tal ponto que praticamente vive em função de prejudicar, difamar ou obter algum tipo de poder sobre o alvo de tal sentimento. Converse e defina com o narrador qual é a circunstância do seu ódio — pode ser uma situação específica; um indivíduo que lhe fez mal; uma marca ou empresa;  entre vários outros exemplos.',
      particularity: '',
    },
    {
      id: '73',
      name: 'Proteicomania',
      xp: 2,
      description: 'Desde que os seres passaram a viver na Colmeia, a escassez os privou de diversos tipos de proteína animal e vegetal. Com o tempo, os MedTecs perceberam que alguns indivíduos desenvolveram um sentimento tão exacerbado de prazer pelas poucas opções de proteínas existentes que beirava a loucura.<br>Assim, o nomearam de Transtorno da Proteína, também conhecida como <i>Proteicomania</i> (<i>proteico</i> — referente a ou constituído de proteína — e <i>mania</i> — estado de loucura). Possui quatro níveis de intensidade, começando por crises de abstinência sem danos graves no primeiro estágio até chegar ao mais grave, onde o indivíduo é capaz de praticar atos extremos para saciar sua vontade.<br>Você acha muito deliciosa a geleia proteica de insetos.'
    },
    {
      id: '74',
      name: 'Proteicomania',
      xp: 4,
      description: 'Desde que os seres passaram a viver na Colmeia, a escassez os privou de diversos tipos de proteína animal e vegetal. Com o tempo, os MedTecs perceberam que alguns indivíduos desenvolveram um sentimento tão exacerbado de prazer pelas poucas opções de proteínas existentes que beirava a loucura.<br>Assim, o nomearam de Transtorno da Proteína, também conhecida como <i>Proteicomania</i> (<i>proteico</i> — referente a ou constituído de proteína — e <i>mania</i> — estado de loucura). Possui quatro níveis de intensidade, começando por crises de abstinência sem danos graves no primeiro estágio até chegar ao mais grave, onde o indivíduo é capaz de praticar atos extremos para saciar sua vontade.<br>Você precisa comer a carne dos peixes-do-lodo para se sentir nutrido.'
    },
    {
      id: '75',
      name: 'Proteicomania',
      xp: 6,
      description: 'Desde que os seres passaram a viver na Colmeia, a escassez os privou de diversos tipos de proteína animal e vegetal. Com o tempo, os MedTecs perceberam que alguns indivíduos desenvolveram um sentimento tão exacerbado de prazer pelas poucas opções de proteínas existentes que beirava a loucura.<br>Assim, o nomearam de Transtorno da Proteína, também conhecida como <i>Proteicomania</i> (<i>proteico</i> — referente a ou constituído de proteína — e <i>mania</i> — estado de loucura). Possui quatro níveis de intensidade, começando por crises de abstinência sem danos graves no primeiro estágio até chegar ao mais grave, onde o indivíduo é capaz de praticar atos extremos para saciar sua vontade.<br>Você só se contenta com carnes de aves e está disposto a pagar caro.'
    },
    {
      id: '76',
      name: 'Proteicomania',
      xp: 8,
      description: 'Desde que os seres passaram a viver na Colmeia, a escassez os privou de diversos tipos de proteína animal e vegetal. Com o tempo, os MedTecs perceberam que alguns indivíduos desenvolveram um sentimento tão exacerbado de prazer pelas poucas opções de proteínas existentes que beirava a loucura.<br>Assim, o nomearam de Transtorno da Proteína, também conhecida como <i>Proteicomania</i> (<i>proteico</i> — referente a ou constituído de proteína — e <i>mania</i> — estado de loucura). Possui quatro níveis de intensidade, começando por crises de abstinência sem danos graves no primeiro estágio até chegar ao mais grave, onde o indivíduo é capaz de praticar atos extremos para saciar sua vontade.<br>Seu paladar só aceita carne vermelha desde que a provou, até mesmo se alimentar de outras coisas pode embrulhar o seu estômago.'
    },
    {
      id: '77',
      name: 'Vício',
      xp: 6,
      description: 'Você é viciado em alguma substância que precisa estar presente em seu organismo — orgânico ou não — praticamente a todo momento do dia; pode ser álcool, nicotina, drogas pesadas, adrenalina ou qualquer outra.<br>Estas substâncias sempre devem enfraquece-lo de alguma maneira e, ao critério do narrador, uma das penalidades abaixo é aplicada considerando a abstinência ou presença da substância no organismo. Por exemplo, um personagem viciado em nicotina sofre +1 na Dificuldade quando estiver em abstinência; após ingeri-la, a Dificuldade volta ao valor normal e ele passa a perder 1 dado em testes de Vigor.<br><ul><li>1 dado a menos em todos os testes que envolvam algum Atributo específico afetado.</li><li>A Dificuldade aumenta em 1 em todos os testes que envolvam algum Atributo específico afetado.</li></ul>',
      particularity: '',
    },
    {
      id: '78',
      name: 'Aprimoramentos defeituosos',
      xp: 6,
      description: 'As melhorias que você tanto buscou para o seu corpo se mostraram um pesadelo e sofrimento. Talvez as peças que tenha utilizado não eram as melhores ou a combinação de sistemas distintos não funcionou bem, pode ser até que tenham implantado de forma errada; infelizmente, nada disso importa agora, pois as únicas coisas que você consegue pensar são nos efeitos colaterais que seus Aprimoramentos lhe causam.<br>Um MedTec habilidoso pode ser capaz de fazer algo para ajudar, se tiver uma oportunidade de te operar com tempo suficiente para trabalhar com calma e precisão. Se alguém puder consertá-los, você poderá anular este traço e devolver a XP recebida.<br>Você fica fatigado sempre que utiliza algum de seus Aprimoramentos, perdendo 1 dado em todos os testes que faça após ativar algum efeito. Caso possua efeito passivo, você perderá um dado permanentemente.'
    },
    {
      id: '79',
      name: 'Aprimoramentos defeituosos',
      xp: 8,
      description: 'As melhorias que você tanto buscou para o seu corpo se mostraram um pesadelo e sofrimento. Talvez as peças que tenha utilizado não eram as melhores ou a combinação de sistemas distintos não funcionou bem, pode ser até que tenham implantado de forma errada; infelizmente, nada disso importa agora, pois as únicas coisas que você consegue pensar são nos efeitos colaterais que seus Aprimoramentos lhe causam.<br>Um MedTec habilidoso pode ser capaz de fazer algo para ajudar, se tiver uma oportunidade de te operar com tempo suficiente para trabalhar com calma e precisão. Se alguém puder consertá-los, você poderá anular este traço e devolver a XP recebida.<br>Seu núcleo não suporta os Aprimoramentos conectados a ele, esquentando facilmente e lhe deixando inconsciente com frequência. Diminua em 1 a quantia máxima de <i>Sobrecarga</i> suportada, totalizando 4.',
      effects: [
        {
          key: CharacteristicType.BONUS.OVERLOAD_LIMIT.system,
          value: -1,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          typeOfValue: EffectChangeValueType.FIXED
        },
      ],
    }
  ];

  static #loadedGoodFromPack = [];
  static #loadedBadFromPack = [];
  static #traitEffectsOptionsMapCache = null;

  static async _loadFromPack() {
    const compendium = (await game.packs.get(`${SYSTEM_ID}.traits`)?.getDocuments());
    if (compendium) {
      const allTraits = compendium.map((item) => {
        const convertedItem = {
          id: item._id,
          name: item.name,
          xp: TraitUtils.getXp(item),
          description: TraitUtils.getDescription(item),
          type: TraitUtils.getType(item)
        };

        if (TraitUtils.getHaveParticularity(item)) {
          convertedItem['particularity'] = '';
        }

        const requirement = TraitUtils.getRequirement(item);
        if (requirement && requirement !== '') {
          convertedItem['requirement'] = requirement;
        }

        const morph = TraitUtils.getMorph(item);
        if (morph && morph !== '') {
          convertedItem['morph'] = morph;
        }

        const effects = TraitUtils.getEffects(item);
        if (effects.length > 0) {
          convertedItem['effects'] = [...effects];
        }

        return convertedItem;
      });

      TraitRepository.#loadedGoodFromPack = allTraits.filter(item => item.type === TraitType.GOOD);
      TraitRepository.#loadedBadFromPack = allTraits.filter(item => item.type === TraitType.BAD);
    }
  }

  static getGoodTraits() {
    return [
      ...TraitRepository.#goodTrait,
      ...TraitRepository.#loadedGoodFromPack
    ];
  }

  static getBadTraits() {
    return [
      ...TraitRepository.#badTrait,
      ...TraitRepository.#loadedBadFromPack
    ];
  }

  static getItemsByType(type) {
    const items = type === TraitType.GOOD ? this.getGoodTraits() : this.getBadTraits();
    return items.sort((a, b) => a.xp - b.xp || a.name.localeCompare(b.name));
  }

  static getItemByTypeAndId(type, traitId) {
    const item = this.getItemsByType(type).find(element => element.id == traitId);
    return item ? FoundryApi.deepClone(item) : undefined;
  }

  static getBonusOptionsMap() {
    if (TraitRepository.#traitEffectsOptionsMapCache)
      return TraitRepository.#traitEffectsOptionsMapCache;

    TraitRepository.#traitEffectsOptionsMapCache = {};
    for (const characteristicCategoryKey in CharacteristicType.BONUS) {
      const category = CharacteristicType.BONUS[characteristicCategoryKey];
      if (typeof category !== 'object' || category === null) continue;

      let hasSubCategories = false;
      for (const characteristicSubCategoryKey in category) {
        const subCategory = category[characteristicSubCategoryKey];
        if (typeof subCategory === 'object' && subCategory !== null && subCategory.system) {
          TraitRepository.#traitEffectsOptionsMapCache[subCategory.system] = localize(`${subCategory.label || subCategory.id}`);
          hasSubCategories = true;
        }
      }

      if (!hasSubCategories && category.system) {
        TraitRepository.#traitEffectsOptionsMapCache[category.system] = localize(`${category.label || category.id}`);
      }
    }
    return TraitRepository.#traitEffectsOptionsMapCache;
  }
}