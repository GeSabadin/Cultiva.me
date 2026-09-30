# Licenças e créditos: o que o site precisa cumprir

Os dados e as fotos do Cultiva.me não são nossos. Vêm de bancos e fotógrafos
que liberam o uso **sob condições**. Cumprindo as regras abaixo, o uso é
legal. No Brasil, quem regula isso é a Lei de Direitos Autorais
(Lei 9.610/1998)

**Resumo em uma linha:** site sem fins comerciais, toda foto com crédito
visível, página Sobre com as fontes e a licença, e nada de editar as fotos.

---

## 1. Regras que valem para o site inteiro

- [ ] **Sem uso comercial.** Nada de anúncio, venda, patrocínio, link de
      afiliado ou cobrança de acesso. 197 das 260 fotos (licenças NC) e todos
      os dados vindos do plantfolio (seção 3) proíbem isso. Se um dia o site
      virar comercial, as fotos NC e o plantfolio precisam sair.
- [ ] **O site é distribuído sob CC BY-NC-SA 4.0.** É exigência do
      plantfolio (o "SA": quem usa o material distribui sob a mesma licença).
      Isso precisa aparecer no rodapé e na página Sobre.
- [ ] **Página Sobre com as fontes**, com nome, link e licença de cada uma
      (tabela da seção 3).

## 2. Regras para cada foto

Toda foto vem com os campos `imagem.autor`, `imagem.licenca` e
`imagem.url` no `Data/Plantas.json`.

- [ ] **Mostrar o crédito junto da foto**, visível na mesma página, não
      escondido só no código. Formato sugerido:

      Foto: {autor}, {licenca}   (link para {url})

- [ ] **O link para `url` é obrigatório.** É a página original da foto, que
      prova de onde ela veio e qual é a licença.
- [ ] **Não editar as fotos.** Nada de filtro, montagem, texto por cima ou
      recorte que mude o sentido. Redimensionar e comprimir pode (já fizemos,
      sem mudar o conteúdo). Mostrar a foto cortada via CSS (`object-fit:
      cover`) também pode, porque o arquivo continua o mesmo.
      Se alguém precisar editar uma foto, as licenças SA obrigam a publicar
      a versão editada sob a mesma licença, e isso tem que ser indicado no
      crédito ("adaptada de...").
- [ ] **Nunca trocar uma foto sem trocar o crédito.** Foto nova sem crédito
      certo é foto sem permissão. Use o `Scripts/baixar_imagens.py`, que
      preenche os três campos sozinho. Se for colocar uma foto à mão,
      preencha os três campos também.
- [ ] **Só usar foto com licença aceita:** CC0, domínio público, CC BY,
      CC BY-SA, CC BY-NC ou CC BY-NC-SA. **Nunca** usar foto "todos os
      direitos reservados", foto com licença ND (sem derivações) nem imagem
      tirada do Google Imagens, Pinterest ou de outro site.

### Licenças das fotos hoje (260)

| Licença | Fotos | O que exige |
| --- | --- | --- |
| CC BY-NC | 179 | crédito, sem uso comercial |
| CC BY | 29 | crédito |
| CC BY-NC-SA | 18 | crédito, sem uso comercial, mesma licença se editar |
| CC BY-SA | 21 | crédito, mesma licença se editar |
| CC0 / domínio público | 13 | nada (o crédito é boa prática e o site mostra igual) |

Fonte das fotos: 247 do iNaturalist, 13 do Wikimedia Commons.

## 3. Fontes dos dados

| Fonte | Licença | O que usamos | Obrigações |
| --- | --- | --- | --- |
| [OpenPlantDB](https://github.com/cwfrazier1/openplantdb) | CC0 (domínio público) | luz, necessidade de água, altura, espaçamento, ciclo, germinação, dias até colheita/floração | nenhuma; citar é boa prática |
| [plantfolio-common-plants](https://github.com/Luminoid/plantfolio-common-plants) | CC BY-NC-SA 4.0 | descrição e dicas (traduzidas), intervalo e modo de rega, solo, clima, crescimento, anos de vida, propagação, toxicidade | crédito, sem uso comercial, mesma licença |
| [iNaturalist](https://www.inaturalist.org) | varia por foto | fotos | ver seção 2 |
| [Wikimedia Commons](https://commons.wikimedia.org) | varia por foto | fotos | ver seção 2 |

A lista exata de campos de cada fonte está no bloco `meta.fontes` do
`Data/Plantas.json`, que a página Sobre pode ler direto.

- [ ] **A `descricao` e as `dicas` de 189 plantas são tradução adaptada do
      plantfolio.** Tradução conta como adaptação: o texto continua sendo
      obra derivada e sai sob CC BY-NC-SA 4.0, com crédito ao plantfolio.
      Isso já está coberto pela licença do site; basta a página Sobre dizer
      que os textos das fichas são adaptados dessa fonte.
- [ ] **Os textos escritos pela equipe do zero** (as 5 fichas de exemplo e
      o que vier depois) também saem sob CC BY-NC-SA 4.0, junto com o resto
      do site.

## 4. Uso de IA

Os scripts em `Scripts/` foram gerados com IA, e isso está declarado no
cabeçalho de cada um. A tradução dos textos do plantfolio para o português
também foi feita com IA. Vale declarar as duas coisas na página Sobre, para
o professor. Os dados e as fotos não foram gerados por IA: vêm das fontes
acima.

## 5. Antes de publicar ou entregar

- [ ] Toda ficha que mostra foto mostra também o crédito com link.
- [ ] O rodapé tem "Conteúdo sob CC BY-NC-SA 4.0" com link para
      <https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br>.
- [ ] A página Sobre lista as quatro fontes da seção 3.
- [ ] A página Sobre diz que os textos das fichas são adaptados do
      plantfolio e que a tradução foi feita com IA.
- [ ] Nenhum anúncio nem link comercial.

Este documento resume as licenças para o trabalho da disciplina. Não é
parecer jurídico.
