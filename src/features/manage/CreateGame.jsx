import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateGame.css";

const AVAILABLE_POWERS = [
    "Speed",
    "Shield",
    "DoubleFood",
    "Invisibility",
    "Magnet",
    "Teleport",
];

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
            prev.includes(power) ? prev.filter((p) => p !== power) : [...prev, power]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple validations
        if (!name.trim()) {
            alert("Game name is required");
            return;
        }

        const payload = {
            name: name.trim(),
            time: Number(time),
            foodCount: Number(foodCount),
            powers,
            board: { width: Number(width), height: Number(height) },
        };

        console.log("Create game with:", payload);

        // For now, redirect to /select-dino to choose a dino.
        navigate("/select-dino", { state: { gameName: payload.name } });
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
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Food Quantity
                        <select value={foodCount} onChange={(e) => setFoodCount(e.target.value)}>
                            {Array.from({ length: 8 }, (_, i) => 1 + i).map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </label>

                    <fieldset className="powers-field">
                        <legend>Select Powers (you can select multiple)</legend>
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
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Height
                            <select value={height} onChange={(e) => setHeight(e.target.value)}>
                                {Array.from({ length: 6 }, (_, i) => 5 + i).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="create-cancel" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="create-submit">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateGame;
