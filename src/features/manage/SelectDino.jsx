import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/lobby/SelectDino.css";
import { fetchDinosaurs } from "../../services/DinosaurService.js";
import { createPlayer } from "../../services/PlayerService.js";
import { addPlayerDinosaur } from "../../services/GameService.js";
import Player from "../../components/game/Player.jsx";
import LogoutButton from "../../components/auth/LogoutButton.jsx";

function SelectDino() {
    const location = useLocation();
    const navigate = useNavigate();
    const gameName = location?.state?.gameName || localStorage.getItem("currentGameName");

    const [dinos, setDinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [playerName, setPlayerName] = useState("");

    useEffect(() => {
        const loadDinosaurs = async () => {
            try {
                setLoading(true);
                const data = await fetchDinosaurs();
                setDinos(data);
                setError("");
            } catch (err) {
                setError("Failed to load dinosaurs: " + err);
            } finally {
                setLoading(false);
            }
        };

        loadDinosaurs();
    }, [gameName]);

    const handleSelect = async (dino) => {
        if (!playerName.trim()) {
            alert("Please enter your player name before selecting a dinosaur.");
            return;
        }

        try {
            const newPlayer = {
                name: playerName.trim(),
                password: "12345",
                positionX: 0,
                positionY: 0,
                health: 100,
                alive: true,
            };

            const createdPlayer = await createPlayer(newPlayer);

            const dinosaurDTO = {
                id: dino.id,
                name: dino.name,
                damage: dino.damage,
                health: dino.health,
            };

            const gameId = localStorage.getItem("currentGameId");
            await addPlayerDinosaur(gameId, createdPlayer.id, dinosaurDTO);

            localStorage.setItem("selectedDinoName", dino.name);
            localStorage.setItem("playerId", createdPlayer.id);
            localStorage.setItem("playerName", createdPlayer.name);
            navigate("/lobby", { state: { gameName, dino, player: createdPlayer } });
        } catch (err) {
            console.error("Error creating player or adding dinosaur:", err);
            alert("Error creating player or adding dinosaur. Please try again.");
        }
    };

    return (
        <div className="selectdino-container">
            <LogoutButton />
            <div className="selectdino-panel">
                <h2>Select your dinosaur</h2>
                {gameName && <div className="selectdino-game">Game: {gameName}</div>}

                <div className="playername-input">
                    <label htmlFor="playerName">Enter your name:</label>
                    <input
                        type="text"
                        id="playerName"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="e.g. RexMaster"
                    />
                </div>

                {loading && <div className="selectdino-loading">Loading dinos...</div>}
                {error && <div className="selectdino-error">{error}</div>}

                {!loading && !error && (
                    <div className="dino-list">
                        {dinos.length === 0 && <div className="selectdino-empty">No dinos available</div>}
                        {dinos.map((d) => (
                            <div className="dino-card" key={d.id}>
                                <Player name={d.name} className="dino-image" />
                                <div className="dino-name">{d.name}</div>
                                <div className="dino-damage">Damage: {d.damage}</div>
                                <button className="dino-select" onClick={() => handleSelect(d)}>
                                    Select
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SelectDino;