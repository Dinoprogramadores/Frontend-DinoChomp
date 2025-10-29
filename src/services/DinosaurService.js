import API_CONFIG from "../config/config.js";

const BASE_URL = `${API_CONFIG.BASE_URL}/dinosaurs`;

export async function fetchDinosaurs() {
    try {
        const response = await fetch(`${BASE_URL}`);
        if (!response.ok) {
            throw new Error(`Error fetching dinosaurs: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading dinosaurs:", error);
        throw error;
    }
}
