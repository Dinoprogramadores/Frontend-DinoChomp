import axios from "axios";
import API_CONFIG from "../config/config.js";
const BASE_URL = `${API_CONFIG.BASE_URL}/players`;


export const createPlayer = async (playerData) => {
    try {
        const response = await axios.post(`${BASE_URL}`, playerData);
        return response.data;
    } catch (error) {
        console.error("Error creating player:", error);
        throw error;
    }
};
