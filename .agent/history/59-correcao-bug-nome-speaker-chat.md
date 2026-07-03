# Correção do Bug de Nome de Speaker no Chat

## O que foi feito
Corrigido um bug onde o sistema utilizava o nome do Token selecionado no Canvas ao realizar rolagens a partir da ficha de outros Atores (Player ou NPC).

## Arquivos alterados
- `module/api/foundry-api.mjs`: Atualizado `FoundryApi.ChatMessage.getSpeaker` para forçar a passagem de um `alias` com o nome do ator, evitando que o núcleo do Foundry busque o nome em tokens controlados.

## Decisões técnicas relevantes
O Foundry VTT, por padrão, assume que se nenhum `token` ou `alias` for explicitamente passado para a criação do `speaker`, ele deve tentar usar o token atualmente controlado na cena. Ao fixar o `alias` durante a construção das opções do speaker, evitamos esse comportamento de fallback indesejado e travamos a identidade do speaker na ficha original.

## Testes sugeridos
1. Selecione um token qualquer na cena (Ex: Ator A).
2. Abra a ficha de um Ator diferente (Ex: Ator B).
3. Faça uma rolagem pela ficha do Ator B.
4. Verifique se o nome do remetente no chat corresponde ao Ator B, e não ao Ator A.
