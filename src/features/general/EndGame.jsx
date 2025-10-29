import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/game/EndGame.css";

function EndGame() {
    const navigate = useNavigate();
    const location = useLocation();

    const { winnerName, winnerAvatar } = location.state || {
        winnerName: "Unknown", //TODO Traer jugador ganador
        winnerAvatar: "/resources/DinoTRex.png"
    };

    useEffect(() => {
        localStorage.removeItem("currentGameId");
        localStorage.removeItem("selectedDinoName");
        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");
        sessionStorage.clear();
    }, []);

    const handleGoHome = () => {
        navigate("/", { replace: true });
    };

    return (
        <div className="endgame-container">
            <img src="/resources/DinoEnd.png" alt="End Game" className="endgame-banner" />
            <img src="/resources/DinoWinner.png" alt="Winner title" className="endgame-winner-banner" />

            <div className="winner-section">
                <img src={winnerAvatar} alt={winnerName} className="winner-dino" />
                <h2 className="winner-name">{winnerName}</h2>
            </div>

            <button className="endgame-button" onClick={handleGoHome}>
                Return to Home
            </button>
        </div>
    );
}

export default EndGame;