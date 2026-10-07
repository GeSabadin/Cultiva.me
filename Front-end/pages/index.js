const containerPlantas = document.getElementById("plantas-container");
const buscaPlantas = document.getElementById("busca-plantas");
const statusPlantas = document.getElementById("status-plantas");
const urlCatalogo = new URL("../../Data/Plantas.json", document.currentScript.src);
let plantas = [];

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function criarCartao(planta) {
    const cartao = document.createElement("article");
    cartao.className = "card";

    if (planta.imagem && planta.imagem.arquivo) {
        const imagem = document.createElement("img");
        imagem.className = "planta-imagem";
        imagem.src = `../${planta.imagem.arquivo}`;
        imagem.alt = `Foto de ${planta.nomePopular}`;
        imagem.loading = "lazy";
        cartao.append(imagem);

        if (planta.imagem.autor && planta.imagem.licenca && planta.imagem.url) {
            const credito = document.createElement("p");
            credito.className = "credito-imagem";
            const linkCredito = document.createElement("a");
            linkCredito.href = planta.imagem.url;
            linkCredito.target = "_blank";
            linkCredito.rel = "noopener noreferrer";
            linkCredito.textContent = `${planta.imagem.autor} · ${planta.imagem.licenca}`;
            credito.append("Foto: ", linkCredito);
            cartao.append(credito);
        }
    }

    const nome = document.createElement("h3");
    nome.textContent = planta.nomePopular;
    cartao.append(nome);

    if (planta.nomeCientifico) {
        const nomeCientifico = document.createElement("p");
        nomeCientifico.className = "nome-cientifico";
        nomeCientifico.textContent = planta.nomeCientifico;
        cartao.append(nomeCientifico);
    }

    if (planta.descricao) {
        const descricao = document.createElement("p");
        descricao.textContent = planta.descricao;
        cartao.append(descricao);
    }

    return cartao;
}

function mostrarPlantas(filtro = "") {
    const termo = normalizarTexto(filtro.trim());
    const plantasFiltradas = plantas.filter((planta) => {
        const textoBusca = normalizarTexto(
            `${planta.nomePopular} ${planta.nomeCientifico || ""} ${planta.categoria || ""}`
        );
        return textoBusca.includes(termo);
    });

    containerPlantas.replaceChildren(...plantasFiltradas.map(criarCartao));
    statusPlantas.textContent = plantasFiltradas.length
        ? `${plantasFiltradas.length} planta(s) encontrada(s).`
        : "Nenhuma planta encontrada.";
}

buscaPlantas.addEventListener("input", () => mostrarPlantas(buscaPlantas.value));

if (window.location.protocol === "file:") {
    statusPlantas.textContent =
        "Para carregar as plantas, abra a página por um servidor local (por exemplo, Live Server no VS Code), não diretamente como arquivo.";
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
            plantas = dados.plantas;
            mostrarPlantas(buscaPlantas.value);
        })
        .catch((erro) => {
            console.error(erro);
            statusPlantas.textContent =
                `Não foi possível carregar o catálogo (${erro.message}). ` +
                "Inicie o servidor local na pasta raiz do projeto para que Data/Plantas.json fique acessível.";
        });
}
