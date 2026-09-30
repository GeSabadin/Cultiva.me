"""
Baixa uma foto para cada planta do Data/Plantas.json e preenche o campo
imagem (arquivo, autor, licença e link de origem).

Assim como o gerar_plantas_json.py, este script foi gerado por IA. As fotos
não são: vêm do iNaturalist e do Wikimedia Commons, com o crédito do autor.


===============================================================================
COMO USAR
===============================================================================

       python baixar_imagens.py                  (todas as plantas)
       python baixar_imagens.py alface morango   (só essas, pelo id)

As fotos vão para Front-end/imgs/plantas/<id>.jpg e o Plantas.json é
atualizado. As plantas que ficarem sem foto vão para
local_backup/relatorio_imagens.md, para resolver na mão.

TROCAR UMA FOTO RUIM, em dois passos:

       python baixar_imagens.py --candidatos alface morango

   monta em local_backup/candidatos/<id>.jpg uma folha com até 8 fotos
   numeradas. Olhe a folha e anote a escolhida em
   local_backup/escolhas_imagens.json, assim:

       { "alface": { "escolha": 3, "motivo": "pé inteiro na horta" } }

   ("escolha": null deixa a planta como pendente.) Se nenhuma servir, dá
   para montar a folha a partir de uma busca em inglês no Commons:

       python baixar_imagens.py --buscar pimentao "bell pepper plant"

   Depois de escolher:

       python baixar_imagens.py --aplicar

   baixa as escolhidas por cima das antigas e atualiza o Plantas.json.


===============================================================================
O QUE O SCRIPT FAZ
===============================================================================

  1. PROCURA  - pelo nome científico no iNaturalist, dando preferência a
                observações de plantas CULTIVADAS (vaso, horta, jardim), que
                é a proposta do site. Sem nenhuma, usa as fotos da espécie.
                Se o iNaturalist falhar, tenta a foto principal da página
                da Wikipedia (que mora no Wikimedia Commons).

  2. FILTRA   - só entram licenças que um site não comercial pode usar dando
                crédito: CC0, domínio público, CC BY, CC BY-SA, CC BY-NC e
                CC BY-NC-SA. Fotos ND (sem derivações) ou com todos os
                direitos reservados ficam de fora.

  3. BAIXA    - a versão média (~500 px), para o site não ficar pesado.

Sem --aplicar, o script NUNCA TROCA UMA FOTO que já tenha autor preenchido.

O CRÉDITO É OBRIGATÓRIO: toda foto exibida no site precisa mostrar
imagem.autor e imagem.licenca, com link para imagem.url.
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path


# =============================================================================
# 1. ONDE LER E SALVAR
# =============================================================================

PASTA_DO_SCRIPT = Path(__file__).resolve().parent
RAIZ = PASTA_DO_SCRIPT.parent
ARQUIVO_PLANTAS = RAIZ / "Data" / "Plantas.json"
PASTA_FRONT = RAIZ / "Front-end"
PASTA_FOTOS = PASTA_FRONT / "imgs" / "plantas"      # arquivo é relativo a Front-end
PASTA_BACKUP = RAIZ / "local_backup"
ARQUIVO_RELATORIO = PASTA_BACKUP / "relatorio_imagens.md"
PASTA_CANDIDATOS = PASTA_BACKUP / "candidatos"
ARQUIVO_ESCOLHAS = PASTA_BACKUP / "escolhas_imagens.json"

CABECALHO = {"User-Agent": "Cultiva.me/1.0 (trabalho academico UTFPR)"}
PAUSA_ENTRE_PEDIDOS = 1.0      # segundos; o iNaturalist pede no máximo ~1 por segundo
QUANTOS_CANDIDATOS = 12       # 8 de plantas cultivadas + 4 das fotos da espécie


# =============================================================================
# 2. LICENÇAS ACEITAS
# =============================================================================
# Código do iNaturalist -> nome que vai no JSON.

LICENCAS_INATURALIST = {
    "cc0": "CC0",
    "pd": "Domínio público",
    "cc-by": "CC BY",
    "cc-by-sa": "CC BY-SA",
    "cc-by-nc": "CC BY-NC",
    "cc-by-nc-sa": "CC BY-NC-SA",
}

def licenca_commons_aceita(nome):
    """'CC BY-SA 4.0' passa, 'CC BY-ND 2.0' não."""
    nome = (nome or "").upper()
    if "ND" in nome.replace("-", " ").split():
        return False
    return (nome.startswith("CC0") or nome.startswith("CC BY")
            or "PUBLIC DOMAIN" in nome)


# =============================================================================
# 3. INTERNET
# =============================================================================

def pedir_json(url):
    time.sleep(PAUSA_ENTRE_PEDIDOS)
    pedido = urllib.request.Request(url, headers=CABECALHO)
    with urllib.request.urlopen(pedido, timeout=30) as resposta:
        return json.loads(resposta.read().decode("utf-8"))


def baixar_bytes(url):
    pedido = urllib.request.Request(url, headers=CABECALHO)
    with urllib.request.urlopen(pedido, timeout=60) as resposta:
        return resposta.read()


# =============================================================================
# 4. NOME CIENTÍFICO
# =============================================================================

def nome_da_especie(nome_cientifico):
    """'Monstera deliciosa var. borsigiana' vira 'monstera deliciosa'.

    Híbridos perdem o x: 'Mentha × piperita' vira 'mentha piperita'.
    """
    palavras = re.sub(r"\(.*?\)", " ", nome_cientifico or "").lower().split()
    palavras = [p for p in palavras if p not in ("x", "×") and p.isascii()]
    return " ".join(palavras[:2])


def limpar(texto):
    """Tira quebras de linha e espaços repetidos do nome do autor."""
    return " ".join((texto or "").split())


# =============================================================================
# 5. FONTE 1: iNaturalist
# =============================================================================
# Cada candidata vira {url, autor, licenca, origem}: url é o arquivo a baixar e
# origem é a página da foto (que no Plantas.json vai para imagem.url).

def achar_taxon(especie):
    busca = urllib.parse.urlencode({"q": especie, "per_page": 10, "is_active": "true"})
    resultados = pedir_json(f"https://api.inaturalist.org/v1/taxa?{busca}")["results"]
    # matched_term cobre sinônimos: 'Sechium edule' hoje se chama 'Sicyos edulis'
    return next((t for t in resultados
                 if especie in (nome_da_especie(t.get("name")),
                                nome_da_especie(t.get("matched_term")))), None)


def aceita_inaturalist(foto):
    return bool(foto) and foto.get("license_code") in LICENCAS_INATURALIST \
        and foto.get("url")


def nome_do_autor(foto):
    """'(c) Fulano, some rights reserved (CC BY)' vira 'Fulano'."""
    if foto.get("attribution_name"):
        return limpar(foto["attribution_name"])
    texto = limpar(foto.get("attribution"))
    achado = re.match(r"\(c\)\s*(.+?),\s*(some|all|no) rights", texto)
    return achado.group(1) if achado else texto


def montar_foto(foto):
    return {
        "url": re.sub(r"/(square|small|thumb|medium)\.", "/medium.", foto["url"]),
        "autor": nome_do_autor(foto),
        "licenca": LICENCAS_INATURALIST[foto["license_code"]],
        "origem": f"https://www.inaturalist.org/photos/{foto['id']}",
    }


def fotos_cultivadas(taxon, quantas):
    """Fotos de observações de plantas cultivadas, as mais recentes primeiro.

    Ordenar por votos puxa foto "curiosa" (abóbora de Halloween, espantalho);
    as recentes são quase sempre a planta no vaso ou na horta.
    """
    busca = urllib.parse.urlencode({
        "taxon_id": taxon["id"], "captive": "true", "photos": "true",
        "per_page": 50,
    })
    fotos = []
    for observacao in pedir_json(f"https://api.inaturalist.org/v1/observations?{busca}")["results"]:
        foto = next((f for f in observacao.get("photos", []) if aceita_inaturalist(f)), None)
        if foto:                       # uma por observação: a primeira é a principal
            fotos.append(montar_foto(foto))
        if len(fotos) >= quantas:
            break
    return fotos


def fotos_da_especie(taxon):
    """As fotos escolhidas pela comunidade para a página da espécie."""
    detalhe = pedir_json(f"https://api.inaturalist.org/v1/taxa/{taxon['id']}")
    return [montar_foto(tp["photo"])
            for tp in detalhe["results"][0].get("taxon_photos", [])
            if aceita_inaturalist(tp["photo"])]


def candidatos_do_inaturalist(especie, quantos):
    taxon = achar_taxon(especie)
    if taxon is None:
        return []
    fotos = fotos_cultivadas(taxon, max(1, quantos * 2 // 3))
    if len(fotos) < quantos:           # completa com as fotos da espécie
        origens = {f["origem"] for f in fotos}
        fotos += [f for f in fotos_da_especie(taxon) if f["origem"] not in origens]
    return fotos[:quantos]


def foto_do_inaturalist(especie):
    fotos = candidatos_do_inaturalist(especie, 1)
    return fotos[0] if fotos else None


# =============================================================================
# 6. FONTE 2: Wikipedia / Wikimedia Commons
# =============================================================================

def foto_do_commons(especie):
    """Foto principal da página da Wikipedia sobre a espécie."""
    busca = urllib.parse.urlencode({
        "action": "query", "format": "json", "redirects": 1,
        "titles": especie.capitalize(), "prop": "pageimages", "piprop": "name",
    })
    paginas = pedir_json(f"https://en.wikipedia.org/w/api.php?{busca}")["query"]["pages"]
    nome_arquivo = next(iter(paginas.values())).get("pageimage")
    if not nome_arquivo:
        return None

    busca = urllib.parse.urlencode({
        "action": "query", "format": "json", "titles": f"File:{nome_arquivo}",
        "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 500,
    })
    paginas = pedir_json(f"https://commons.wikimedia.org/w/api.php?{busca}")["query"]["pages"]
    info = next(iter(paginas.values())).get("imageinfo")
    if not info:                       # imagem não está no Commons (uso restrito)
        return None
    info = info[0]
    meta = info.get("extmetadata", {})

    licenca = meta.get("LicenseShortName", {}).get("value", "")
    if not licenca_commons_aceita(licenca):
        return None
    autor = limpar(re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "")))
    return {
        "url": info.get("thumburl") or info["url"],
        "autor": autor or "Wikimedia Commons",
        "licenca": licenca,
        "origem": info["descriptionurl"],
    }


# =============================================================================
# 7. SALVAR A FOTO NA FICHA
# =============================================================================

def ja_tem_foto(planta):
    imagem = planta.get("imagem") or {}
    return bool(imagem.get("autor")) and \
        (PASTA_FRONT / imagem.get("arquivo", "")).is_file()


def procurar_foto(especie):
    for fonte in (foto_do_inaturalist, foto_do_commons):
        try:
            foto = fonte(especie)
        except Exception as erro:
            print(f"    aviso: {fonte.__name__} falhou ({erro})")
            continue
        if foto:
            return foto
    return None


def comprimir(dados, extensao):
    """Regrava o JPEG em qualidade 85, na mesma resolução.

    O iNaturalist entrega em qualidade quase máxima (~350 KB para 500 px).
    Em 85 a foto cai para um terço do peso sem diferença visível.
    """
    if extensao != ".jpg":
        return dados
    from PIL import Image
    saida = BytesIO()
    Image.open(BytesIO(dados)).convert("RGB").save(
        saida, "JPEG", quality=85, optimize=True, progressive=True)
    return saida.getvalue() if saida.tell() < len(dados) else dados


def guardar_foto(planta, foto):
    """Baixa a foto para imgs/plantas e preenche o campo imagem."""
    extensao = Path(urllib.parse.urlparse(foto["url"]).path).suffix.lower()
    if extensao != ".png":
        extensao = ".jpg"
    arquivo = f"imgs/plantas/{planta['id']}{extensao}"
    (PASTA_FRONT / arquivo).write_bytes(comprimir(baixar_bytes(foto["url"]), extensao))
    planta["imagem"] = {
        "arquivo": arquivo,
        "autor": foto["autor"],
        "licenca": foto["licenca"],
        "url": foto["origem"],
    }


def ler_plantas():
    return json.loads(ARQUIVO_PLANTAS.read_text(encoding="utf-8"))


def salvar(conteudo):
    ARQUIVO_PLANTAS.write_text(
        json.dumps(conteudo, ensure_ascii=False, indent=2), encoding="utf-8")


def escolher_plantas(conteudo, ids):
    por_id = {p["id"]: p for p in conteudo["plantas"]}
    desconhecidos = [i for i in ids if i not in por_id]
    if desconhecidos:
        sys.exit(f"ids que não existem no Plantas.json: {', '.join(desconhecidos)}")
    return [por_id[i] for i in ids] if ids else conteudo["plantas"]


# =============================================================================
# 8. MODO NORMAL: foto para quem ainda não tem
# =============================================================================

def baixar_faltantes(ids):
    conteudo = ler_plantas()
    plantas = escolher_plantas(conteudo, ids)
    PASTA_FOTOS.mkdir(parents=True, exist_ok=True)
    baixadas = 0

    for numero, planta in enumerate(plantas, 1):
        if ja_tem_foto(planta):
            continue
        especie = nome_da_especie(planta["nomeCientifico"])
        print(f"[{numero}/{len(plantas)}] {planta['id']} ({especie})")

        foto = procurar_foto(especie)
        if foto is None:
            print("    sem foto")
            continue
        try:
            guardar_foto(planta, foto)
        except Exception as erro:
            print(f"    erro ao baixar ({erro})")
            continue
        baixadas += 1
        print(f"    ok - {foto['autor']} ({foto['licenca']})")
        if baixadas % 20 == 0:          # salva de tempos em tempos
            salvar(conteudo)

    salvar(conteudo)
    print(f"\n{baixadas} fotos baixadas agora.")
    escrever_relatorio(conteudo)


# =============================================================================
# 9. MODO TROCA: folha de candidatas e aplicar a escolha
# =============================================================================

def montar_folha(miniaturas, destino):
    """Junta as fotos numa grade de 4 colunas com o número de cada uma."""
    from PIL import Image, ImageDraw, ImageFont

    lado, colunas = 300, 4
    linhas = (len(miniaturas) + colunas - 1) // colunas
    folha = Image.new("RGB", (lado * colunas, lado * linhas), "white")
    desenho = ImageDraw.Draw(folha)
    try:
        fonte = ImageFont.truetype("arial.ttf", 36)
    except OSError:
        fonte = ImageFont.load_default()

    for indice, dados in enumerate(miniaturas):
        foto = Image.open(BytesIO(dados)).convert("RGB")
        foto.thumbnail((lado - 6, lado - 6))
        x, y = (indice % colunas) * lado, (indice // colunas) * lado
        folha.paste(foto, (x + (lado - foto.width) // 2, y + (lado - foto.height) // 2))
        desenho.rectangle([x + 4, y + 4, x + 48, y + 46], fill="black")
        desenho.text((x + 12, y + 6), str(indice + 1), fill="yellow", font=fonte)
    folha.save(destino, quality=85)


def gerar_candidatos(ids):
    conteudo = ler_plantas()
    PASTA_CANDIDATOS.mkdir(parents=True, exist_ok=True)

    for planta in escolher_plantas(conteudo, ids):
        especie = nome_da_especie(planta["nomeCientifico"])
        print(f"{planta['id']} ({especie})")
        try:
            fotos = candidatos_do_inaturalist(especie, QUANTOS_CANDIDATOS)
            miniaturas = []
            for foto in fotos:
                miniaturas.append(baixar_bytes(foto["url"].replace("/medium.", "/small.")))
        except Exception as erro:
            print(f"    erro ({erro})")
            continue
        if not fotos:
            print("    nenhuma candidata")
            continue
        (PASTA_CANDIDATOS / f"{planta['id']}.json").write_text(
            json.dumps(fotos, ensure_ascii=False, indent=2), encoding="utf-8")
        montar_folha(miniaturas, PASTA_CANDIDATOS / f"{planta['id']}.jpg")
        print(f"    {len(fotos)} candidatas")


def candidatos_do_commons(termo, quantos):
    """Busca por texto no Commons: 'bell pepper plant' acha pimentão no pé,
    coisa que o nome científico (o mesmo da pimenta) não separa."""
    busca = urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": f"{termo} filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 40,
        "prop": "imageinfo", "iiprop": "url|extmetadata|mime", "iiurlwidth": 500,
    })
    paginas = pedir_json(f"https://commons.wikimedia.org/w/api.php?{busca}")
    paginas = sorted(paginas.get("query", {}).get("pages", {}).values(),
                     key=lambda p: p.get("index", 0))
    fotos = []
    for pagina in paginas:
        info = (pagina.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        licenca = meta.get("LicenseShortName", {}).get("value", "")
        if info.get("mime") != "image/jpeg" or not licenca_commons_aceita(licenca):
            continue
        autor = limpar(re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", "")))
        fotos.append({
            "url": info.get("thumburl") or info["url"],
            "autor": autor or "Wikimedia Commons",
            "licenca": licenca,
            "origem": info["descriptionurl"],
        })
        if len(fotos) >= quantos:
            break
    return fotos


def gerar_candidatos_por_busca(id_planta, termo):
    """Mesma folha de candidatas, mas vinda de uma busca no Commons."""
    conteudo = ler_plantas()
    planta = escolher_plantas(conteudo, [id_planta])[0]
    PASTA_CANDIDATOS.mkdir(parents=True, exist_ok=True)
    fotos = candidatos_do_commons(termo, QUANTOS_CANDIDATOS)
    if not fotos:
        print(f"{planta['id']}: nenhuma candidata para '{termo}'")
        return
    miniaturas = [baixar_bytes(f["url"]) for f in fotos]
    (PASTA_CANDIDATOS / f"{planta['id']}.json").write_text(
        json.dumps(fotos, ensure_ascii=False, indent=2), encoding="utf-8")
    montar_folha(miniaturas, PASTA_CANDIDATOS / f"{planta['id']}.jpg")
    print(f"{planta['id']}: {len(fotos)} candidatas para '{termo}'")


def aplicar_escolhas():
    conteudo = ler_plantas()
    escolhas = json.loads(ARQUIVO_ESCOLHAS.read_text(encoding="utf-8"))
    plantas = escolher_plantas(conteudo, list(escolhas))

    for planta in plantas:
        escolha = escolhas[planta["id"]].get("escolha")
        if escolha is None:
            print(f"{planta['id']}: pendente")
            continue
        fotos = json.loads((PASTA_CANDIDATOS / f"{planta['id']}.json")
                           .read_text(encoding="utf-8"))
        foto = fotos[escolha - 1]
        antiga = (planta.get("imagem") or {}).get("arquivo")
        guardar_foto(planta, foto)
        if antiga and antiga != planta["imagem"]["arquivo"]:
            (PASTA_FRONT / antiga).unlink(missing_ok=True)
        print(f"{planta['id']}: foto {escolha} - {foto['autor']} ({foto['licenca']})")

    salvar(conteudo)
    escrever_relatorio(conteudo, escolhas)


# =============================================================================
# 10. RELATÓRIO
# =============================================================================

def escrever_relatorio(conteudo, escolhas=None):
    total = conteudo["plantas"]
    com_foto = sum(1 for p in total if ja_tem_foto(p))
    print(f"Com foto: {com_foto} de {len(total)}")

    linhas = [
        "# Fotos das plantas", "",
        f"Com foto: {com_foto} de {len(total)}.", "",
        "Para resolver na mão: coloque a foto em Front-end/imgs/plantas/<id>.jpg",
        "e preencha o campo imagem com autor, licença e url (página da foto).", "",
        "## Sem foto", "",
    ]
    linhas += [f"- `{p['id']}`: {p['nomePopular']} ({p['nomeCientifico']})"
               for p in total if not ja_tem_foto(p)] or ["Nenhuma."]
    if escolhas:
        pendentes = [(i, e.get("motivo", "")) for i, e in escolhas.items()
                     if e.get("escolha") is None]
        linhas += ["", "## Troca pendente (nenhuma candidata serviu)", ""]
        linhas += [f"- `{i}`: {motivo}" for i, motivo in pendentes] or ["Nenhuma."]
    ARQUIVO_RELATORIO.parent.mkdir(parents=True, exist_ok=True)
    ARQUIVO_RELATORIO.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"Relatório: {ARQUIVO_RELATORIO}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    argumentos = sys.argv[1:]
    if argumentos[:1] == ["--candidatos"]:
        gerar_candidatos(argumentos[1:])
    elif argumentos[:1] == ["--buscar"] and len(argumentos) == 3:
        gerar_candidatos_por_busca(argumentos[1], argumentos[2])
    elif argumentos[:1] == ["--aplicar"]:
        aplicar_escolhas()
    else:
        baixar_faltantes(argumentos)


if __name__ == "__main__":
    main()
