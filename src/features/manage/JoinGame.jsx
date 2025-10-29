import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/JoinGame.css";

// Modal component for joining a game
// Props: onClose() -> closes the modal
function JoinGame({ onClose }) {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Checks if the game exists in the backend
    // Assumption: GET /api/games/:name -> 200 OK if it exists, other status with { message } if not
    const checkGameExists = async (gameName) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/games/${encodeURIComponent(gameName)}`);
            if (!res.ok) {
                // Try to read message from backend
                let msg = "Error checking the game";
                try {
                    const body = await res.json();
                    msg = body.message || JSON.stringify(body);
                } catch {
                    try {
                        msg = await res.text();
                    } catch {
                        /* fallback */
                    }
                }
                setError(msg || `Error: ${res.status}`);
                return false;
            }

            // OK
            return true;
        } catch (err) {
            setError(err?.message || "Network error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        if (e) e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Enter the game name");
            return;
        }

        const ok = await checkGameExists(trimmed);
        if (ok) {
            // Backend indicated that the game exists: move to dino selection screen
            navigate("/select-dino", { state: { gameName: trimmed } });
        }
    };

    return (
        <div className="join-overlay">
            <div className="join-modal" role="dialog" aria-modal="true">
                <h3>Enter the game name</h3>
                <form className="join-form" onSubmit={handleJoin}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Game name"
                        maxLength={50}
                        disabled={loading}
                    />

                    {error && <div className="join-error">{error}</div>}

                    <div className="join-actions">
                        <button type="button" className="join-cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="join-ok" disabled={loading}>
                            {loading ? "Searching..." : "Join"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JoinGame;
