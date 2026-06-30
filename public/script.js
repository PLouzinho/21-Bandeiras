const socket = io();

let meuNumero = 0;

const contador = document.getElementById("contador");
const bandeiras = document.getElementById("bandeiras");
const estado = document.getElementById("estado");
const jogador = document.getElementById("jogador");
const mensagem = document.getElementById("mensagem");
const novoJogo = document.getElementById("novoJogo");

function desenhar(total) {
    bandeiras.innerHTML = "";

    for (let i = 0; i < total; i++) {
        const flag = document.createElement("span");
        flag.className = "bandeira";
        flag.textContent = "🚩";
        bandeiras.appendChild(flag);
    }

    contador.textContent = total;
}

desenhar(21);

function jogar(numero) {
    socket.emit("jogada", numero);
}

function novaPartida() {
    socket.emit("novaPartida");
    novoJogo.style.display = "none";
    mensagem.textContent = "";
}

socket.on("numeroJogador", (numero) => {
    meuNumero = numero;
    jogador.textContent = "És o Jogador " + numero;
});

socket.on("estado", (dados) => {

    desenhar(dados.bandeiras);

    if (meuNumero === 0) {
        estado.textContent = "À espera de jogadores...";
        return;
    }

    if (dados.vez + 1 === meuNumero) {
        estado.textContent = "É a tua vez";
    } else {
        estado.textContent = "Vez do adversário";
    }

});

socket.on("fim", (dados) => {

    desenhar(0);

    if (dados.vencedor === meuNumero) {
        mensagem.textContent = "🏆 Parabéns! Ganhaste!";
    } else {
        mensagem.textContent = "😢 Perdeste!";
    }

    novoJogo.style.display = "inline-block";

});

socket.on("cheio", () => {
    document.body.innerHTML = `
        <h1 style="text-align:center;margin-top:50px;">
            A sala já está cheia.
        </h1>
    `;
});
