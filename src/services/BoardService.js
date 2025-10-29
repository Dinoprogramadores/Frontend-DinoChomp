import API_CONFIG from "../config/config.js";

export async function getBoard(boardId) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/boards/${boardId}`);
        if (!response.ok) {
            throw new Error(`Error getting board (status: ${response.status})`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in getBoard:", error);
        throw error;
    }
}
