import React from "react";
import "../../styles/Board.css";
import Tile from "../../components/game/Tile.jsx";
import Food from "../../components/game/Food.jsx";
import PlayerList from "../players/PlayerList.jsx";

function Board() {
    const rows = 6;
    const cols = 10;

    const foodPosition = { row: 2, col: 4 };

    // Lista de jugadores con posición
    const players = [
        {
            id: 1,
            name: "Rexy",
            health: 80,
            avatar: "/resources/DinoTRex.png",
            position: { row: 5, col: 2 },
        },
        {
            id: 2,
            name: "Spike",
            health: 60,
            avatar: "/resources/DinoTRex.png",
            position: { row: 3, col: 6 },
        },
        {
            id: 3,
            name: "Chompy",
            health: 100,
            avatar: "/resources/DinoTRex.png",
            position: { row: 1, col: 1 },
        },
    ];

    return (
        <div className="game-layout">
            <PlayerList players={players} />

            <div className="board">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {Array.from({ length: cols }).map((_, colIndex) => {
                            const hasFood =
                                rowIndex === foodPosition.row && colIndex === foodPosition.col;

                            // Buscar jugador en esta casilla
                            const playerHere = players.find(
                                (p) => p.position.row === rowIndex && p.position.col === colIndex
                            );

                            return (
                                <Tile key={`${rowIndex}-${colIndex}`} size="6vw">
                                    {hasFood && <Food />}
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