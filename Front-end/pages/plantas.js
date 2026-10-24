const campoBusca = document.getElementById("busca");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");

let plantas = [];

// Mostra na tela as plantas que recebe
function mostrar(listaDePlantas) {
    lista.innerHTML = "";

    for (const planta of listaDePlantas) {
        lista.innerHTML += `
            <article class="card">
                <h3>${planta.nomePopular}</h3>
                <p>${planta.descricao || ""}</p>
            </article>
        `;
    }

    if (listaDePlantas.length === 0) {
        mensagem.textContent = "Nenhuma planta encontrada.";
    } else {
        mensagem.textContent = listaDePlantas.length + " planta(s) encontrada(s).";
    }
}

// Filtra as plantas pelo que foi digitado
function buscar() {
    const texto = campoBusca.value.toLowerCase();

    const resultado = plantas.filter(function (planta) {
        return planta.nomePopular.toLowerCase().includes(texto);
    });

    mostrar(resultado);
}

// Carrega o arquivo JSON e mostra todas as plantas
fetch("../../Data/Plantas.json")
    .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {
        plantas = dados.plantas;
        mostrar(plantas);
    });

// Busca a cada letra digitada
campoBusca.addEventListener("input", buscar);
