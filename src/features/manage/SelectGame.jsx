import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/game/SelectGame.css";
import DinoLogo2 from "../../../public/resources/DinoLogo2.png";
import DinoNombre from "../../../public/resources/DinoName.png";
import JoinGame from "../../components/manage/JoinGame.jsx";
import LogoutButton from "../../components/auth/LogoutButton.jsx";

function SelectGame() {
    const navigate = useNavigate();
    const [showJoin, setShowJoin] = useState(false);

    const handleJoin = () => {
        setShowJoin(true);
    };

    const handleCreate = () => {
        navigate("/create-game");
    };

    return (
        <div className="select-container">
            <LogoutButton />
            <img src={DinoNombre} alt="Dinochomp Name Logo" className="select-name" />
            <img src={DinoLogo2} alt="Dinochomp Logo" className="select-logo" />

            <div className="select-panel">
                <button className="select-button" onClick={handleJoin}>JOIN</button>
                <button className="select-button" onClick={handleCreate}>CREATE</button>
            </div>

            {showJoin && <JoinGame onClose={() => setShowJoin(false)} />}
        </div>
    );
}

export default SelectGame;
