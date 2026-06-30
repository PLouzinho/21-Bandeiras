const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let jogadores = [];
let bandeiras = 21;
let vez = 0;

io.on("connection", (socket) => {
    console.log("Novo jogador:", socket.id);

    if (jogadores.length < 2) {
        jogadores.push(socket.id);

        socket.emit("numeroJogador", jogadores.length);

        io.emit("estado", {
            bandeiras,
            vez
        });

    } else {
        socket.emit("cheio");
    }

    socket.on("jogada", (quantidade) => {

        if (socket.id !== jogadores[vez]) return;

        if (quantidade < 1 || quantidade > 3) return;

        if (quantidade > bandeiras) return;

        bandeiras -= quantidade;

        if (bandeiras <= 0) {
            io.emit("fim", {
                vencedor: vez + 1
            });

            bandeiras = 21;
            vez = 0;
            return;
        }

        vez = (vez + 1) % 2;

        io.emit("estado", {
            bandeiras,
            vez
        });

    });

    socket.on("novaPartida", () => {

        bandeiras = 21;
        vez = 0;

        io.emit("estado", {
            bandeiras,
            vez
        });

    });

    socket.on("disconnect", () => {

        jogadores = jogadores.filter(id => id !== socket.id);

        bandeiras = 21;
        vez = 0;

        io.emit("estado", {
            bandeiras,
            vez
        });

        console.log("Jogador saiu.");

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
