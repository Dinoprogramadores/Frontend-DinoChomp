import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_CONFIG from "../config/config.js";
import { encryptJSON, decryptJSON } from "../services/crypto";

let stompClient = null;
let connected = false;

export const connectLobbySocket = (gameId, onLobbyUpdate, onStart, player) => {
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

        stompClient.subscribe(`/topic/lobbies/${gameId}/players`, async (message) => {
            try {
                const players = await parseEncryptedMessage(message.body);
                onLobbyUpdate(players);
            } catch (e) {
                console.error("❌ Error descifrando players:", e);
            }
        });

        stompClient.subscribe(`/topic/lobbies/${gameId}/start`, async (message) => {
            try {
                const data = await parseEncryptedMessage(message.body);
                console.log("Start payload:", data);
                onStart();
            } catch (e) {
                console.error("❌ Error descifrando start:", e);
            }
        });

        // Enviar JOIN al conectarse
        setTimeout(async () => {
            if (stompClient && stompClient.connected) {
                // 🔥 encryptJSON ya retorna un string, NO hacer JSON.stringify
                const encrypted = await encryptJSON(player);
                stompClient.publish({
                    destination: `/app/lobbies/${gameId}/join`,
                    body: encrypted  // ✅ Enviar directamente
                });
            }
        }, 100);
    };

    stompClient.onStompError = () => (connected = false);
    stompClient.onWebSocketError = () => (connected = false);
    stompClient.onDisconnect = () => {
        console.log("🔌 Desconectado");
        connected = false;
    };

    stompClient.activate();
};

export const leaveLobby = async (gameId, player) => {
    if (!connected || !stompClient?.connected) return;
    
    // 🔥 NO hacer JSON.stringify del resultado de encryptJSON
    const encrypted = await encryptJSON(player);
    stompClient.publish({ 
        destination: `/app/lobbies/${gameId}/leave`, 
        body: encrypted  // ✅ Ya es string
    });
    
    disconnectLobbySocket();
};

export const startLobbyGame = async (gameId) => {
    if (!connected || !stompClient?.connected) return;
    
    // 🔥 NO hacer JSON.stringify del resultado de encryptJSON
    const encrypted = await encryptJSON({ start: true });
    stompClient.publish({ 
        destination: `/app/lobbies/${gameId}/start`, 
        body: encrypted  // ✅ Ya es string
    });
};

export const disconnectLobbySocket = () => {
    if (stompClient && stompClient.active) {
        stompClient.deactivate();
        stompClient = null;
        connected = false;
    }
};

// ===============================
// Función de parseo seguro
// ===============================
async function parseEncryptedMessage(body) {
    if (!body) return null;

    let obj;

    if (typeof body === "string") {
        // Limpiar comillas externas si las hubiera
        if (body.startsWith('"') && body.endsWith('"')) {
            body = body.substring(1, body.length - 1).replace(/\\"/g, '"');
        }

        obj = JSON.parse(body);
    } else {
        obj = body;
    }

    // Si es cifrado, descifrar
    if (obj?.iv && obj?.ciphertext) {
        return await decryptJSON(obj);
    }

    // Si no está cifrado, retornar tal cual
    return obj;
}