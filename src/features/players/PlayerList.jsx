import React from "react";
import PlayerCard from "./PlayerCard.jsx";
import "../../styles/board/Player.css";

function PlayerList({ players }) {
    return (
        <div className="player-list">
            <h2 className="player-list-title">Players</h2>
            {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
            ))}
        </div>
    );
}

export default PlayerList;