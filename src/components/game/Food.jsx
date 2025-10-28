import React from "react";

function Food() {
    return (
        <img
            src={`/resources/DinoFood.png`}
            alt="Food"
            className="food"
            draggable={false}
        />
    );
}

export default Food;
