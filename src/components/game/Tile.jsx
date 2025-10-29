import React from "react";
import "../../styles/board/Tile.css";

function Tile({ size = "100px", children }) {
    return (
        <div className="tile" style={{ width: size, height: size }}>
            {children}
        </div>
    );
}

export default Tile;