import React, { useEffect, useState, useCallback } from "react";
import "../../styles/Board.css";
import Tile from "../../components/game/Tile.jsx";
import Food from "../../components/game/Food.jsx";
import PlayerList from "../players/PlayerList.jsx";
import { parseBoard } from "./parseBoard.js";
import { getBoard } from "../../services/CommonService.js";
import Power from "../../components/game/Power.jsx";

function Board() {
    const [board, setBoard] = useState(null);
    const [players, setPlayers] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBoard = useCallback(async () => {
        try {
            const data = await getBoard("69005f3aac5bfb027fff2528"); // TODO: cambiar luego
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
    }, []);

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            if (["w", "a", "s", "d", "e"].includes(key)) {
                console.log(`Pressed ${key.toUpperCase()}`);
                fetchBoard();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [fetchBoard]);

    if (loading) return <p>Loading...</p>;
    if (!board) return <p>The board could not be loaded.</p>;

    return (
        <div className="game-layout">
            <div className="sidebar">
                <PlayerList players={players} />

                <button className="image-button">
                    <Power />
                </button>
            </div>

            <div className="board">
                {Array.from({ length: board.height }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="board-row">
                        {Array.from({ length: board.width }).map((_, colIndex) => {
                            const tileKey = rowIndex * board.width + colIndex; // ✅ clave estable
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