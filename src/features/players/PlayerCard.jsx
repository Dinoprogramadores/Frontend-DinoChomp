import React from "react";

function PlayerCard({ player }) {
    const { name, health, avatar } = player;

    // calcula el porcentaje de vida
    const healthPercent = Math.max(0, Math.min(health, 100));

    const getHealthColor = (hp) => {
        if (hp > 70) return "#2ecc71"; // verde
        if (hp > 35) return "#f1c40f"; // amarillo
        return "#e74c3c"; // rojo
    };



    return (
        <div className="player-card">
            <img src={avatar} alt={name} className="player-avatar" />
            <div className="player-info">
                <span className="player-name">{name}</span>
                <div className="player-health-bar">
                    <div
                        className="player-health-fill"
                        style={{
                            width: `${healthPercent}%`,
                            backgroundColor: getHealthColor(healthPercent),
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default PlayerCard;