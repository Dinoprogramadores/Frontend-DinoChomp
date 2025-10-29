import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_CONFIG from "../config/config.js";

let stompClient = null;
let connected = false;

/**
 * Conecta el socket al backend usando STOMP + SockJS
 */
export const connectSocket = (gameId, onPlayerUpdate, onPowerUpdate, playerId) => {
    // Cerrar conexión previa si existe
    if (stompClient && stompClient.active) {
        console.log("⚠️ Cerrando conexión previa STOMP...");
        stompClient.deactivate();
        connected = false;
    }

    // Crear nuevo cliente STOMP
    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_CONFIG.BASE_URL}/ws`),
        reconnectDelay: 5000,
        debug: (str) => console.log("[STOMP]", str),
    });

    // Cuando se conecta correctamente
    stompClient.onConnect = () => {
        connected = true;
        console.log(`✅ Conectado al juego ${gameId}`);

        // 👉 Suscribirse a actualizaciones de jugadores
        stompClient.subscribe(`/topic/games/${gameId}/players`, (message) => {
            try {
                const updatedPlayer = JSON.parse(message.body);
                console.log("📡 Movimiento recibido:", updatedPlayer);

                onPlayerUpdate((prevPlayers) => {
                    const existingIndex = prevPlayers.findIndex(p => p.id === updatedPlayer.id);
                    const updated = {
                        id: updatedPlayer.id,
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
                console.error("❌ Error procesando mensaje:", err);
            }
        });
        console.log(`📡 Suscrito al topic: /topic/games/${gameId}/players`);

        // 👉 Suscribirse al topic de poderes
        stompClient.subscribe(`/topic/games/${gameId}/power`, (message) => {
            try {
                const powerEvent = JSON.parse(message.body);
                console.log("⚡ Evento de poder recibido:", powerEvent);

                if (onPowerUpdate) {
                    onPowerUpdate(powerEvent);
                }
            } catch (err) {
                console.error("❌ Error procesando powerEvent:", err);
            }
        });
        console.log(`⚡ Suscrito al topic: /topic/games/${gameId}/power`);

        // 👉 Publicar evento "join" (cuando el jugador entra al juego)
        setTimeout(() => {
            if (stompClient && stompClient.connected) {
                stompClient.publish({
                    destination: `/app/games/${gameId}/join`,
                    body: JSON.stringify({
                        type: "PLAYER",
                        id: Array.isArray(playerId) ? playerId[0] : playerId,
                        positionX: 0,
                        positionY: 0,
                        health: 100,
                        alive: true,
                    }),
                });
                console.log(`🙋‍♂️ Jugador ${playerId} se unió al juego ${gameId}`);
            }
        }, 300);
    };

    stompClient.onStompError = (frame) => {
        console.error("❌ Error STOMP:", frame.headers["message"]);
        console.error("Detalles:", frame.body);
    };

    stompClient.onWebSocketError = (err) => {
        console.error("❌ Error WebSocket:", err);
    };

    stompClient.activate();
};

/**
 * Envía un movimiento del jugador
 */
export const sendMove = (playerId, direction, gameId) => {
    if (!connected || !stompClient?.connected) {
        console.warn("⚠️ No conectado al socket, ignorando movimiento.");
        return;
    }

    stompClient.publish({
        destination: `/app/games/${gameId}/move`,
        body: JSON.stringify({ playerId, direction }),
    });
};

/**
 * Inicia el bucle del juego
 */
export const startGame = (gameId) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({ destination: `/app/games/${gameId}/start` });
};

/**
 * Detiene el bucle del juego
 */
export const stopGame = (gameId) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({ destination: `/app/games/${gameId}/stop` });
};

/**
 * Notifica al backend que el temporizador ha iniciado
 */
export const sendTimerStart = (gameId) => {
  if (!connected || !stompClient?.connected) return;
  stompClient.publish({ destination: `/games/${gameId}/timer/start` });
  console.log(`▶️ Notificado inicio de timer para el juego ${gameId}`);
};

/**
 * Notifica al backend que el temporizador ha terminado
 */
export const sendTimerStop = (gameId) => {
  if (!connected || !stompClient?.connected) return;
  stompClient.publish({ destination: `/games/${gameId}/timer/stop` });
  console.log(`⏹️ Notificado fin de timer para el juego ${gameId}`);
};

