import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_CONFIG from "../config/config.js";

let stompClient = null;
let connected = false;

/**
 * Conecta el socket al backend usando STOMP + SockJS
 */
export const connectSocket = (gameId, onPlayerUpdate, onPowerUpdate, playerId, onFoodUpdate, onGameEvent) => {
    if (stompClient && stompClient.active) {
        console.log("⚠️ Cerrando conexión previa STOMP...");
        stompClient.deactivate();
        connected = false;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_CONFIG.BASE_URL}/ws/games`),
        reconnectDelay: 5000,
        debug: (str) => console.log("[STOMP]", str),
    });

    stompClient.onConnect = () => {
        connected = true;
        console.log(`✅ Conectado al juego ${gameId}`);

        // 1️⃣ Suscripción a actualizaciones de jugadores
        stompClient.subscribe(`/topic/games/${gameId}/players`, (message) => {
            try {
                const updatedPlayer = JSON.parse(message.body);
                console.log("👤 Movimiento recibido:", updatedPlayer);

                onPlayerUpdate((prevPlayers) => {
                    const existingIndex = prevPlayers.findIndex(p => p.id === updatedPlayer.id);
                    const updated = {
                        id: updatedPlayer.id,
                        name: updatedPlayer.name,
                        email: updatedPlayer.email,
                        health: updatedPlayer.health,
                        isAlive: updatedPlayer.alive, // ← Cambié de isAlive a alive
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
                console.error("❌ Error procesando mensaje de jugador:", err);
            }
        });
        console.log(`📡 Suscrito a: /topic/games/${gameId}/players`);

        // 2️⃣ Suscripción a eventos de comida
        stompClient.subscribe(`/topic/games/${gameId}/food`, (message) => {
            try {
                const foodEvent = JSON.parse(message.body);
                console.log("🍗 Evento de comida recibido:", foodEvent);

                if (onFoodUpdate) {
                    onFoodUpdate(foodEvent);
                }
            } catch (err) {
                console.error("❌ Error procesando foodEvent:", err);
            }
        });
        console.log(`📡 Suscrito a: /topic/games/${gameId}/food`);

        // 3️⃣ Suscripción a eventos de poder
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
        console.log(`📡 Suscrito a: /topic/games/${gameId}/power`);

        // 4️⃣ Suscripción a eventos del juego (GAME_ENDED, etc.)
        stompClient.subscribe(`/topic/games/${gameId}/events`, (message) => {
            try {
                const eventData = JSON.parse(message.body);
                console.log("📢 Evento del juego recibido:", eventData);

                if (onGameEvent) {
                    onGameEvent(eventData);
                }
            } catch (err) {
                console.error("❌ Error procesando gameEvent:", err);
            }
        });
        console.log(`📡 Suscrito a: /topic/games/${gameId}/events`);

        // 5️⃣ Enviar JOIN después de suscribirse
        setTimeout(() => {
            if (stompClient && stompClient.connected) {
                stompClient.publish({
                    destination: `/app/games/${gameId}/join`,
                    body: JSON.stringify({
                        type: "PLAYER",
                        id: Array.isArray(playerId) ? playerId[0] : playerId,
                        name: localStorage.getItem("playerName") || "Jugador",
                        email: localStorage.getItem("playerEmail") || "",
                        positionX: 0,
                        positionY: 0,
                        health: 100,
                        alive: true,
                    }),
                });
                console.log(`📤 Jugador ${playerId} se unió al juego ${gameId}`);
            }
        }, 100); // Reducido a 100ms
    };

    stompClient.onStompError = (frame) => {
        console.error("❌ Error STOMP:", frame.headers["message"]);
        console.error("Detalles:", frame.body);
        connected = false;
    };

    stompClient.onWebSocketError = (err) => {
        console.error("❌ Error WebSocket:", err);
        connected = false;
    };

    stompClient.onDisconnect = () => {
        console.log("🔌 Desconectado del juego");
        connected = false;
    };

    stompClient.activate();
};

/**
 * Acceder al stomp client desde otros componentes
 */
export const getStompClient = () => stompClient;

/**
 * Desconectar el socket
 */
export const disconnectSocket = () => {
    if (stompClient && stompClient.active) {
        stompClient.deactivate();
        stompClient = null;
        connected = false;
        console.log("🔌 Conexión cerrada manualmente");
    }
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
    if (!connected || !stompClient?.connected) {
        console.warn("⚠️ No conectado, no se puede iniciar juego");
        return;
    }
    stompClient.publish({ destination: `/app/games/${gameId}/start` });
    console.log("🚀 Juego iniciado");
};

/**
 * Detiene el bucle del juego
 */
export const stopGame = (gameId) => {
    if (!connected || !stompClient?.connected) {
        console.warn("⚠️ No conectado, no se puede detener juego");
        return;
    }
    stompClient.publish({ destination: `/app/games/${gameId}/stop` });
    console.log("⏸️ Juego detenido");
};

/**
 * Notifica al backend que el temporizador ha iniciado
 */
export const sendTimerStart = (gameId) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({ destination: `/games/${gameId}/timer/start` });
    console.log(`⏱️ Notificado inicio de timer para el juego ${gameId}`);
};

/**
 * Notifica al backend que el temporizador ha terminado
 */
export const sendTimerStop = (gameId) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({ destination: `/games/${gameId}/timer/stop` });
    console.log(`⏱️ Notificado fin de timer para el juego ${gameId}`);
};