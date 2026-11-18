import { Planta } from "../compartilhado/modelos/planta.js";
import { lerIdsSalvos, salvarIds } from "../compartilhado/armazenamento.js";

const formulario = document.getElementById("form-minhas-plantas");
const seletorPlanta = document.getElementById("selecionar-planta");
const listaMinhasPlantas = document.getElementById("lista-minhas-plantas");
const statusMinhasPlantas = document.getElementById("status-minhas-plantas");
const urlCatalogo = new URL("../../Data/Plantas.json", import.meta.url);

let plantas = [];
let idsSalvos = [];

function preencherSeletor() {
    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione uma planta";
    seletorPlanta.replaceChildren(opcaoInicial);

    for (const planta of plantas) {
        const opcao = document.createElement("option");
        opcao.value = planta.id;
        opcao.textContent = planta.nomePopular;
        seletorPlanta.append(opcao);
    }
    seletorPlanta.disabled = plantas.length === 0;
    formulario.querySelector("button[type='submit']").disabled = plantas.length === 0;
}

function criarCartao(plantaId) {
    const planta = plantas.find((item) => item.id === plantaId);
    const cartao = document.createElement("article");
    cartao.className = "card minha-planta-card";

    if (planta && planta.imagem && planta.imagem.arquivo) {
        const imagem = document.createElement("img");
        imagem.className = "planta-imagem";
        imagem.src = `../compartilhado/${planta.imagem.arquivo}`;
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

    const titulo = document.createElement("h3");
    if (planta) {
        const linkFicha = document.createElement("a");
        linkFicha.href = `../plantas/ficha-planta.html?id=${encodeURIComponent(planta.id)}`;
        linkFicha.textContent = planta.nomePopular;
        titulo.append(linkFicha);

        if (planta.nomeCientifico) {
            const nomeCientifico = document.createElement("p");
            nomeCientifico.className = "nome-cientifico";
            nomeCientifico.textContent = planta.nomeCientifico;
            cartao.append(titulo, nomeCientifico);
        } else {
            cartao.append(titulo);
        }
    } else {
        titulo.textContent = "Planta não encontrada no catálogo";
        cartao.append(titulo);
    }

    const remover = document.createElement("button");
    remover.className = "botao";
    remover.type = "button";
    remover.textContent = "Remover da lista";
    remover.addEventListener("click", () => removerPlanta(plantaId));
    cartao.append(remover);

    return cartao;
}

function mostrarColecao() {
    listaMinhasPlantas.replaceChildren();

    if (idsSalvos.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "colecao-vazia";
        vazio.textContent = "Sua lista está vazia. Escolha uma planta acima para começar.";
        listaMinhasPlantas.append(vazio);
        return;
    }

    for (const plantaId of idsSalvos) {
        listaMinhasPlantas.append(criarCartao(plantaId));
    }
}

function adicionarPlanta(evento) {
    evento.preventDefault();
    const plantaId = seletorPlanta.value;

    if (!plantaId) {
        statusMinhasPlantas.textContent = "Selecione uma planta antes de adicionar.";
        return;
    }
    if (idsSalvos.includes(plantaId)) {
        statusMinhasPlantas.textContent = "Essa planta já está na sua lista.";
        return;
    }

    const novaLista = [...idsSalvos, plantaId];
    try {
        salvarIds(novaLista);
    } catch (erro) {
        console.error(erro);
        statusMinhasPlantas.textContent = `Não foi possível salvar a planta: ${erro.message}`;
        return;
    }

    idsSalvos = novaLista;
    mostrarColecao();
    statusMinhasPlantas.textContent = "Planta adicionada à sua lista.";
    formulario.reset();
}

function removerPlanta(plantaId) {
    const novaLista = idsSalvos.filter((id) => id !== plantaId);
    try {
        salvarIds(novaLista);
    } catch (erro) {
        console.error(erro);
        statusMinhasPlantas.textContent = `Não foi possível atualizar a lista: ${erro.message}`;
        return;
    }

    idsSalvos = novaLista;
    mostrarColecao();
    statusMinhasPlantas.textContent = "Planta removida da sua lista.";
}

function carregarCatalogo() {
    fetch(urlCatalogo)
        .then((resposta) => {
            if (!resposta.ok) {
                throw new Error(`Falha ao carregar o catálogo: HTTP ${resposta.status}`);
            }
            return resposta.json();
        })
        .then((dados) => {
            if (!Array.isArray(dados.plantas)) {
                throw new Error("O arquivo Plantas.json não contém uma lista de plantas válida.");
            }

            plantas = dados.plantas.map((planta) => new Planta(planta));
            preencherSeletor();

            try {
                idsSalvos = lerIdsSalvos();
            } catch (erro) {
                console.error(erro);
                statusMinhasPlantas.textContent =
                    `Não foi possível ler sua lista salva (${erro.message}).`;
                return;
            }

            mostrarColecao();
            statusMinhasPlantas.textContent = "";
        })
        .catch((erro) => {
            console.error(erro);
            statusMinhasPlantas.textContent =
                `Não foi possível carregar o catálogo (${erro.message}). ` +
                "Inicie um servidor local na pasta raiz do projeto.";
        });
}

formulario.addEventListener("submit", adicionarPlanta);

if (window.location.protocol === "file:") {
    seletorPlanta.disabled = true;
    statusMinhasPlantas.textContent =
        "Abra esta página por um servidor local para carregar o catálogo e salvar sua lista.";
} else {
    carregarCatalogo();
}
