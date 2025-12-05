import React, { useEffect, useState, useRef } from "react";
import "../../styles/board/Timer.css";

function Timer({ durationMinutes, isRunning = true, gameId }) {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const intervalRef = useRef(null);
    const hasNotifiedEnd = useRef(false);

    // Inicializar timer
    useEffect(() => {
        if (durationMinutes !== undefined && durationMinutes !== null) {
            const initialSeconds = durationMinutes * 60;
            setTimeRemaining(initialSeconds);
            hasNotifiedEnd.current = false;
            console.log(`⏱️ Timer iniciado: ${durationMinutes} minutos (${initialSeconds} segundos)`);
        }
    }, [durationMinutes]);

    // Temporizador descendente
    useEffect(() => {
        // Limpiar interval anterior si existe
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!isRunning || timeRemaining <= 0) {
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (!hasNotifiedEnd.current) {
                        hasNotifiedEnd.current = true;
                        console.log("⏰ Timer terminado");
                        // ✅ NO navegar aquí, el backend se encarga con endGame()
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // ✅ CRÍTICO: Limpiar el interval cuando el componente se desmonte
        return () => {
            if (intervalRef.current) {
                console.log("🧹 Limpiando interval del timer");
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, timeRemaining]); // ❌ Quité gameId de las dependencias

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