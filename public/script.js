const socket = io();

let meuNumero = 0;

const status = document.getElementById("status");
const jogador = document.getElementById("jogador");
const contador = document.getElementById("contador");
const bandeiras = document.getElementById("bandeiras");
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

function jogar(qtd) {
    socket.emit("jogada", qtd);
}

function novaPartida() {
    socket.emit("novaPartida");
    mensagem.textContent = "";
    novoJogo.style.display = "none";
}

socket.on("numeroJogador", (num) => {
    meuNumero = num;
    jogador.textContent = "És o Jogador " + num;
});

socket.on("estado", (dados) => {
    desenhar(dados.bandeiras);

    if (!dados.pronto) {
        status.textContent = "À espera de 2 jogadores...";
        return;
    }

    if (dados.vez + 1 === meuNumero) {
        status.textContent = "É a tua vez";
    } else {
        status.textContent = "Vez do adversário";
    }
});

socket.on("fim", (dados) => {
    if (dados.vencedor === meuNumero) {
        mensagem.textContent = "🏆 Ganhaste!";
    } else {
        mensagem.textContent = "😢 Perdeste!";
    }

    novoJogo.style.display = "inline-block";
});

socket.on("cheio", () => {
    document.body.innerHTML = "<h1 style='text-align:center;margin-top:50px;'>Sala cheia</h1>";
});
