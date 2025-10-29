// src/services/Socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;

export const connectSocket = (gameId, playerId, onUpdatePlayers, onGameStart) => {
    if (client && client.connected) client.deactivate();

    client = new Client({
        brokerURL: null, // obligatorio para SockJS
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        reconnectDelay: 5000,
        debug: (str) => console.log(str),
        onConnect: (frame) => {
            console.log("Conectado a STOMP:", frame);

            // Unirse al juego
            client.publish({
                destination: `/app/games/${gameId}/join`,
                body: JSON.stringify({ id: playerId, name: "Jugador" }),
            });

            // Escuchar jugadores
            client.subscribe(`/topic/games/${gameId}/players`, (message) => {
                const data = JSON.parse(message.body);
                onUpdatePlayers(data);
            });

            // Escuchar estado del juego
            client.subscribe(`/topic/games/${gameId}/status`, (message) => {
                const status = message.body;
                if (status === "Game started!") onGameStart();
            });
        },
        onStompError: (frame) => {
            console.error("STOMP Error:", frame);
        },
    });

    client.activate();
};

export const sendMove = (gameId, playerId, direction) => {
    if (!client || !client.connected) return;
    client.publish({
        destination: `/app/games/${gameId}/move`,
        body: JSON.stringify({ playerId, direction }),
    });
};

export const startGame = (gameId) => {
    if (!client || !client.connected) return;
    client.publish({
        destination: `/app/games/${gameId}/start`,
        body: JSON.stringify({}),
    });
};

export const stopGame = (gameId) => {
    if (!client || !client.connected) return;
    client.publish({
        destination: `/app/games/${gameId}/stop`,
        body: JSON.stringify({}),
    });
};

export const disconnectSocket = () => {
    if (client) {
        client.deactivate();
        client = null;
    }
};
