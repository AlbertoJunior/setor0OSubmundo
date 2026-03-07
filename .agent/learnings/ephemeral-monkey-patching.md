# Monkey-Patching Efêmero

## Contexto e Problema (Memory Leaking)
Quando lidamos com renderização visual (especialmente na UI de Canvas do Foundry como Texts Tooltips) às vezes a API base carece de estilizações personalizadas pontuais que fogem da injeção limpa e requerem manobra forçada de métodos nativos (o que chama-se de *Monkey-Patching*).
O perigo de sobrescrever propriedades globais (como `canvas.interface.createScrollingText = ...`) é envenenar permanentemente a engine. A partir daquele ponto, qualquer módulo ou núcleo em outros cantos do ecossistema seria emparedado na sua estilização intrusiva para textos aleatórios de jogo ou causaria travamento (Memory Leak).

## A Solução: Padrão Efêmero
Para lidar com interceptações intrusivas de métodos utilzados amplamente, usa-se a abordagem transitória: a interceptação só deve existir durante os milissegundos precisos em que o Foundry passará a requisição do hook específico, restaurando-se a globalidade imediatamente após isso.

### Exemplo (Tooltips do Setor 0)
Quando o Foundry vai exibir o Popup acima do Token ("Efeito Removido!", "Efeito Adicionado!"), ele sempre aciona o `ActiveEffect.prototype._displayScrollingStatus`. É este o exato local assustado onde devemos encampar:

```javascript
  _displayScrollingStatus(enabled) {
    if (!this.animate) return; // Barreiras e Filtros Nativos passam lisos

    // PASSO 1 - Salvamos o ponteiro de memória original do Método Global.
    const originalCreate = canvas.interface.createScrollingText;

    // PASSO 2 - Override agressivo local/efêmero usando o global momentaneamente.
    canvas.interface.createScrollingText = async function (origin, content, options = {}) {
      
      const newOptions = {
        _fontFamily: "MinhaFonte", // injeção restrita
        ...options
      };

      // PASSO 3 - Restauração Síncrona Exata (Release Locks).
      // Antes mesmo dele começar o await, nós devolvemos o trono original a interface do canvas global!
      canvas.interface.createScrollingText = originalCreate;

      // PASSO 4 - Devolvemos o resultado invocando agora a função real na marra.
      return await originalCreate.call(this, origin, content, newOptions);
    }

    // O Foundry roda a chamada original do hook da interface que vai "cair na armadilha efêmera" uma única vez.
    super._displayScrollingStatus(enabled);
  }
```

## Diretriz de Projeto
Nunca delegue ou deixe permanentemente uma alteração global do `canvas` ou `game.system` flutuante dentro do ciclo de vida da Engine do Foundry. Sempre embale essas chamadas nos trâmites Efêmeros (`Salvar -> Alterar -> Restaurar -> Disparar`) para proteger o desempenho e estabilidade de instâncias multi-módulo da comunidade.
