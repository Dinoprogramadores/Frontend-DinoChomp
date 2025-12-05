import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import { createPlayer, getPlayerByEmail } from './PlayerService';
import API_CONFIG from '../config/config';

vi.mock('axios');

describe('PlayerService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createPlayer', () => {
    it('debería crear un jugador correctamente', async () => {
      const playerData = { name: 'Test Player' };
      const mockResponse = { data: { id: '1', ...playerData } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await createPlayer(playerData);

      expect(axios.post).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/players`, playerData);
      expect(result).toEqual(mockResponse.data);
    });

    it('debería lanzar un error si la creación del jugador falla', async () => {
      const error = new Error('Request failed');
      axios.post.mockRejectedValue(error);

      await expect(createPlayer({})).rejects.toThrow('Request failed');
    });
  });

  describe('getPlayerByEmail', () => {
    it('debería obtener un jugador por email correctamente', async () => {
      const email = 'test@example.com';
      const mockResponse = { data: { id: '1', email } };
      axios.get.mockResolvedValue(mockResponse);

      const result = await getPlayerByEmail(email);

      expect(axios.get).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/players/email?email=${email}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('debería lanzar un error si falla al obtener el jugador por email', async () => {
      const email = 'test@example.com';
      const error = new Error('Request failed');
      axios.get.mockRejectedValue(error);

      await expect(getPlayerByEmail(email)).rejects.toThrow('Request failed');
    });
  });
});

