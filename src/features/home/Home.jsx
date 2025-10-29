import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import DinoLogo2 from "../../../public/resources/DinoLogo2.png"; // logo dinochomp
import DinoNombre from "../../../public/resources/DinoName.png"; // logo dinochomp

function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/select"); // navegamos a la nueva pantalla de selección
  };

  return (
    <div className="home-container">
      <img src={DinoNombre} alt="Logo Dinochomp" className="home-name" />
      <img src={DinoLogo2} alt="Logo Dinochomp" className="home-logo" />
      <button className="home-button" onClick={handleStart}>
        START
      </button>
    </div>
  );
}

export default Home;
