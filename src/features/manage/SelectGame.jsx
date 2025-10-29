import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SelectGame.css";
import DinoLogo2 from "../../../public/resources/DinoLogo2.png";
import DinoNombre from "../../../public/resources/DinoNombre.png";
import JoinGame from "./JoinGame";

function SelectGame() {
    const navigate = useNavigate();
    const [showJoin, setShowJoin] = useState(false);

    const handleJoin = () => {
        // Show popup to enter the game name
        setShowJoin(true);
    };

    const handleCreate = () => {
        // Navigate to the game creation screen
        navigate("/create");
    };

    return (
        <div className="select-container">
            <img src={DinoNombre} alt="Dinochomp Name Logo" className="select-name" />
            <img src={DinoLogo2} alt="Dinochomp Logo" className="select-logo" />

            <div className="select-panel">
                <button className="select-button" onClick={handleJoin}>Join</button>
                <button className="select-button" onClick={handleCreate}>Create</button>
            </div>

            {showJoin && <JoinGame onClose={() => setShowJoin(false)} />}
        </div>
    );
}

export default SelectGame;
