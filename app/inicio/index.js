import { Planta } from "../compartilhado/modelos/planta.js";

// Elementos da página que recebem os cartões e as mensagens de estado.
const containerPlantas = document.getElementById("plantas-container");
const statusPlantas = document.getElementById("status-plantas");

// Localiza o catálogo a partir do endereço deste arquivo JavaScript.
const urlCatalogo = new URL("../../Data/Plantas.json", import.meta.url);

// A lista será preenchida depois que o catálogo for carregado.
let plantas = [];

// Cria e retorna um cartão HTML para uma planta.
function criarCartao(planta) {
    const cartao = document.createElement("article");
    cartao.className = "card";

    // O identificador da planta é usado para abrir sua ficha completa.
    const enderecoFicha = `../plantas/ficha-planta.html?id=${planta.id}`;

    // A imagem e seus créditos só são exibidos quando os dados estão disponíveis.
    if (planta.imagem && planta.imagem.arquivo) {
        const imagem = document.createElement("img");
        imagem.className = "planta-imagem";
        imagem.src = `../compartilhado/${planta.imagem.arquivo}`;
        imagem.alt = `Foto de ${planta.nomePopular}`;
        imagem.loading = "lazy"; // Carrega a imagem quando ela estiver próxima de aparecer na tela.
        
        // Faz da imagem um link para a ficha da planta.
        const linkImagem = document.createElement("a");
        linkImagem.href = enderecoFicha;
        linkImagem.append(imagem);
        cartao.append(linkImagem);

        // Exibe o crédito somente quando autor, licença e fonte foram informados.
        if (planta.imagem.autor && planta.imagem.licenca && planta.imagem.url) {
            const credito = document.createElement("p");
            credito.className = "credito-imagem";
            const linkCredito = document.createElement("a");
            linkCredito.href = planta.imagem.url;
            linkCredito.target = "_blank"; // Abre a fonte da imagem em outra aba.
            linkCredito.rel = "noopener noreferrer"; // Evita acesso da nova aba à página original.
            linkCredito.textContent = `${planta.imagem.autor} · ${planta.imagem.licenca}`;
            credito.append("Foto: ", linkCredito);
            cartao.append(credito);
        }
    }

    // Adiciona o nome popular como link para a ficha da planta.
    const nome = document.createElement("h3");
    const linkNome = document.createElement("a");
    linkNome.href = enderecoFicha;
    linkNome.textContent = planta.nomePopular;
    nome.append(linkNome);
    cartao.append(nome);

    // Nome científico e descrição são opcionais no cartão.
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

// Exibe os cartões das plantas em destaque na página inicial.
function mostrarPlantas() {
    // Seleciona as oito primeiras plantas do catálogo para exibir como destaques.
    const destaques = plantas.slice(0, 8);

    // Cria um cartão para cada destaque e substitui o conteúdo atual do contêiner.
    containerPlantas.replaceChildren(...destaques.map(criarCartao));

    // Limpa a mensagem de carregamento depois que os cartões são exibidos.
    statusPlantas.textContent = "";
}

// O catálogo não pode ser carregado diretamente de um arquivo file://.
if (window.location.protocol === "file:") {
    statusPlantas.textContent =
        "Para carregar as plantas, abra a página por um servidor local (por exemplo, Live Server no VS Code), não diretamente como arquivo.";
} else {
    // Solicita o arquivo JSON ao servidor local.
    fetch(urlCatalogo)
        .then((resposta) => {
            // Converte respostas HTTP malsucedidas em erros para serem tratadas no catch.
            if (!resposta.ok) {
                throw new Error(`Falha ao carregar ${urlCatalogo.pathname}: HTTP ${resposta.status}`);
            }
            return resposta.json();
        })
        .then((dados) => {
            // Confirma que o JSON contém a lista esperada antes de usá-la.
            if (!Array.isArray(dados.plantas)) {
                throw new Error("O arquivo Plantas.json não contém uma lista de plantas válida.");
            }

            // Guarda as plantas carregadas e atualiza o conteúdo da página.
            plantas = dados.plantas.map((planta) => new Planta(planta));
            mostrarPlantas();
        })
        .catch((erro) => {
            // Registra detalhes para diagnóstico e mostra uma orientação para a pessoa usuária.
            console.error(erro);
            statusPlantas.textContent =
                `Não foi possível carregar o catálogo (${erro.message}). ` +
                "Inicie o servidor local na pasta raiz do projeto para que Data/Plantas.json fique acessível.";
        });
}
