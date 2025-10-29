import React, { useEffect, useState, useCallback } from "react";
import "../../styles/board/Board.css";
import Tile from "../../components/game/Tile.jsx";
import Food from "../../components/game/Food.jsx";
import PlayerList from "../players/PlayerList.jsx";
import Power from "../../components/game/Power.jsx";
import { parseBoard } from "./parseBoard.js";
import { getBoard } from "../../services/BoardService.js";
import { connectSocket, sendMove, startGame, stopGame } from "../../services/Socket.js";

function Board() {
  const [board, setBoard] = useState(null);
  const [players, setPlayers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const gameId = localStorage.getItem("currentGameId"); // ID en cache
  const playerId = localStorage.getItem("playerId"); // ID en cache

  /**
   * Carga inicial del tablero desde el backend (estado base del juego)
   */
  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard("69005f3aac5bfb027fff2528");
      const parsed = parseBoard(data);
      setBoard(parsed);

      const foundPlayers = parsed.cells
        .filter(c => c.item && c.item.type === "PLAYER")
        .map(p => ({
          id: p.item.id,
          name: p.item.name,
          health: p.item.health,
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
      console.error("Error loading board", error);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  /**
   * Manejo de teclas W, A, S, D, E para movimiento o acción
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
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
  }, [playerId, gameId]);

  /**
   * Conexión al socket para recibir actualizaciones en tiempo real
   */
  useEffect(() => {
    connectSocket(gameId, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    }, playerId);

    // Inicia el bucle del juego 1s después de conectar
    const timer = setTimeout(() => startGame(gameId), 1000);

    return () => {
      clearTimeout(timer);
      stopGame(gameId); // Detiene el bucle si el jugador abandona
    };
  }, [gameId, playerId]);

  if (loading) return <p>Loading...</p>;
  if (!board) return <p>The board could not be loaded.</p>;

  return (
    <div className="game-layout">
      {/* Panel lateral con lista de jugadores y botón de poder */}
      <div className="sidebar">
        <PlayerList players={players} />
        <button className="image-button">
          <Power />
        </button>
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
                    <img src={playerHere.avatar} alt={playerHere.name} className="player-on-tile" />
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
