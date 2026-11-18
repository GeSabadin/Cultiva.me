const chaveArmazenamento = "cultiva.me.minhasPlantas";

// Pode lançar erro: JSON corrompido ou localStorage bloqueado
export function lerIdsSalvos() {
    const valorSalvo = localStorage.getItem(chaveArmazenamento);
    if (valorSalvo === null) {
        return [];
    }

    const ids = JSON.parse(valorSalvo);
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
        throw new Error("A lista salva não tem um formato válido.");
    }
    return [...new Set(ids)];
}

// Pode lançar erro: localStorage bloqueado ou cheio
export function salvarIds(ids) {
    localStorage.setItem(chaveArmazenamento, JSON.stringify(ids));
}
