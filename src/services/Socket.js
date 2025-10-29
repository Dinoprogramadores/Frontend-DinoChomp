import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API_CONFIG from '../config/config.js';

let stompClient = null;
let connected = false;

/**
 * Conecta el socket al backend usando STOMP + SockJS
 */
export const connectSocket = (gameId, onPlayerUpdate) => {
  const socket = new SockJS(`${API_CONFIG.BASE_URL}/ws`);
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000, // reintento cada 5s
    onConnect: () => {
      connected = true;
      console.log(` Conectado al juego ${gameId}`);
        stompClient.subscribe(`/topic/games/${gameId}/players`, (message) => {
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

        });
    },
  });
};
/**
 * Envía movimiento del jugador
 */
export const sendMove = (playerId, direction, gameId) => {
  if (!connected || !stompClient) return;
  stompClient.publish({
    destination: `/app/games/${gameId}/move`,
    body: JSON.stringify({ playerId, direction }),
  });
};

/**
 * Inicia el bucle del juego (pérdida de vida)
 */
export const startGame = (gameId) => {
  if (!connected || !stompClient) return;
  stompClient.publish({
    destination: `/app/games/${gameId}/start`,
    body: '',
  });
};

/**
 * Detiene el bucle del juego
 */
export const stopGame = (gameId) => {
  if (!connected || !stompClient) return;
  stompClient.publish({
    destination: `/app/games/${gameId}/stop`,
    body: '',
  });
};
