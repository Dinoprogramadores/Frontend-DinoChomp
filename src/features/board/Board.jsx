import React, { useEffect, useState, useCallback, useRef } from "react";
import "../../styles/board/Board.css";
import Tile from "../../components/game/Tile.jsx";
import Food from "../../components/game/Food.jsx";
import PlayerList from "../players/PlayerList.jsx";
import Power from "../../components/game/Power.jsx";
import { parseBoard } from "./parseBoard.js";
import { getBoard } from "../../services/BoardService.js";
import {
    connectSocket,
    sendMove,
    startGame,
    stopGame,
    getStompClient,
    disconnectSocket
} from "../../services/Socket.js";
import { getBoardIdByGame, getGameData } from "../../services/GameService.js";
import Timer from "../../components/game/Timer.jsx";
import { useNavigate } from "react-router-dom";
import { encryptJSON } from "../../services/crypto.js"



function Board() {
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [players, setPlayers] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [powerStatus, setPowerStatus] = useState("UNAVAILABLE");
    const [durationMinutes, setDurationMinutes] = useState(null);

    const gameId = localStorage.getItem("currentGameId");
    const playerId = localStorage.getItem("playerId");

    const hasConnected = useRef(false); // ✅ Prevenir doble conexión

    const currentPlayer = players.find(p => p.id === playerId);
    const isPlayerAlive = currentPlayer && currentPlayer.health > 0;
    const showPowerButton = powerStatus === "AVAILABLE" && isPlayerAlive;

    /**
     * Carga inicial del tablero desde el backend
     */
    const fetchBoard = useCallback(async () => {
        try {
            const boardId = await getBoardIdByGame(gameId);
            const data = await getBoard(boardId);
            const parsed = parseBoard(data);
            setBoard(parsed);

            const gameData = await getGameData(gameId);
            if (gameData.durationMinutes) {
                setDurationMinutes(gameData.durationMinutes);
                console.log(`⏱️ Duración del juego: ${gameData.durationMinutes} minutos`);
            }

            const foundPlayers = parsed.cells
                .filter(c => c.item && c.item.type === "PLAYER")
                .map(p => ({
                    id: p.item.id,
                    name: p.item.name,
                    health: p.item.health,
                    isAlive: p.item.alive !== false, // Default true si no viene
                    avatar: "/resources/DinoTRex.png",
                    position: { row: p.y, col: p.x },
                }));

            const foundFoods = parsed.cells
                .filter(c => c.item && c.item.type === "FOOD")
                .map(f => ({
                    id: f.item.id,
                    position: { row: f.y, col: f.x },
                }));

            setPlayers(foundPlayers);
            setFoods(foundFoods);
        } catch (error) {
            console.error("❌ Error loading board", error);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    const handleClaimPower = async () => {
        const stompClient = getStompClient();
        if (!stompClient) {
            console.warn("⚠️ No hay conexión STOMP");
            return;
        }

        const payload = { gameId, playerId };
        const encrypted = await encryptJSON(payload); // 🔒 cifrado

        stompClient.publish({
            destination: `/app/games/${gameId}/power/claim`,
            body: encrypted, // Enviar JSON cifrado
        });

        console.log("⚡ Poder reclamado (cifrado):", encrypted);
    };

    /**
     * Callback para actualizar el estado del poder
     */
    const handlePowerUpdate = useCallback((powerEvent) => {
        console.log("⚡ Actualizando estado del poder:", powerEvent);
        setPowerStatus(powerEvent.status);
    }, []);

    /**
     * Callback para manejar eventos de comida
     */
    const handleFoodUpdate = useCallback((foodEvent) => {
        console.log("🍗 Evento de comida:", foodEvent);

        if (foodEvent.action === "FOOD_REMOVED") {
            setFoods((prevFoods) => prevFoods.filter(f => f.id !== foodEvent.id));
        } else if (foodEvent.action === "FOOD_ADDED") {
            setFoods((prevFoods) => [
                ...prevFoods,
                {
                    id: foodEvent.id,
                    position: { row: foodEvent.y, col: foodEvent.x },
                },
            ]);
        }
    }, []);

    /**
     * Callback para manejar eventos del juego (GAME_ENDED)
     */
    const handleGameEvent = useCallback((eventData) => {
        console.log("📢 Evento del juego recibido:", eventData);

        if (eventData.event === "GAME_ENDED") {
            console.log("🏁 Juego terminado. Ganador:", eventData.winner);

            // Guardar datos del ganador
            if (eventData.winner) {
                localStorage.setItem("winnerName", eventData.winner);
            }
            if (eventData.winnerId) {
                localStorage.setItem("winnerId", eventData.winnerId);
            }
            if (eventData.message) {
                localStorage.setItem("endMessage", eventData.message);
            }

            // Desconectar websocket
            disconnectSocket();

            // Navegar a pantalla final
            setTimeout(() => {
                navigate("/end-game");
            }, 1000);
        }
    }, [navigate]);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    /**
     * Manejo de teclas W, A, S, D, E para movimiento
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isPlayerAlive) {
                console.log("💀 No puedes moverte, estás muerto");
                return;
            }

            const key = event.key.toLowerCase();
            const directionMap = {
                w: "UP",
                a: "LEFT",
                s: "DOWN",
                d: "RIGHT",
                e: "ACTION",
            };

            if (directionMap[key]) {
                sendMove(playerId, directionMap[key], gameId);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playerId, gameId, isPlayerAlive]);

    /**
     * Conexión al socket con TODOS los callbacks
     */
    useEffect(() => {
        // ✅ Prevenir doble ejecución en React StrictMode
        if (hasConnected.current) return;
        hasConnected.current = true;

        console.log("🎮 Iniciando conexión al juego...");

        connectSocket(
            gameId,
            setPlayers,              // Callback para jugadores (usa setPlayers directamente)
            handlePowerUpdate,       // Callback para poderes
            playerId,
            handleFoodUpdate,        // Callback para comida
            handleGameEvent          // Callback para eventos (GAME_ENDED)
        );

        // Iniciar el juego después de 1 segundo
        const timer = setTimeout(() => {
            console.log("🚀 Iniciando juego...");
            startGame(gameId);
        }, 1000);

        return () => {
            clearTimeout(timer);
            console.log("🧹 Cleanup del tablero");
            hasConnected.current = false;
            stopGame(gameId);
            disconnectSocket();
        };
    }, []); // ✅ Sin dependencias para evitar reconexiones

    if (loading) return <p>Loading...</p>;
    if (!board) return <p>The board could not be loaded.</p>;

    return (
        <div className="game-layout">
            {/* Panel lateral */}
            <div className="sidebar">
                <Timer durationMinutes={durationMinutes} gameId={gameId} />
                <PlayerList players={players} />

                {showPowerButton && (
                    <button className="image-button" onClick={handleClaimPower}>
                        <Power />
                    </button>
                )}
            </div>

            {/* Tablero principal */}
            <div className="board">
                {Array.from({ length: board.height }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="board-row">
                        {Array.from({ length: board.width }).map((_, colIndex) => {
                            const tileKey = rowIndex * board.width + colIndex;
                            const playerHere = players.find(
                                (p) => p.position.row === rowIndex && p.position.col === colIndex
                            );
                            const foodHere = foods.find(
                                (f) => f.position.row === rowIndex && f.position.col === colIndex
                            );

                            return (
                                <Tile key={`tile-${tileKey}`} size="6vw">
                                    {foodHere && <Food />}
                                    {playerHere && (
                                        <img
                                            src={playerHere.avatar}
                                            alt={playerHere.name}
                                            className="player-on-tile"
                                            style={{
                                                opacity: playerHere.isAlive ? 1 : 0.5,
                                                filter: playerHere.isAlive ? 'none' : 'grayscale(100%)'
                                            }}
                                        />
                                    )}
                                </Tile>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Board;