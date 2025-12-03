import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_CONFIG from "../config/config.js";

let stompClient = null;
let connected = false;

export const connectLobbySocket = (gameId, onLobbyUpdate, onStart, player) => {
    if (stompClient && stompClient.active) {
        stompClient.deactivate();
        connected = false;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_CONFIG.BASE_URL}/ws`),
        reconnectDelay: 5000,
        debug: (str) => console.log("[LOBBY STOMP]", str),
    });

    stompClient.onConnect = () => {
        connected = true;
        console.log(`Conectado al lobby ${gameId}`);

        // Enviar join
        setTimeout(() => {
            stompClient.publish({
                destination: `/app/lobbies/${gameId}/join`,
                body: JSON.stringify(player),
            });
        }, 300);

        // Suscribirse a actualizaciones de jugadores
        stompClient.subscribe(`/topic/lobbies/${gameId}/players`, (message) => {
            const updatedPlayers = JSON.parse(message.body);
            onLobbyUpdate(updatedPlayers);
        });

        // Suscribirse al evento de inicio
        stompClient.subscribe(`/topic/lobbies/${gameId}/start`, () => {
            console.log("Juego iniciado desde el host");
            onStart();
        });
    };

    stompClient.activate();
};

export const leaveLobby = (gameId, player) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({
        destination: `/app/lobbies/${gameId}/leave`,
        body: JSON.stringify({
            ...player,
            type: "PLAYER",
        }),
    });
    stompClient.deactivate();
};

export const startLobbyGame = (gameId) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({
        destination: `/app/lobbies/${gameId}/start`,
    });
};