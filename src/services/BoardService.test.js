import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBoard } from './BoardService';
import API_CONFIG from '../config/config';

// Mockear fetch
global.fetch = vi.fn();

describe('BoardService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería obtener los datos del tablero correctamente', async () => {
    const boardId = '123';
    const mockBoardData = { id: boardId, size: 10 };
    const mockResponse = {
      ok: true,
      json: async () => mockBoardData,
    };
    fetch.mockResolvedValue(mockResponse);

    const result = await getBoard(boardId);

    expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/boards/${boardId}`);
    expect(result).toEqual(mockBoardData);
  });

  it('debería lanzar un error si la respuesta no es ok', async () => {
    const boardId = '123';
    const mockResponse = {
      ok: false,
      status: 404,
    };
    fetch.mockResolvedValue(mockResponse);

    await expect(getBoard(boardId)).rejects.toThrow('Error getting board (status: 404)');
  });

  it('debería lanzar un error si fetch falla', async () => {
    const boardId = '123';
    const mockError = new Error('Network error');
    fetch.mockRejectedValue(mockError);

    await expect(getBoard(boardId)).rejects.toThrow('Network error');
  });
});

