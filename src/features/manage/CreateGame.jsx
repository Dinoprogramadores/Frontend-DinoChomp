import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/game/CreateGame.css";
import { createGame } from "../../services/GameService.js";
import LogoutButton from "../../components/auth/LogoutButton.jsx";

const AVAILABLE_POWERS = ["Healing"];

function CreateGame() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [time, setTime] = useState(3);
    const [foodCount, setFoodCount] = useState(1);
    const [powers, setPowers] = useState([]);

    const width = 10;
    const height = 6;

    const togglePower = (power) => {
        setPowers((prev) =>
            prev.includes(power)
                ? prev.filter((p) => p !== power)
                : [...prev, power]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Game name is required");
            return;
        }

        const payload = {
            nombre: name.trim(),
            isActive: true,
            playerDinosaurMap: {},
            powers: powers.map((p) => p.toUpperCase()),
            width,
            height,
            totalFood: Number(foodCount),
            metadata: {
                foodCount: Number(foodCount),
                boardWidth: width,
                boardHeight: height,
            },
            durationMinutes: Number(time),
        };

        try {
            const created = await createGame(payload);
            console.log("Game created:", created);
            localStorage.setItem("currentGameId", name.trim());
            localStorage.setItem("currentBoardId", created.boardId);
            localStorage.setItem("gamePowers", JSON.stringify(powers.map((p) => p.toUpperCase())));
            navigate("/select-dino");
        } catch (error) {
            console.error("Error creating game:", error);
            alert("Error creating game. Check the console for details.");
        }
    };

    return (
        <div className="create-container">
            <div className="create-panel">
                <LogoutButton />
                <h2>Create Game</h2>
                <form className="create-form" onSubmit={handleSubmit}>
                    <label>
                        Game Name
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            placeholder="Name (max 50 characters)"
                            required
                        />
                    </label>

                    <label>
                        Game Duration (minutes)
                        <input
                            type="number"
                            value={time}
                            min={1}
                            max={999}
                            step={1}
                            onChange={(e) => setTime(e.target.value)}
                            placeholder="Minutes"
                            required
                        />
                    </label>

                    <label>
                        Food Quantity
                        <select
                            value={foodCount}
                            onChange={(e) => setFoodCount(e.target.value)}
                        >
                            {Array.from({ length: 8 }, (_, i) => 1 + i).map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </label>

                    <fieldset className="powers-field">
                        <legend>Select Powers</legend>
                        <div className="powers-list">
                            {AVAILABLE_POWERS.map((p) => (
                                <label key={p} className="power-item">
                                    <input
                                        type="checkbox"
                                        checked={powers.includes(p)}
                                        onChange={() => togglePower(p)}
                                    />
                                    {p}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <p className="board-size-fixed">
                        Board Size: {width} × {height}
                    </p>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="create-cancel"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="create-submit">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateGame;