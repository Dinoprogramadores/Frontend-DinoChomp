import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient.js";
import { createPlayer, getPlayerByEmail } from "../../services/PlayerService";
import "../../styles/game/Home.css";
import DinoLogo2 from "../../../public/resources/DinoLogo2.png"; // logo dinochomp
import DinoNombre from "../../../public/resources/DinoName.png"; // logo dinochomp

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/select-game');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      // --- Lógica de Registro ---
      if (!playerName.trim()) {
        setError("Por favor, introduce un nombre de jugador.");
        setLoading(false);
        return;
      }
      try {
        // 1. Registrar en Supabase
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        // 2. Crear jugador en el backend
        const newPlayer = {
          name: playerName,
          email: email,
          password: password, // Enviar la contraseña real
          positionX: 0,
          positionY: 0,
          health: 100,
          alive: true,
        };
        const createdPlayer = await createPlayer(newPlayer);

        // 3. Guardar datos del jugador
        localStorage.setItem("playerId", createdPlayer.id);
        localStorage.setItem("playerName", createdPlayer.name);

        setMessage("¡Cuenta creada! Revisa tu correo para verificarla. Serás redirigido.");
        setTimeout(() => navigate("/select-game"), 2000);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      // --- Lógica de Inicio de Sesión ---
      try {
        // 1. Iniciar sesión en Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Obtener datos del jugador del backend
          const playerData = await getPlayerByEmail(email);

          // 3. Guardar datos del jugador
          localStorage.setItem("playerId", playerData.id);
          localStorage.setItem("playerName", playerData.name);
          localStorage.setItem("playerEmail", playerData.email);

          navigate("/select-game");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="home-container">
        <img src={DinoNombre} alt="Logo Dinochomp" className="home-name" />
        <img src={DinoLogo2} alt="Logo Dinochomp" className="home-logo" />

        <div className="auth-form">
        <h2>{isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}</h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Tu nombre de jugador"
              value={playerName}
              required
              onChange={(e) => setPlayerName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="home-button" disabled={loading}>
            {loading ? "Cargando..." : isSignUp ? "Crear Cuenta" : "Ingresar"}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}
        <button
          className="toggle-auth-button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
        >
          {isSignUp
            ? "¿Ya tienes una cuenta? Inicia sesión"
            : "¿No tienes cuenta? Crea una nueva"}
        </button>
      </div>
    </div>
  );
}

export default Home;
