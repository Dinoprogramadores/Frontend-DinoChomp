import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_CONFIG from "../config/config.js";
import { encryptJSON } from "../services/crypto.js";
import { decryptJSON } from "../services/crypto.js";


let stompClient = null;
let connected = false;

/**
 * Conecta el socket al backend usando STOMP + SockJS
 */
export const connectSocket = (gameId, onPlayerUpdate, onPowerUpdate, playerId, onFoodUpdate) => {
    if (stompClient && stompClient.active) {
        console.log("Cerrando conexión previa STOMP...");
        stompClient.deactivate();
        connected = false;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_CONFIG.BASE_URL}/ws`),
        reconnectDelay: 5000,
        debug: (str) => console.log("[STOMP]", str),
    });

    stompClient.onConnect = () => {
        connected = true;
        console.log(`Conectado al juego ${gameId}`);

        stompClient.subscribe(`/topic/games/${gameId}/players`, async (message) => {
            try {
                const json = await decryptJSON(message.body);
                const updatedPlayer = JSON.parse(json);
                console.log("Movimiento recibido:", updatedPlayer);

                onPlayerUpdate((prevPlayers) => {
                    const existingIndex = prevPlayers.findIndex(p => p.id === updatedPlayer.id);
                    const updated = {
                        id: updatedPlayer.id,
                        name: updatedPlayer.name,
                        email: updatedPlayer.email,
                        health: updatedPlayer.health,
                        isAlive: updatedPlayer.isAlive,
                        position: { row: updatedPlayer.positionY, col: updatedPlayer.positionX },
                        avatar: "/resources/DinoTRex.png",
                    };
                    if (existingIndex !== -1) {
                        const newPlayers = [...prevPlayers];
                        newPlayers[existingIndex] = updated;
                        return newPlayers;
                    } else {
                        return [...prevPlayers, updated];
                    }
                });
            } catch (err) {
                console.error("Error procesando mensaje:", err);
            }
        });
        console.log(`Suscrito al topic: /topic/games/${gameId}/players`);

        stompClient.subscribe(`/topic/games/${gameId}/food`, async (message) => {
            try {
                const json = await decryptJSON(message.body);
                const foodEvent = JSON.parse(json);
                console.log("Evento de comida recibido:", foodEvent);

                if (onFoodUpdate) {
                    onFoodUpdate(foodEvent);
                }
            } catch (err) {
                console.error("Error procesando foodEvent:", err);
            }
        });
        console.log(`Suscrito al topic: /topic/games/${gameId}/food`);

        stompClient.subscribe(`/topic/games/${gameId}/power`, async (message) => {
            try {
                const json = await decryptJSON(message.body);
                const powerEvent = JSON.parse(json);
                console.log("Evento de poder recibido:", powerEvent);

                if (onPowerUpdate) {
                    onPowerUpdate(powerEvent);
                }
            } catch (err) {
                console.error("Error procesando powerEvent:", err);
            }
        });
        console.log(`Suscrito al topic: /topic/games/${gameId}/power`);

        setTimeout(async () => {
            if (stompClient && stompClient.connected) {

                await sendEncrypted(`/app/games/${gameId}/join`, {
                    type: "PLAYER",
                    id: playerId,
                    name: localStorage.getItem("playerName"),
                    email: localStorage.getItem("playerEmail"),
                    positionX: 0,
                    positionY: 0,
                    health: 100,
                    alive: true,
                });

                console.log(`Jugador ${playerId} se unió al juego ${gameId}`);
            }
        }, 300);
    };

    stompClient.onStompError = (frame) => {
        console.error("Error STOMP:", frame.headers["message"]);
        console.error("Detalles:", frame.body);
    };

    stompClient.onWebSocketError = (err) => {
        console.error("Error WebSocket:", err);
    };

    stompClient.activate();
};
/**
 * Acceder al stomp client desde otros componentes
 */
export const getStompClient = () => stompClient;
/**
 * Envía un movimiento del jugador
 */
export async function sendMove(playerId, direction, gameId)  {
    if (!connected || !stompClient?.connected) {
        console.warn("No conectado al socket, ignorando movimiento.");
        return;
    }

    await sendEncrypted(`/app/games/${gameId}/move`, {
        playerId,
        direction
    });
};

/**
 * Inicia el bucle del juego
 */
export async function startGame (gameId) {
    if (!connected || !stompClient?.connected) return;
    await sendEncrypted(`/app/games/${gameId}/start`, { gameId });
};

/**
 * Detiene el bucle del juego
 */
export async function stopGame(gameId) {
    if (!connected || !stompClient?.connected) return;
    await sendEncrypted(`/app/games/${gameId}/stop`, { gameId });
}


/**
 * Notifica al backend que el temporizador ha iniciado
 */
export async function sendTimerStart(gameId) {
    if (!connected || !stompClient?.connected) return;
    await sendEncrypted(`/games/${gameId}/timer/start`, { gameId });
}


/**
 * Notifica al backend que el temporizador ha terminado
 */
export async function sendTimerStop(gameId) {
    if (!connected || !stompClient?.connected) return;
    await sendEncrypted(`/games/${gameId}/timer/stop`, { gameId });
}


async function sendEncrypted(destination, data) {
    const { iv, ciphertext } = await encryptJSON(data);

    const envelope = {
        iv,
        ciphertext,
        timestamp: Date.now()
    };

    stompClient.publish({
        destination,
        body: JSON.stringify(envelope)
    });
}
