import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SelectDino from './SelectDino';
import * as DinosaurService from '../../services/DinosaurService';
import * as GameService from '../../services/GameService';

// Mocks
vi.mock('../../services/DinosaurService');
vi.mock('../../services/GameService');

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => ({ state: { gameName: 'TestGame' } }),
  };
});

const mockDinos = [
  { id: '1', name: 'T-Rex', damage: 50, health: 100 },
  { id: '2', name: 'Ptero', damage: 30, health: 80 },
];

describe('SelectDino Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    DinosaurService.fetchDinosaurs.mockResolvedValue(mockDinos);
    GameService.addPlayerDinosaur.mockResolvedValue({});
    localStorage.setItem('playerId', 'player123');
    localStorage.setItem('playerName', 'TestPlayer');
    localStorage.setItem('currentGameId', 'game456');
  });

  it('debería mostrar "Loading dinos..." mientras se cargan', () => {
    DinosaurService.fetchDinosaurs.mockReturnValue(new Promise(() => {}));
    render(<SelectDino />, { wrapper: MemoryRouter });
    expect(screen.getByText('Loading dinos...')).toBeInTheDocument();
  });

  it('debería mostrar un mensaje de error si la carga falla', async () => {
    const error = new Error('Network Error');
    DinosaurService.fetchDinosaurs.mockRejectedValue(error);
    render(<SelectDino />, { wrapper: MemoryRouter });
    expect(await screen.findByText(/Failed to load dinosaurs/)).toBeInTheDocument();
  });

  it('debería renderizar la lista de dinosaurios correctamente', async () => {
    render(<SelectDino />, { wrapper: MemoryRouter });
    await waitFor(() => {
      expect(screen.getByText('T-Rex')).toBeInTheDocument();
      expect(screen.getByText('Ptero')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Select' })).toHaveLength(2);
    });
  });

  it('debería llamar a addPlayerDinosaur y navegar al lobby al seleccionar un dino', async () => {
    render(<SelectDino />, { wrapper: MemoryRouter });
    await waitFor(() => screen.getByText('T-Rex'));

    const selectButtons = screen.getAllByRole('button', { name: 'Select' });
    fireEvent.click(selectButtons[0]);

    await waitFor(() => {
      expect(GameService.addPlayerDinosaur).toHaveBeenCalledWith('game456', 'player123', {
        id: '1',
        name: 'T-Rex',
        damage: 50,
        health: 100,
      });
    });

    expect(localStorage.getItem('selectedDinoName')).toBe('T-Rex');
    expect(mockedNavigate).toHaveBeenCalledWith('/lobby', {
      state: { gameName: 'TestGame', dino: mockDinos[0] },
    });
  });

  it('debería mostrar una alerta si la información del jugador no está', async () => {
    localStorage.removeItem('playerId');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SelectDino />, { wrapper: MemoryRouter });
    await waitFor(() => screen.getByText('T-Rex'));

    fireEvent.click(screen.getAllByRole('button', { name: 'Select' })[0]);

    expect(alertSpy).toHaveBeenCalledWith('Player information not found. Please log in again.');
    expect(mockedNavigate).toHaveBeenCalledWith('/');
    alertSpy.mockRestore();
  });
});

