// src/services/Socket.js

import API_CONFIG from "../config/config.js";

let socket = null;

export const connectSocket = (gameId, playerId, onUpdatePlayers, onGameStart) => {
    if (socket) socket.disconnect();

    socket = io(`${API_CONFIG.BASE_URL}`, { transports: ["websocket"] });

    socket.on("connect", () => {
        console.log("Conectado a Socket.IO", socket.id);
        socket.emit("joinGame", { gameId, playerId, name: "Jugador" });
    });

    socket.on("updatePlayers", (players) => {
        onUpdatePlayers(players);
    });

    socket.on("gameStarted", () => {
        onGameStart();
    });
};

export const sendMove = (direction, gameId, playerId) => {
    if (!socket) return;
    socket.emit("move", { direction, gameId, playerId });
};

export const startGame = (gameId) => {
    if (!socket) return;
    socket.emit("startGame", gameId);
};

export const stopGame = (gameId) => {
    if (!socket) return;
    socket.emit("stopGame", gameId);
};

export const disconnectSocket = () => {
    if (!socket) return;
    socket.disconnect();
    socket = null;
};
