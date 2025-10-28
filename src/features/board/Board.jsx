import React from "react";
import "../../styles/Board.css";
import Food from "../../components/game/Food.jsx";

function Board() {
    const size = 8;
    const foodPosition = { row: 3, col: 5 };

    return (
        <div className="board">
            {Array.from({ length: size }).map((_, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {Array.from({ length: size }).map((_, colIndex) => {
                        const hasFood =
                            rowIndex === foodPosition.row && colIndex === foodPosition.col;

                        return (
                            <div key={colIndex} className="tile">
                                {hasFood && <Food element="Food" />}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default Board;
