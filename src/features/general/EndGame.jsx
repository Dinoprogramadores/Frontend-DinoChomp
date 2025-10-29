import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWinner } from "../../services/GameService";
import "../../styles/game/EndGame.css";

function EndGame() {
    const navigate = useNavigate();
    const [winnerName, setWinnerName] = useState("Determining winner...");
    const winnerAvatar = "/resources/DinoTRex.png"; // Avatar por defecto

    useEffect(() => {
        const fetchWinner = async () => {
            const gameId = localStorage.getItem("currentGameId");
            if (gameId) {
                try {
                    const winnerData = await getWinner(gameId);
                    setWinnerName(winnerData.name);
                } catch (error) {
                    console.error("Failed to fetch winner:", error);
                    setWinnerName("No winner could be determined");
                }
            }
        };

        fetchWinner();

        // Limpiar localStorage después de un breve retraso para asegurar que se obtuvo el gameId
        const cleanupTimeout = setTimeout(() => {
            localStorage.removeItem("currentGameId");
            localStorage.removeItem("selectedDinoName");
            localStorage.removeItem("playerId");
            localStorage.removeItem("playerName");
            sessionStorage.clear();
        }, 1000);

        return () => clearTimeout(cleanupTimeout);
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