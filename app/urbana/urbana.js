import { Planta } from "../compartilhado/modelos/planta.js";

const escolha = document.getElementById("escolha-espaco");
const blocos = document.querySelectorAll(".conteudo-espaco");
const linkVerTodas = document.getElementById("ver-todas");
const containerPlantas = document.getElementById("plantas-recomendadas");
const statusPlantas = document.getElementById("status-recomendadas");
const urlCatalogo = new URL("../../Data/Plantas.json", import.meta.url);
const quantidadeRecomendadas = 4;

let plantas = [];

// O chip marcado guarda os filtros nos atributos data-*
// (ex.: data-ambiente="varanda" data-luz="sol-pleno").
function chipMarcado() {
    return escolha.querySelector('input[name="espaco"]:checked');
}

function filtrosDoChip(chip) {
    const filtros = {};
    if (chip.dataset.ambiente) {
        filtros.ambiente = chip.dataset.ambiente;
    }
    if (chip.dataset.luz) {
        filtros.luz = chip.dataset.luz;
    }
    if (chip.dataset.categoria) {
        filtros.categoria = chip.dataset.categoria;
    }
    return filtros;
}

// Mostra só o bloco de dicas cujo data-espaco é igual ao value do chip.
function mostrarConteudo(espaco) {
    for (const bloco of blocos) {
        bloco.hidden = bloco.dataset.espaco !== espaco;
    }
}

function atualizarLink(filtros) {
    const parametros = new URLSearchParams(filtros);
    linkVerTodas.href = `../plantas/catalogo-plantas.html?${parametros}`;
}

function combina(planta, filtros) {
    if (filtros.ambiente && !(planta.ambientes || []).includes(filtros.ambiente)) {
        return false;
    }
    if (filtros.luz && planta.luz !== filtros.luz) {
        return false;
    }
    if (filtros.categoria && planta.categoria !== filtros.categoria) {
        return false;
    }
    return true;
}

function criarCartao(planta) {
    const cartao = document.createElement("article");
    cartao.className = "card";

    const enderecoFicha = `../plantas/ficha-planta.html?id=${encodeURIComponent(planta.id)}`;

    if (planta.imagem && planta.imagem.arquivo) {
        const imagem = document.createElement("img");
        imagem.className = "planta-imagem";
        imagem.src = `../compartilhado/${planta.imagem.arquivo}`;
        imagem.alt = `Foto de ${planta.nomePopular}`;
        imagem.loading = "lazy";

        const linkImagem = document.createElement("a");
        linkImagem.href = enderecoFicha;
        linkImagem.append(imagem);
        cartao.append(linkImagem);

        // O LICENCAS.md exige o crédito de toda foto exibida.
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
    const linkNome = document.createElement("a");
    linkNome.href = enderecoFicha;
    linkNome.textContent = planta.nomePopular;
    nome.append(linkNome);
    cartao.append(nome);

    if (planta.nomeCientifico) {
        const nomeCientifico = document.createElement("p");
        nomeCientifico.className = "nome-cientifico";
        nomeCientifico.textContent = planta.nomeCientifico;
        cartao.append(nomeCientifico);
    }

    return cartao;
}

function mostrarRecomendadas(filtros) {
    if (plantas.length === 0) {
        return;
    }

    const recomendadas = plantas
        .filter((planta) => combina(planta, filtros))
        .slice(0, quantidadeRecomendadas);

    containerPlantas.replaceChildren(...recomendadas.map(criarCartao));
    statusPlantas.textContent = recomendadas.length === 0
        ? "Ainda não temos plantas cadastradas para este espaço."
        : "";
}

function atualizar() {
    const chip = chipMarcado();
    const filtros = filtrosDoChip(chip);

    mostrarConteudo(chip.value);
    atualizarLink(filtros);
    mostrarRecomendadas(filtros);
}

escolha.addEventListener("change", atualizar);
atualizar();

if (window.location.protocol === "file:") {
    statusPlantas.textContent =
        "Para ver as plantas recomendadas, abra a página por um servidor local (por exemplo, Live Server).";
} else {
    statusPlantas.textContent = "Carregando plantas...";
    fetch(urlCatalogo)
        .then((resposta) => {
            if (!resposta.ok) {
                throw new Error(`HTTP ${resposta.status}`);
            }
            return resposta.json();
        })
        .then((dados) => {
            if (!Array.isArray(dados.plantas)) {
                throw new Error("O arquivo Plantas.json não contém uma lista de plantas válida.");
            }
            plantas = dados.plantas.map((planta) => new Planta(planta));
            atualizar();
        })
        .catch((erro) => {
            console.error(erro);
            statusPlantas.textContent =
                `Não foi possível carregar as plantas (${erro.message}). ` +
                "Inicie o servidor local na pasta raiz do projeto.";
        });
}
