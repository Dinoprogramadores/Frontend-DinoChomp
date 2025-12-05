import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchDinosaurs } from './DinosaurService';
import API_CONFIG from '../config/config';

global.fetch = vi.fn();

describe('DinosaurService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería obtener los dinosaurios correctamente', async () => {
    const mockDinosaurs = [{ id: '1', name: 'T-Rex' }];
    const mockResponse = {
      ok: true,
      json: async () => mockDinosaurs,
    };
    fetch.mockResolvedValue(mockResponse);

    const result = await fetchDinosaurs();

    expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.BASE_URL}/dinosaurs`);
    expect(result).toEqual(mockDinosaurs);
  });

  it('debería lanzar un error si la respuesta no es ok', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };
    fetch.mockResolvedValue(mockResponse);

    await expect(fetchDinosaurs()).rejects.toThrow('Error fetching dinosaurs: 500');
  });

  it('debería lanzar un error si fetch falla', async () => {
    const mockError = new Error('Network error');
    fetch.mockRejectedValue(mockError);

    await expect(fetchDinosaurs()).rejects.toThrow('Network error');
  });
});

