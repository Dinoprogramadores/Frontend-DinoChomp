import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/game/CreateGame.css";
import { createGame } from "../../services/GameService.js";

const AVAILABLE_POWERS = ["Healing"];

function CreateGame() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [time, setTime] = useState(3);
    const [foodCount, setFoodCount] = useState(1);
    const [powers, setPowers] = useState([]);
    const [width, setWidth] = useState(5);
    const [height, setHeight] = useState(5);

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
            metadata: {
                foodCount: Number(foodCount),
                boardWidth: Number(width),
                boardHeight: Number(height),
            },
            durationMinutes: Number(time),
        };

        try {
            const created = await createGame(payload);
            console.log("Game created:", created);
            localStorage.setItem("currentGameId", name.trim());
            navigate("/select-dino");
        } catch (error) {
            console.error("Error creating game:", error);
            alert("Error creating game. Check the console for details.");
        }
    };

    return (
        <div className="create-container">
            <div className="create-panel">
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
                        <select value={time} onChange={(e) => setTime(e.target.value)}>
                            {Array.from({ length: 8 }, (_, i) => 3 + i).map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
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

                    <div className="board-size">
                        <label>
                            Width
                            <select value={width} onChange={(e) => setWidth(e.target.value)}>
                                {Array.from({ length: 6 }, (_, i) => 5 + i).map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Height
                            <select value={height} onChange={(e) => setHeight(e.target.value)}>
                                {Array.from({ length: 6 }, (_, i) => 5 + i).map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

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