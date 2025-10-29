import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/SelectDino.css";
import DinoLogo2 from "../../../public/resources/DinoTRex.png";

function SelectDino() {
    const location = useLocation();
    const navigate = useNavigate();
    const gameName = location?.state?.gameName || null;

    const [dinos, setDinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // PREVIEW MODE: do not query the backend yet; show static examples
        const sample = [
            { name: "Rex", image: DinoLogo2, damage: 10 },
            { name: "Spike", image: DinoLogo2, damage: 10 },
            { name: "Blue", image: DinoLogo2, damage: 10 },
            { name: "Tiny", image: DinoLogo2, damage: 10 },
            { name: "Giga", image: DinoLogo2, damage: 10 },
        ];
        setDinos(sample);
        setError("");
        setLoading(false);
    }, [gameName]);

    const handleSelect = (dino) => {
        // Navigate to the next screen (for now /lobby) passing the selection
        navigate("/lobby", { state: { gameName, dino } });
    };

    return (
        <div className="selectdino-container">
            <div className="selectdino-panel">
                <h2>Select your dinosaur</h2>
                {gameName && <div className="selectdino-game">Game: {gameName}</div>}

                {loading && <div className="selectdino-loading">Loading dinos...</div>}
                {error && <div className="selectdino-error">{error}</div>}

                {!loading && !error && (
                    <div className="dino-list">
                        {dinos.length === 0 && <div className="selectdino-empty">No dinos available</div>}
                        {dinos.map((d) => (
                            <div className="dino-card" key={d.name}>
                                <img src={d.image} alt={d.name} className="dino-image" />
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
