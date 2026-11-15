const ficha = document.getElementById("ficha");
const statusFicha = document.getElementById("status-ficha");
const urlCatalogo = new URL("../../Data/Plantas.json", document.currentScript.src);

const parametros = new URLSearchParams(window.location.search);
const idPlanta = parametros.get("id");

// Traduz os códigos do JSON para o texto que aparece na tela
const textos = {
    "sol-pleno": "Sol pleno",
    "meia-sombra": "Meia-sombra",
    "sombra": "Sombra",
    "baixa": "Baixa",
    "media": "Média",
    "alta": "Alta",
    "acido": "Ácido",
    "neutro": "Neutro",
    "alcalino": "Alcalino",
    "adaptavel": "Adaptável",
    "bem-drenado": "bem drenado",
    "drenagem-alta": "drenagem alta",
    "retem-umidade": "retém umidade",
    "tolera-encharcamento": "tolera encharcamento",
    "facil": "Fácil",
    "dificil": "Difícil",
    "nao-toxica": "Não tóxica",
    "levemente-toxica": "Levemente tóxica",
    "toxica": "Tóxica"
};

// Adiciona uma linha ao quadro; se não houver valor, a linha não aparece
function adicionarLinha(quadro, rotulo, valor) {
    if (!valor) {
        return;
    }
    const termo = document.createElement("dt");
    termo.textContent = rotulo;
    const definicao = document.createElement("dd");
    definicao.textContent = valor;
    quadro.append(termo, definicao);
}

function mostrarNaoEncontrada() {
    const titulo = document.createElement("h2");
    titulo.textContent = "Planta não encontrada";

    const linkInicio = document.createElement("a");
    linkInicio.href = "index.html";
    linkInicio.textContent = "Voltar para o Início";

    ficha.replaceChildren(titulo, linkInicio);
}

function mostrarFicha(planta) {
    document.title = `Cultiva.me - ${planta.nomePopular}`;

    // Breadcrumb: Início > Nome da planta
    const breadcrumb = document.createElement("nav");
    breadcrumb.className = "breadcrumb";
    const linkInicio = document.createElement("a");
    linkInicio.href = "index.html";
    linkInicio.textContent = "Início";
    breadcrumb.append(linkInicio, " > ", planta.nomePopular);

    const topo = document.createElement("div");
    topo.className = "ficha-topo";

    // Foto com o crédito obrigatório (ver LICENCAS.md)
    if (planta.imagem && planta.imagem.arquivo) {
        const figura = document.createElement("figure");
        figura.className = "ficha-foto";

        const imagem = document.createElement("img");
        imagem.src = `../${planta.imagem.arquivo}`;
        imagem.alt = `Foto de ${planta.nomePopular}`;
        figura.append(imagem);

        if (planta.imagem.autor && planta.imagem.licenca && planta.imagem.url) {
            const credito = document.createElement("figcaption");
            credito.className = "credito-imagem";
            const linkCredito = document.createElement("a");
            linkCredito.href = planta.imagem.url;
            linkCredito.target = "_blank";
            linkCredito.rel = "noopener noreferrer";
            linkCredito.textContent = `${planta.imagem.autor} · ${planta.imagem.licenca}`;
            credito.append("Foto: ", linkCredito);
            figura.append(credito);
        }

        topo.append(figura);
    }

    // Nome, nome científico e descrição
    const info = document.createElement("div");
    info.className = "ficha-info";

    const nome = document.createElement("h2");
    nome.textContent = planta.nomePopular;
    info.append(nome);

    if (planta.nomeCientifico) {
        const nomeCientifico = document.createElement("p");
        nomeCientifico.className = "nome-cientifico";
        nomeCientifico.textContent = planta.nomeCientifico;
        info.append(nomeCientifico);
    }

    const descricao = document.createElement("p");
    if (planta.descricao) {
        descricao.textContent = planta.descricao;
    } else {
        descricao.className = "aviso";
        descricao.textContent = "Ainda não temos uma descrição para esta planta.";
    }
    info.append(descricao);

    topo.append(info);

    // Quadro de informações
    const quadro = document.createElement("dl");
    quadro.className = "ficha-quadro";

    let rega = textos[planta.agua.necessidade];
    if (planta.agua.intervaloDias.verao) {
        rega = `${rega} — a cada ${planta.agua.intervaloDias.verao} dias no verão`;
    }

    let solo = null;
    if (planta.solo.ph) {
        solo = `${textos[planta.solo.ph]}, ${textos[planta.solo.drenagem]}`;
    }

    let temperatura = null;
    if (planta.clima.temperaturaMinC !== null) {
        temperatura = `${planta.clima.temperaturaMinC} °C a ${planta.clima.temperaturaMaxC} °C`;
    }

    adicionarLinha(quadro, "Luz", textos[planta.luz]);
    adicionarLinha(quadro, "Rega", rega);
    adicionarLinha(quadro, "Solo", solo);
    adicionarLinha(quadro, "Dificuldade", textos[planta.dificuldade]);
    adicionarLinha(quadro, "Temperatura ideal", temperatura);
    adicionarLinha(quadro, "Altura adulta", `${planta.porte.alturaCm} cm`);
    adicionarLinha(quadro, "Toxicidade para pets", textos[planta.toxicidadePets]);

    topo.append(quadro);

    // Dicas de cultivo
    const secaoDicas = document.createElement("section");
    secaoDicas.className = "ficha-dicas";

    const tituloDicas = document.createElement("h3");
    tituloDicas.textContent = "Dicas de cultivo";
    secaoDicas.append(tituloDicas);

    if (planta.dicas.length > 0) {
        const listaDicas = document.createElement("ul");
        for (const dica of planta.dicas) {
            const item = document.createElement("li");
            item.textContent = dica;
            listaDicas.append(item);
        }
        secaoDicas.append(listaDicas);
    } else {
        const aviso = document.createElement("p");
        aviso.className = "aviso";
        aviso.textContent = "Ainda não temos dicas para esta planta.";
        secaoDicas.append(aviso);
    }

    ficha.replaceChildren(breadcrumb, topo, secaoDicas);
}

if (window.location.protocol === "file:") {
    statusFicha.textContent =
        "Para carregar a planta, abra a página por um servidor local (por exemplo, Live Server no VS Code), não diretamente como arquivo.";
} else {
    fetch(urlCatalogo)
        .then((resposta) => {
            if (!resposta.ok) {
                throw new Error(`Falha ao carregar ${urlCatalogo.pathname}: HTTP ${resposta.status}`);
            }
            return resposta.json();
        })
        .then((dados) => {
            if (!Array.isArray(dados.plantas)) {
                throw new Error("O arquivo Plantas.json não contém uma lista de plantas válida.");
            }
            const planta = dados.plantas.find((p) => p.id === idPlanta);
            if (planta) {
                mostrarFicha(planta);
            } else {
                mostrarNaoEncontrada();
            }
        })
        .catch((erro) => {
            console.error(erro);
            statusFicha.textContent =
                `Não foi possível carregar a planta (${erro.message}). ` +
                "Inicie o servidor local na pasta raiz do projeto para que Data/Plantas.json fique acessível.";
        });
}
