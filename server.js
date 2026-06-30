const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let jogadores = [];
let bandeiras = 21;
let vez = 0; // 0 = jogador 1, 1 = jogador 2

function resetJogo() {
    bandeiras = 21;
    vez = 0;
}

io.on("connection", (socket) => {
    console.log("Jogador ligado:", socket.id);

    // entrar no jogo
    if (jogadores.length < 2) {
        jogadores.push(socket.id);

        socket.emit("numeroJogador", jogadores.length);

        io.emit("estado", {
            bandeiras,
            vez,
            pronto: jogadores.length === 2
        });
    } else {
        socket.emit("cheio");
        return;
    }

    socket.on("jogada", (qtd) => {
        if (jogadores[vez] !== socket.id) return;
        if (qtd < 1 || qtd > 3) return;
        if (qtd > bandeiras) return;
        if (jogadores.length < 2) return;

        bandeiras -= qtd;

        if (bandeiras <= 0) {
            io.emit("fim", {
                vencedor: vez + 1
            });

            resetJogo();
            io.emit("estado", {
                bandeiras,
                vez,
                pronto: true
            });
            return;
        }

        vez = vez === 0 ? 1 : 0;

        io.emit("estado", {
            bandeiras,
            vez,
            pronto: true
        });
    });

    socket.on("novaPartida", () => {
        resetJogo();

        io.emit("estado", {
            bandeiras,
            vez,
            pronto: jogadores.length === 2
        });
    });

    socket.on("disconnect", () => {
        console.log("Jogador saiu:", socket.id);

        jogadores = jogadores.filter(id => id !== socket.id);

        resetJogo();

        io.emit("estado", {
            bandeiras,
            vez,
            pronto: false
        });
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Servidor a correr na porta", PORT);
});
