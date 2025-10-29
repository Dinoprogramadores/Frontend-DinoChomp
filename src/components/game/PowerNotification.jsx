import React from "react";
import "../../styles/game/PowerNotification.css";

function PowerNotification({ message, visible }) {
    return (
        <div className={`power-notification ${visible ? "show" : ""}`}>
            {message}
        </div>
    );
}

export default PowerNotification;