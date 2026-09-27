# Campos de uma planta

Referência do formato do `Data/Plantas.json`. Exemplo real: a alface.

```json
{
  "id": "alface",
  "nomePopular": "Alface",
  "nomeCientifico": "Lactuca sativa",
  "categoria": "hortalica",
  "familia": "",
  "origem": "",

  "cultivo": {
    "luz": "meia-sombra",
    "rega": "media",
    "ciclo": "anual",
    "dificuldade": "facil",
    "ambiente": ["horta-vertical", "jardineira", "varanda", "vaso"],
    "maturidadeDias": 50,
    "germinacaoDias": 5,
    "alturaCm": 30,
    "espacamentoCm": 20,
    "solo": ""
  },

  "descricao": "Folhosa de ciclo curto, pronta para colher em cerca de 45 dias...",
  "dicas": ["Colha folha a folha, de fora para dentro..."],
  "problemasComuns": ["Planta espigando e ficando amarga: calor demais..."],
  "imagem": { "arquivo": "img/plantas/alface.jpg", "creditoAutor": "", "licenca": "", "origem": "" },

  "cuidados": { },
  "referenciaIngles": { },
  "registrosAgregados": 115,
  "fonte": { }
}
```

## Identificação

| Campo | O que é |
| --- | --- |
| `id` | chave única, sem acento nem espaço. Use para links e para achar a planta |
| `nomePopular` | o nome que aparece na tela |
| `nomeCientifico` | nome em latim, útil como subtítulo da ficha |
| `categoria` | `erva` · `hortalica` · `medicinal` · `ornamental` · `fruta` |
| `familia` | família botânica. **Vazio**, para preencher se quiserem |
| `origem` | região de origem. **Vazio**, para preencher |

## cultivo — como plantar

Vem do OpenPlantDB, exceto os dois primeiros calculados.

| Campo | Valores / unidade |
| --- | --- |
| `luz` | `sol-pleno` · `meia-sombra` · `sombra` |
| `rega` | `baixa` · `media` · `alta` |
| `ciclo` | `anual` · `perene` |
| `dificuldade` | `facil` · `media` · `dificil` — **calculado** |
| `ambiente` | lista: `vaso` · `jardineira` · `varanda` · `horta-vertical` · `canteiro` · `interior` — **calculado** |
| `maturidadeDias` | dias até a primeira colheita (ou floração, nas ornamentais) |
| `germinacaoDias` | dias para a semente brotar |
| `alturaCm` | altura adulta |
| `espacamentoCm` | distância entre uma muda e outra |
| `solo` | **vazio**, para preencher |

`dificuldade` e `ambiente` não existem em banco nenhum: são regras nossas,
escritas no script. Dificuldade soma pontos por rega alta, ciclo anual longo
e porte acima de 3 m. Ambiente sai do tamanho da planta.

## Conteúdo escrito por nós

Estes quatro são o texto autoral. Nascem vazios, exceto em cinco plantas de
exemplo: manjericao, alface, babosa, jiboia e morango.

| Campo | Formato | Vazio vem como |
| --- | --- | --- |
| `descricao` | texto de 2 ou 3 períodos | `""` |
| `dicas` | lista de frases curtas | `[]` |
| `problemasComuns` | lista no padrão *sintoma: causa e solução* | `[]` |
| `imagem` | objeto com arquivo, autor, licença e link de origem | `null` |

O padrão sintoma-primeiro em `problemasComuns` é proposital: casa com o
questionário "O que há com a minha planta?", em que o usuário chega pelo
sintoma e não pelo nome da praga.

## cuidados — manutenção do dia a dia

Vem do plantfolio. Existe em **193 das 260**; nas outras vem `null`.

| Campo | Valores / unidade |
| --- | --- |
| `toxicoParaPets` | `nao-toxica` · `levemente-toxica` · `toxica` · `desconhecida` |
| `regaEmDias` | intervalo em dias por estação: primavera, verao, outono, inverno |
| `modoDeRegar` | `por-cima` · `por-baixo` · `imersao` · `borrifar` |
| `temperaturaC` | `{ min, max }` em graus |
| `umidade` | `baixa` · `media` · `alta` · `muito-alta` |
| `phSolo` | `acido` · `neutro` · `alcalino` · `adaptavel` |
| `drenagem` | `bem-drenado` · `drenagem-alta` · `retem-umidade` · `tolera-encharcamento` |
| `crescimento` | `lento` · `moderado` · `rapido` |
| `anosDeVida` | `{ min, max }` |
| `propagacao` | lista: `sementes` · `estaquia-de-caule` · `divisao-de-touceira` · `alporquia` · `mudas-aereas` · e outras |

`regaEmDias` é o campo que alimenta o lembrete do Minhas Plantas. Nem toda
estação aparece: só entram as que o banco tem.

## referenciaIngles — NÃO EXIBIR

Texto original em inglês, material de apoio para quem vai escrever a
descrição e as dicas em português. As frases vêm quebradas em lista, no
mesmo formato de `dicas`, para reescrever linha a linha.

Conforme forem escrevendo a versão em português, apaguem esse bloco da
planta. O arquivo encolhe e some o inglês do meio do conteúdo.

## Procedência

| Campo | O que é |
| --- | --- |
| `registrosAgregados` | quantas variedades daquela espécie foram resumidas nessa ficha (a alface tem 115) |
| `fonte` | origem dos dados de cultivo, com licença e data |

## Vazios

Nenhum campo desaparece da ficha. Vazio vem como `""`, `[]` ou `null`, então
não é preciso testar se a chave existe:

```js
if (planta.descricao) { /* ... */ }
if (planta.cuidados)  { /* ... */ }
```

## Bloco meta

No topo do arquivo, antes da lista. Traz as duas fontes, as licenças, quais
campos vieram de cada uma, quais foram calculados e a ressalva de clima —
o OpenPlantDB é norte-americano e os valores são faixas de referência.