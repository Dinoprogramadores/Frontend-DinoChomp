import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import DinoLogo2 from "../assets/DinoLogo2.png"; // logo dinochomp
import DinoNombre from "../assets/DinoNombre.png"; // logo dinochomp

function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(""); // pantalla siguiente
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
