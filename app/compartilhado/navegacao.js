const dropdowns = document.querySelectorAll("header .menu-dropdown");
const navegacao = document.querySelector("header nav");

document.addEventListener("click", (evento) => {
    for (const dropdown of dropdowns) {
        if (dropdown.open && !dropdown.contains(evento.target)) {
            dropdown.open = false;
        }
    }
});

navegacao.addEventListener("toggle", (evento) => {
    const menuAberto = evento.target;
    if (!menuAberto.matches(".menu-dropdown") || !menuAberto.open) {
        return;
    }

    for (const dropdown of dropdowns) {
        if (dropdown !== menuAberto && dropdown.open) {
            dropdown.open = false;
        }
    }
}, true);
