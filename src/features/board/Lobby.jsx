import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Lobby.css";
import DinoLogo2 from "../../../public/resources/DinoLogo2.png";

function Lobby() {
    const navigate = useNavigate();
    const location = useLocation();

    // Data received from the previous screen
    const gameName = location.state?.gameName;
    const myDino = location.state?.dino;
    const myPlayerName = "Waldron63"; // Current player's name

    // List of players (simulated)
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        // Simulate players in the lobby
        const mockPlayers = [
            { name: myPlayerName, dinoImage: myDino?.image || DinoLogo2 },
            { name: "Player2", dinoImage: DinoLogo2 },
            { name: "Player3", dinoImage: DinoLogo2 },
        ];
        setPlayers(mockPlayers);
    }, [myDino, myPlayerName]);

    const handleExit = () => {
        // Navigate back to the game selection screen
        navigate("/select-game");
    };

    const handleStart = () => {
        // Logic to start the game (future implementation)
        console.log("Starting the game...");
        // navigate("/board", { state: { gameName } });
    };

    return (
        <div className="lobby-container">
            <div className="lobby-panel">
                <h2>Waiting Room</h2>
                <p className="lobby-game-name">Game: {gameName}</p>

                <div className="player-grid">
                    {players.map((player, index) => (
                        <div className="player-card" key={index}>
                            <img src={player.dinoImage} alt="Dino" className="player-dino-image" />
                            <div className="player-name">{player.name}</div>
                        </div>
                    ))}
                    {/* Fill empty spaces up to 4 players */}
                    {Array.from({ length: 4 - players.length }).map((_, index) => (
                        <div className="player-card empty" key={`empty-${index}`}>
                            <div className="player-name">Waiting...</div>
                        </div>
                    ))}
                </div>

                <div className="lobby-actions">
                    <button className="lobby-exit" onClick={handleExit}>
                        Exit
                    </button>
                    <button className="lobby-start" onClick={handleStart}>
                        Start!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Lobby;
