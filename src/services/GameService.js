import API_CONFIG from "../config/config.js";

const BASE_URL = `${API_CONFIG.BASE_URL}/games`;

export async function createGame(gameData) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error creating game: ${response.status} - ${errorText}`);
    }

    return await response.json();
}

export const addPlayerDinosaur = async (gameId, playerId, dinosaurData) => {
    const response = await fetch(`${BASE_URL}/${gameId}/players/${playerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dinosaurData),
    });

    if (!response.ok) {
        throw new Error("Failed to add player dinosaur");
    }

    return response.json();
};

export const getBoardIdByGame = async (gameId) => {
    const response = await fetch(`${BASE_URL}/${gameId}/board`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching boardId: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.boardId;
};