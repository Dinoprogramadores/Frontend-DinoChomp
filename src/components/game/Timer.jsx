import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendTimerStart, sendTimerStop } from "../../services/Socket";
import "../../styles/board/Timer.css";

function Timer({ durationMinutes, isRunning = true, gameId }) {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [finished, setFinished] = useState(false); // ← Nuevo estado
    const navigate = useNavigate();

    // Convertir minutos a segundos y notificar inicio
    useEffect(() => {
        if (durationMinutes !== undefined && durationMinutes !== null) {
            const initialSeconds = durationMinutes * 60;
            setTimeRemaining(initialSeconds);

            if (initialSeconds > 0) {
                sendTimerStart(gameId);
            }
        }
    }, [durationMinutes, gameId]);

    // Temporizador descendente
    useEffect(() => {
        if (!isRunning || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    sendTimerStop(gameId);
                    setFinished(true);          // ← Notificamos que terminó
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, timeRemaining, gameId]);

    // Navegar cuando el timer termina (SIN violar las reglas de React)
    useEffect(() => {
        if (finished) {
            navigate("/end-game");
        }
    }, [finished, navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };

    return (
        <div className="timer-container">
            <div className="timer-display">{formatTime(timeRemaining)}</div>
        </div>
    );
}

export default Timer;