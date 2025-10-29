import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API_CONFIG from '../config/config.js';

let stompClient = null;
let connected = false;

/**
 * Conecta el socket al backend usando STOMP + SockJS
 */
export const connectSocket = (gameId, onPlayerUpdate) => {
    // Primero desactiva cualquier conexión anterior
    if (stompClient && connected) {
        stompClient.deactivate();
        connected = false;
    }

    // Usa una factory de SockJS correctamente
    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_CONFIG.BASE_URL}/ws`),
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP]', str),

        onConnect: () => {
            connected = true;
            console.log(`Conectado al juego ${gameId}`);
            // Envia registro del player al unirse
            stompClient.publish({
                destination: `/app/games/${gameId}/join`,
                body: JSON.stringify({
                    id: playerId,
                    positionX: 0,
                    positionY: 0,
                    health: 100,
                    alive: true,
                }),
            });

            // Ahora que la conexión está lista, suscríbete
            const subscription = stompClient.subscribe(
                `/topic/games/${gameId}/players`,
                (message) => {
                    try {
                        const updatedPlayer = JSON.parse(message.body);
                        onPlayerUpdate((prev) => {
                            const existing = prev[updatedPlayer.id] || {};
                            return {
                                ...prev,
                                [updatedPlayer.id]: {
                                    ...existing,
                                    position: {
                                        row: updatedPlayer.positionY,
                                        col: updatedPlayer.positionX,
                                    },
                                    health: updatedPlayer.health,
                                    isAlive: updatedPlayer.isAlive,
                                },
                            };
                        });
                    } catch (err) {
                        console.error('Error procesando mensaje:', err);
                    }
                }
            );

            console.log('Suscrito al topic:', `/topic/games/${gameId}/players`);
        },

        onStompError: (frame) => {
            console.error('Error STOMP:', frame.headers['message']);
            console.error('Detalles:', frame.body);
        },

        onWebSocketError: (err) => {
            console.error('Error WebSocket:', err);
        },
    });

    // Activa la conexión
    stompClient.activate();
};

/**
 * Envía movimiento del jugador
 */
export const sendMove = (playerId, direction, gameId) => {
    if (!connected || !stompClient?.connected) {
        console.warn('No conectado al socket');
        return;
    }

    stompClient.publish({
        destination: `/app/games/${gameId}/move`,
        body: JSON.stringify({ playerId, direction }),
    });
};

/**
 * Inicia el bucle del juego (pérdida de vida)
 */
export const startGame = (gameId) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({
        destination: `/app/games/${gameId}/start`,
    });
};

/**
 * Detiene el bucle del juego
 */
export const stopGame = (gameId) => {
    if (!connected || !stompClient?.connected) return;
    stompClient.publish({
        destination: `/app/games/${gameId}/stop`,
    });
};
