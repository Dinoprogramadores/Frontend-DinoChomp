import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/lobby/Lobby.css";
import DinoLogo2 from "../../../public/resources/DinoTRex.png";
import { connectLobbySocket, leaveLobby, startLobbyGame } from "../../services/SocketLobby.js";

function Lobby() {
    const navigate = useNavigate();
    const location = useLocation();

    const gameId = localStorage.getItem("currentGameId");
    const playerId = localStorage.getItem("playerId");
    const myPlayerName = localStorage.getItem("playerName");
    const myDino = location.state?.dino || { image: DinoLogo2 };

    const [players, setPlayers] = useState([]);

    // Conectar socket
    useEffect(() => {
        const player = {
            id: playerId,
            name: myPlayerName,
            dinoImage: myDino.image,
        };

        connectLobbySocket(
            gameId,
            (updatedPlayers) => setPlayers(updatedPlayers),
            () => navigate("/game-board", { state: { gameId } }),
            player
        );

        return () => leaveLobby(gameId, player);
    }, [gameId, playerId]);

    const handleExit = () => {
        const player = { id: playerId, name: myPlayerName };
        leaveLobby(gameId, player);
        navigate("/select-game");
    };

    const handleStart = () => {
        startLobbyGame(gameId);
    };

    return (
        <div className="lobby-container">
            <div className="lobby-panel">
                <h2>Waiting Room</h2>
                <p className="lobby-game-name">Game: {gameId}</p>

                <div className="lobby-player-grid">
                    {players.map((player, index) => (
                        <div className="lobby-player-card" key={index}>
                            <img src={player.dinoImage || DinoLogo2} alt="Dino" className="lobby-player-dino-image" />
                            <div className="lobby-player-name">{player.name}</div>
                        </div>
                    ))}
                    {Array.from({ length: 4 - players.length }).map((_, index) => (
                        <div className="lobby-player-card empty" key={`empty-${index}`}>
                            <div className="lobby-player-name">Waiting...</div>
                        </div>
                    ))}
                </div>

                <div className="lobby-actions">
                    <button className="lobby-exit" onClick={handleExit}>Exit</button>
                    <button className="lobby-start" onClick={handleStart}>Start!</button>
                </div>
            </div>
        </div>
    );
}

export default Lobby;