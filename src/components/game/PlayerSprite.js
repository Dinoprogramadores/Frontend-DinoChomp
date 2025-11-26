import React from "react";

export default function PlayerSprite({ player }) {
    return (
        <img
            src={player.avatar || "/resources/DinoTRex.png"}
            alt={player.name || "Jugador"}
            className="player-on-tile"
            style={{
                gridRow: player.position?.row + 1,
                gridColumn: player.position?.col + 1,
                width: "6vw",
                height: "6vw",
                transition: "transform 0.2s ease",
            }}
        />
    );
}