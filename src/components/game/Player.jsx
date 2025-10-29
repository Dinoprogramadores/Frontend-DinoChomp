import React from "react";

function Player({ name = "TRex", className = "Player" }) {
    const imagePath = `/resources/Dino${name}.png`;

    return (
        <img
            src={imagePath}
            alt={name}
            className={className}
            draggable={false}
            onError={(e) => (e.target.src = "/resources/DinoTRex.png")}
        />
    );
}

export default Player;
