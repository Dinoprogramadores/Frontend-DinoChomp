import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWinner } from "../../services/GameService";
import "../../styles/game/EndGame.css";
import LogoutButton from "../../components/auth/LogoutButton.jsx";

function EndGame() {
    const navigate = useNavigate();
    const [winnerName, setWinnerName] = useState("Determining winner...");
    const winnerAvatar = "/resources/DinoTRex.png";

    useEffect(() => {
        const storedWinner = localStorage.getItem("winnerName");
        const endMessage = localStorage.getItem("endMessage");

        console.log("🏁 EndGame montado. Winner:", storedWinner, "Message:", endMessage);

        if (storedWinner) {
            setWinnerName(storedWinner);
        } else {
            const fetchWinner = async () => {
                const gameId = localStorage.getItem("currentGameId");
                if (gameId) {
                    try {
                        const winnerData = await getWinner(gameId);
                        setWinnerName(winnerData.name || "No winner");
                    } catch (error) {
                        console.error("❌ Failed to fetch winner:", error);
                        setWinnerName("No winner could be determined");
                    }
                }
            };
            fetchWinner();
        }

        // ✅ Limpiar SOLO los datos específicos de la partida terminada
        return () => {
            console.log("🧹 EndGame desmontado");
            // NO limpiar todo el localStorage aquí
            // localStorage.removeItem("winnerName");
            // localStorage.removeItem("winnerId");
            // localStorage.removeItem("endMessage");
        };
    }, []);

    const handleGoHome = () => {
        // ✅ Limpiar datos de la partida cuando el usuario hace clic
        localStorage.removeItem("winnerName");
        localStorage.removeItem("winnerId");
        localStorage.removeItem("endMessage");
        localStorage.removeItem("currentGameId");

        console.log("🏠 Volviendo al inicio");
        navigate("/", { replace: true });
    };

    return (
        <div className="endgame-container">
            <LogoutButton />
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