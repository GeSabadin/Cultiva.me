import { ImagemPlanta } from "./imagem-planta.js";
import { Agua } from "./agua.js";
import { Solo } from "./solo.js";
import { Clima } from "./clima.js";
import { Porte } from "./porte.js";
import { Ciclo } from "./ciclo.js";
import { ProblemaComum } from "./problema-comum.js";

export class Planta {
    constructor(dados) {
        Object.assign(this, dados);
        this.imagem = dados.imagem === null ? null : new ImagemPlanta(dados.imagem);
        this.agua = new Agua(dados.agua);
        this.solo = new Solo(dados.solo);
        this.clima = new Clima(dados.clima);
        this.porte = new Porte(dados.porte);
        this.ciclo = new Ciclo(dados.ciclo);
        this.problemasComuns = dados.problemasComuns.map((problema) => new ProblemaComum(problema));
    }
}
