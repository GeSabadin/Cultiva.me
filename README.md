# Campos de uma planta

> **Antes de publicar ou mexer nas fotos, leia o [LICENCAS.md](LICENCAS.md).**
> Ele lista o que o site precisa cumprir para usar os dados e as fotos.

Referência do formato do `Data/Plantas.json`. O arquivo tem dois blocos:
`meta` (licença e fontes) e `plantas` (a lista de 260 fichas).

## Regras gerais

- **Toda planta tem todas as chaves.** Não é preciso testar se um campo existe.
- **Sem dado é sempre `null`.** Texto vazio é `""` e lista vazia é `[]`.
- **Valores fixos** (categoria, luz etc.) são minúsculos, sem acento, com
  hífen no lugar do espaço: `sol-pleno`, `nao-toxica`.
- **Unidades no nome do campo:** `Cm`, `C` (graus Celsius), `Dias`.

```js
if (planta.descricao) { /* tem texto */ }
if (planta.agua.intervaloDias.verao !== null) { /* tem intervalo de rega */ }
```

## Exemplo completo: manjericão

```json
{
  "id": "manjericao",
  "nomePopular": "Manjericão",
  "nomeCientifico": "Ocimum basilicum",
  "familia": "",
  "regiaoDeOrigem": "",
  "categoria": "erva",

  "descricao": "Erva anual de folhas largas e muito aromáticas...",
  "dicas": ["Colha as folhas de cima para baixo, sempre acima de um par de folhas"],
  "problemasComuns": [
    { "sintoma": "Folhas amareladas embaixo",
      "causa": "Excesso de água ou vaso sem furo",
      "solucao": "Regar só quando o solo secar e usar vaso com furo de drenagem" }
  ],
  "imagem": { "arquivo": "imgs/plantas/manjericao.jpg", "autor": "Sune Holt",
              "licenca": "CC BY-NC", "url": "https://www.inaturalist.org/photos/154769884" },

  "dificuldade": "facil",
  "ambientes": ["canteiro", "vaso"],
  "luz": "sol-pleno",
  "agua": {
    "necessidade": "media",
    "intervaloDias": { "primavera": 3, "verao": 3, "outono": 5, "inverno": null },
    "modo": "por-cima"
  },
  "solo":  { "ph": "neutro", "drenagem": "bem-drenado" },
  "clima": { "temperaturaMinC": 18, "temperaturaMaxC": 27, "umidade": "media" },
  "porte": { "alturaCm": 61, "espacamentoCm": 25, "crescimento": "rapido" },
  "ciclo": {
    "tipo": "anual",
    "anosDeVida": { "min": 1, "max": 1 },
    "germinacaoDias": 5,
    "diasAteColheita": 60,
    "diasAteFloracao": null
  },
  "propagacao": ["sementes", "estaquia-de-caule"],
  "toxicidadePets": "nao-toxica"
}
```

## Identificação

| Campo | O que é |
| --- | --- |
| `id` | chave única, sem acento nem espaço. Use para links e para o nome da foto |
| `nomePopular` | o nome que aparece na tela |
| `nomeCientifico` | nome em latim, para o subtítulo da ficha |
| `familia` | família botânica. **Vazio**, para a equipe preencher |
| `regiaoDeOrigem` | de onde a planta vem (ex.: "Mediterrâneo"). **Vazio**, para preencher |
| `categoria` | `erva` · `hortalica` · `medicinal` · `ornamental` · `fruta` |

## Texto e foto

| Campo | Formato |
| --- | --- |
| `descricao` | 1 a 3 frases, com ponto final |
| `dicas` | lista de frases curtas, sem ponto final |
| `problemasComuns` | lista de `{ sintoma, causa, solucao }` |
| `imagem` | `{ arquivo, autor, licenca, url }` ou `null` |

- **`descricao` e `dicas`** estão preenchidas em 194 das 260 plantas: 5 fichas
  escritas pela equipe (manjericão, alface, babosa, jiboia e morango) e 189
  traduzidas do plantfolio. As 66 restantes não têm texto de origem e estão
  vazias, para escrever.
- **`problemasComuns`** só existe nas 5 fichas de exemplo. Vem separado em
  sintoma, causa e solução porque o questionário "O que há com a minha
  planta?" parte do sintoma.
- **`imagem.arquivo`** é relativo à pasta `Front-end`. A foto é baixada pelo
  `Scripts/baixar_imagens.py`.
- **Crédito da foto:** toda foto exibida precisa mostrar `autor` e `licenca`,
  com link para `url`, que é a página original da foto. As regras completas
  estão no [LICENCAS.md](LICENCAS.md).

