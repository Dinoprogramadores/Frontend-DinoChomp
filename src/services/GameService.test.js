import { describe, it, expect, vi, afterEach } from 'vitest';
import { createGame, addPlayerDinosaur, getBoardIdByGame, getGameData, getWinner } from './GameService';
import API_CONFIG from '../config/config';

global.fetch = vi.fn();

describe('GameService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createGame', () => {
    it('debería crear un juego correctamente', async () => {
      const gameData = { name: 'Test Game' };
      const mockResponseData = { id: '1', ...gameData };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponseData,
      });

      const result = await createGame(gameData);

      expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      expect(result).toEqual(mockResponseData);
    });

    it('debería lanzar un error si la creación del juego falla', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server Error',
      });

      await expect(createGame({})).rejects.toThrow('Error creating game: 500 - Server Error');
    });
  });

  describe('addPlayerDinosaur', () => {
    it('debería agregar un dinosaurio a un jugador correctamente', async () => {
        const gameId = '1';
        const playerId = 'player1';
        const dinosaurData = { name: 'T-Rex' };
        const mockResponseData = { success: true };

        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponseData,
        });

        const result = await addPlayerDinosaur(gameId, playerId, dinosaurData);

        expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/games/${gameId}/players/${playerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dinosaurData),
        });
        expect(result).toEqual(mockResponseData);
    });


    it('debería lanzar un error si falla al agregar el dinosaurio', async () => {
        const gameId = '1';
        const playerId = 'player1';
        const dinosaurData = { name: 'T-Rex' };

        fetch.mockResolvedValue({
            ok: false,
            status: 400,
            text: async () => 'Bad Request',
        });

        await expect(addPlayerDinosaur(gameId, playerId, dinosaurData)).rejects.toThrow('Failed to add player dinosaur: 400 - Bad Request');
    });
  });

  describe('getBoardIdByGame', () => {
    it('debería obtener el ID del tablero correctamente', async () => {
      const gameId = '1';
      const mockResponseData = { boardId: 'board123' };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponseData,
      });

      const result = await getBoardIdByGame(gameId);

      expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/games/${gameId}/board`);
      expect(result).toBe('board123');
    });

    it('debería lanzar un error si falla al obtener el ID del tablero', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 404,
            text: async () => 'Not Found',
        });

        await expect(getBoardIdByGame('1')).rejects.toThrow('Error fetching boardId: 404 - Not Found');
    });
  });

  describe('getGameData', () => {
    it('debería obtener los datos del juego correctamente', async () => {
        const gameId = '1';
        const mockGameData = { id: gameId, status: 'LOBBY' };
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockGameData,
        });

        const result = await getGameData(gameId);

        expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/games/${gameId}`);
        expect(result).toEqual(mockGameData);
    });

    it('debería lanzar un error si falla al obtener los datos del juego', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 404,
            text: async () => 'Not Found',
        });

        await expect(getGameData('1')).rejects.toThrow('Error fetching game data: 404 - Not Found');
    });
  });

  describe('getWinner', () => {
    it('debería obtener el ganador correctamente', async () => {
        const gameId = '1';
        const mockWinner = { name: 'Player 1' };
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockWinner,
        });

        const result = await getWinner(gameId);

        expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/games/${gameId}/winner/compute`);
        expect(result).toEqual(mockWinner);
    });

    it('debería lanzar un error si falla al obtener el ganador', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => 'Server Error',
        });

        await expect(getWinner('1')).rejects.toThrow('Error fetching winner: 500 - Server Error');
    });
  });
});

