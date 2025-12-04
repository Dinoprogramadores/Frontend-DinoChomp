import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_CONFIG from "../config/config.js";

let stompClient = null;
let connected = false;

export const connectLobbySocket = (gameId, onLobbyUpdate, onStart, player) => {
    // Prevenir reconexión si ya está activo
    if (stompClient && stompClient.active) {
        console.log("⚠️ Ya existe una conexión activa");
        return;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_CONFIG.BASE_URL}/ws/lobbies`),
        reconnectDelay: 5000,
        debug: (str) => console.log("[LOBBY STOMP]", str),
    });

    stompClient.onConnect = () => {
        connected = true;
        console.log(`✅ Conectado al lobby ${gameId}`);

        // 1️⃣ Suscribirse primero
        stompClient.subscribe(`/topic/lobbies/${gameId}/players`, (message) => {
            console.log("📦 Actualización de jugadores recibida");
            const updatedPlayers = JSON.parse(message.body);
            onLobbyUpdate(updatedPlayers);
        });

        stompClient.subscribe(`/topic/lobbies/${gameId}/start`, () => {
            console.log("🚀 Juego iniciado desde el host");
            onStart();
        });

        // 2️⃣ AHORA sí enviar JOIN (dentro de onConnect)
        setTimeout(() => {
            if (stompClient && stompClient.connected) {
                console.log("📤 Enviando JOIN al lobby");
                stompClient.publish({
                    destination: `/app/lobbies/${gameId}/join`,
                    body: JSON.stringify(player),
                });
            }
        }, 100);  // Reducido a 100ms, suficiente para que las suscripciones estén listas
    };

    stompClient.onStompError = (frame) => {
        console.error("❌ Error STOMP:", frame.headers.message);
        connected = false;
    };

    stompClient.onWebSocketError = (error) => {
        console.error("❌ Error WebSocket:", error);
        connected = false;
    };

    stompClient.onDisconnect = () => {
        console.log("🔌 Desconectado del lobby");
        connected = false;
    };

    stompClient.activate();
};

export const leaveLobby = (gameId, player) => {
    if (!connected || !stompClient?.connected) {
        console.log("⚠️ No conectado, no se puede hacer leave");
        return;
    }

    console.log("👋 Enviando LEAVE del lobby");
    stompClient.publish({
        destination: `/app/lobbies/${gameId}/leave`,
        body: JSON.stringify(player),
    });

    stompClient.deactivate();
    stompClient = null;
    connected = false;
};

export const startLobbyGame = (gameId) => {
    if (!connected || !stompClient?.connected) {
        console.log("⚠️ No conectado, no se puede iniciar");
        return;
    }

    console.log("🚀 Enviando START del juego");
    stompClient.publish({
        destination: `/app/lobbies/${gameId}/start`,
    });
};

export const disconnectLobbySocket = () => {
    if (stompClient && stompClient.active) {
        stompClient.deactivate();
        stompClient = null;
        connected = false;
        console.log("🔌 Conexión cerrada manualmente");
    }
};