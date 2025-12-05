import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_CONFIG from "../config/config.js";
import { encryptJSON, decryptJSON } from "../services/crypto";

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

        // Suscribirse a actualizaciones de jugadores
        stompClient.subscribe(`/topic/lobbies/${gameId}/players`, async (message) => {
            const json = await decryptJSON(message.body);
            const updatedPlayers = JSON.parse(json);
            onLobbyUpdate(updatedPlayers);
        });

        // Suscribirse al evento de inicio
        stompClient.subscribe(`/topic/lobbies/${gameId}/start`, () => {
            console.log("Juego iniciado desde el host");
            onStart();
        });
    };

    // Enviar join
    setTimeout(async () => {
        const payload = await encryptJSON(player);
        stompClient.publish({
            destination: `/app/lobbies/${gameId}/join`,
            body: JSON.stringify(player),
        });
    }, 300);

    stompClient.activate();
};

export const leaveLobby = async (gameId, player) => {
    if (!connected || !stompClient?.connected) return;
    const payload = await encryptJSON({ ...player, type: "PLAYER" });
    stompClient.publish({
        destination: `/app/lobbies/${gameId}/leave`,
        body: JSON.stringify({
            ...player,
            type: "PLAYER",
        }),
    });
    stompClient.deactivate();
};

export const startLobbyGame = async (gameId) => {
    if (!connected || !stompClient?.connected) return;
    const payload = await encryptJSON({ gameId });
    stompClient.publish({
        destination: `/app/lobbies/${gameId}/start`,
    });
};

