import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/lobby/SelectDino.css";
import { fetchDinosaurs } from "../../services/DinosaurService.js";
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
    }, []);

    const handleSelect = async (dino) => {
        const playerId = localStorage.getItem("playerId");
        const playerName = localStorage.getItem("playerName");

        if (!playerId || !playerName) {
            alert("Player information not found. Please log in again.");
            navigate("/");
            return;
        }

        try {
            const dinosaurDTO = {
                id: dino.id,
                name: dino.name,
                damage: dino.damage,
                health: dino.health,
            };

            const gameId = localStorage.getItem("currentGameId");
            await addPlayerDinosaur(gameId, playerId, dinosaurDTO);

            localStorage.setItem("selectedDinoName", dino.name);
            navigate("/lobby", { state: { gameName, dino } });
        } catch (err) {
            console.error("Error adding dinosaur:", err);
            alert("Error adding dinosaur. Please try again.");
        }
    };

    return (
        <div className="selectdino-container">
            <LogoutButton />
            <div className="selectdino-panel">
                <h2>Select your dinosaur</h2>
                {gameName && <div className="selectdino-game">Game: {gameName}</div>}


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