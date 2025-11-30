import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient.js";
import "../../styles/game/Home.css";
import DinoLogo2 from "../../../public/resources/DinoLogo2.png"; // logo dinochomp
import DinoNombre from "../../../public/resources/DinoName.png"; // logo dinochomp

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
// ... existing code ...
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Crear nueva cuenta
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("¡Cuenta creada! Revisa tu correo para verificarla.");
        setIsSignUp(false); // Vuelve a la vista de login
      } else {
        // Iniciar sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          navigate("/select-game");
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
        <img src={DinoNombre} alt="Logo Dinochomp" className="home-name" />
        <img src={DinoLogo2} alt="Logo Dinochomp" className="home-logo" />

        <div className="auth-form">
        <h2>{isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}</h2>
        <form onSubmit={handleSubmit}>
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