## Para filtros e busca

| Campo | Valores |
| --- | --- |
| `dificuldade` | `facil` · `media` · `dificil` (**calculado**) |
| `ambientes` | lista: `vaso` · `jardineira` · `varanda` · `horta-vertical` · `canteiro` · `interior` (**calculado**) |
| `luz` | `sol-pleno` · `meia-sombra` · `sombra` |

`dificuldade` e `ambientes` não vêm de nenhum banco: são regras nossas, no
`gerar_plantas_json.py`.
- **`dificuldade`** soma pontos por rega alta, ciclo anual demorado e porte
  acima de 3 m.
- **`ambientes`** sai do tamanho da planta.

## Cuidados

| Campo | Valores / unidade |
| --- | --- |
| `agua.necessidade` | `baixa` · `media` · `alta` |
| `agua.intervaloDias` | dias entre regas em cada estação: `primavera`, `verao`, `outono`, `inverno` |
| `agua.modo` | `por-cima` · `por-baixo` · `imersao` · `borrifar` |
| `solo.ph` | `acido` · `neutro` · `alcalino` · `adaptavel` |
| `solo.drenagem` | `bem-drenado` · `drenagem-alta` · `retem-umidade` · `tolera-encharcamento` |
| `clima.temperaturaMinC`, `clima.temperaturaMaxC` | faixa de temperatura ideal, em °C |
| `clima.umidade` | umidade do ar: `baixa` · `media` · `alta` · `muito-alta` |
| `porte.alturaCm` | altura adulta, em cm |
| `porte.espacamentoCm` | distância entre uma muda e outra, em cm |
| `porte.crescimento` | `lento` · `moderado` · `rapido` |
| `propagacao` | lista: `sementes` · `estaquia-de-caule` · `estaquia-de-folha` · `divisao-de-touceira` · `divisao-de-bulbos` · `divisao-de-tuberculos` · `enxertia` · `alporquia` · `mergulhia` · `mudas-laterais` · `mudas-aereas` · `estolhos` · `esporos` |
| `toxicidadePets` | `nao-toxica` · `levemente-toxica` · `toxica` |

- **`agua.intervaloDias`** alimenta o lembrete do Minhas Plantas. Uma
  estação em `null` quer dizer que o banco não informa, e **não** que é
  para parar de regar. Na falta do inverno, use o intervalo do outono.
- **Os campos dos cuidados**, exceto `necessidade`, `alturaCm` e
  `espacamentoCm`, estão em `null` (ou `[]`) nas 67 plantas sem ficha no
  plantfolio.

## Ciclo

| Campo | O que é |
| --- | --- |
| `ciclo.tipo` | `anual` · `perene` |
| `ciclo.anosDeVida` | `{ min, max }`, em anos |
| `ciclo.germinacaoDias` | dias para a semente brotar |
| `ciclo.diasAteColheita` | dias do plantio à primeira colheita. Só nas comestíveis; `null` nas ornamentais |
| `ciclo.diasAteFloracao` | dias do plantio à primeira floração. Só nas ornamentais; `null` nas outras |

## Bloco meta

- **`licenca`**: licença do arquivo (CC BY-NC-SA 4.0), com link.
- **`fontes`**: para cada fonte, nome, link, licença e a lista de campos que
  vieram dela. É o que a página Sobre usa para os créditos.
- **`ressalva`**: aviso de que os valores de cultivo são faixas de
  referência.

## De onde vem cada coisa

| Origem | Campos |
| --- | --- |
| OpenPlantDB (CC0) | `luz`, `agua.necessidade`, `porte.alturaCm`, `porte.espacamentoCm`, `ciclo.tipo`, `ciclo.germinacaoDias`, `ciclo.diasAteColheita`, `ciclo.diasAteFloracao` |
| plantfolio (CC BY-NC-SA) | `descricao` e `dicas` traduzidas, e os demais campos de cuidados e ciclo |
| iNaturalist e Wikimedia Commons | `imagem` (licença própria de cada foto) |
| Calculado pelo script | `dificuldade`, `ambientes` |
| Escrito pela equipe | `familia`, `regiaoDeOrigem`, `problemasComuns` e o texto das 5 fichas de exemplo |

## Scripts

- **`python Scripts/gerar_plantas_json.py`** recria o arquivo a partir dos
  bancos. Ele **preserva** tudo o que foi escrito à mão: `descricao`,
  `dicas`, `problemasComuns`, `imagem`, `familia` e `regiaoDeOrigem`.
- **`python Scripts/baixar_imagens.py`** baixa a foto das plantas que ainda
  não têm uma.
