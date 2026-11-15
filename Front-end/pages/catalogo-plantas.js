const campoBusca = document.getElementById("busca");
const filtros = document.getElementById("filtros-plantas");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");
const urlCatalogo = new URL("../../Data/Plantas.json", document.currentScript.src);

let plantas = [];

function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function textoDaPlanta(planta) {
    const problemas = Array.isArray(planta.problemasComuns)
        ? planta.problemasComuns.flatMap((problema) => Object.values(problema))
        : [];
    const dicas = Array.isArray(planta.dicas) ? planta.dicas : [];

    return normalizar([
        planta.id,
        planta.nomePopular,
        planta.nomeCientifico,
        planta.familia,
        planta.regiaoDeOrigem,
        planta.descricao,
        ...dicas,
        ...problemas,
    ].join(" "));
}

function correspondeCaracteristicas(planta) {
    const ambiente = document.getElementById("filtro-ambiente").value;
    const propagacao = document.getElementById("filtro-propagacao").value;
    const ciclo = planta.ciclo || {};
    const solo = planta.solo || {};
    const agua = planta.agua || {};
    const clima = planta.clima || {};
    const porte = planta.porte || {};

    if (document.getElementById("filtro-categoria").value &&
        planta.categoria !== document.getElementById("filtro-categoria").value) {
        return false;
    }
    if (document.getElementById("filtro-dificuldade").value &&
        planta.dificuldade !== document.getElementById("filtro-dificuldade").value) {
        return false;
    }
    if (ambiente && !(planta.ambientes || []).includes(ambiente)) {
        return false;
    }
    if (document.getElementById("filtro-luz").value &&
        planta.luz !== document.getElementById("filtro-luz").value) {
        return false;
    }
    if (document.getElementById("filtro-ciclo").value &&
        ciclo.tipo !== document.getElementById("filtro-ciclo").value) {
        return false;
    }
    if (document.getElementById("filtro-toxicidade").value &&
        planta.toxicidadePets !== document.getElementById("filtro-toxicidade").value) {
        return false;
    }
    if (document.getElementById("filtro-agua").value &&
        agua.necessidade !== document.getElementById("filtro-agua").value) {
        return false;
    }
    if (document.getElementById("filtro-modo-rega").value &&
        agua.modo !== document.getElementById("filtro-modo-rega").value) {
        return false;
    }
    if (document.getElementById("filtro-ph").value &&
        solo.ph !== document.getElementById("filtro-ph").value) {
        return false;
    }
    if (document.getElementById("filtro-drenagem").value &&
        solo.drenagem !== document.getElementById("filtro-drenagem").value) {
        return false;
    }
    if (document.getElementById("filtro-umidade").value &&
        clima.umidade !== document.getElementById("filtro-umidade").value) {
        return false;
    }
    if (document.getElementById("filtro-crescimento").value &&
        porte.crescimento !== document.getElementById("filtro-crescimento").value) {
        return false;
    }
    if (propagacao && !(planta.propagacao || []).includes(propagacao)) {
        return false;
    }
    return true;
}

function criarCartao(planta) {
    const cartao = document.createElement("article");
    cartao.className = "card";

    const imagem = planta.imagem || {};
    if (imagem.arquivo) {
        const foto = document.createElement("img");
        foto.className = "planta-imagem";
        foto.src = `../${imagem.arquivo}`;
        foto.alt = `Foto de ${planta.nomePopular}`;
        foto.loading = "lazy";
        cartao.append(foto);

        if (imagem.autor && imagem.licenca && imagem.url) {
            const credito = document.createElement("p");
            credito.className = "credito-imagem";
            const linkCredito = document.createElement("a");
            linkCredito.href = imagem.url;
            linkCredito.target = "_blank";
            linkCredito.rel = "noopener noreferrer";
            linkCredito.textContent = `${imagem.autor} · ${imagem.licenca}`;
            credito.append("Foto: ", linkCredito);
            cartao.append(credito);
        }
    }

    const titulo = document.createElement("h3");
    const linkFicha = document.createElement("a");
    linkFicha.href = `ficha-planta.html?id=${encodeURIComponent(planta.id)}`;
    linkFicha.textContent = planta.nomePopular;
    titulo.append(linkFicha);
    cartao.append(titulo);

    if (planta.descricao) {
        const descricao = document.createElement("p");
        descricao.textContent = planta.descricao;
        cartao.append(descricao);
    }

    return cartao;
}

function mostrar(listaDePlantas) {
    const cartoes = listaDePlantas.map(criarCartao);
    lista.replaceChildren(...cartoes);

    const quantidade = listaDePlantas.length;
    mensagem.textContent = `${quantidade} planta${quantidade === 1 ? "" : "s"} encontrada${quantidade === 1 ? "" : "s"}.`;
}

function buscar() {
    const termo = normalizar(campoBusca.value.trim());
    const resultado = plantas.filter((planta) =>
        (!termo || textoDaPlanta(planta).includes(termo)) &&
        correspondeCaracteristicas(planta));
    mostrar(resultado);
}

campoBusca.addEventListener("input", buscar);
filtros.addEventListener("input", buscar);
filtros.addEventListener("change", buscar);
filtros.addEventListener("submit", (evento) => evento.preventDefault());
filtros.addEventListener("reset", () => window.setTimeout(buscar, 0));

if (window.location.protocol === "file:") {
    mensagem.textContent =
        "Abra a página por um servidor local para carregar e filtrar o catálogo de plantas.";
} else {
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
            plantas = dados.plantas;
            buscar();
        })
        .catch((erro) => {
            console.error(erro);
            mensagem.textContent =
                `Não foi possível carregar o catálogo (${erro.message}). ` +
                "Inicie o servidor local na pasta raiz do projeto.";
        });
}
