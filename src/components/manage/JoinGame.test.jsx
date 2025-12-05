import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import JoinGame from './JoinGame';

// Mockear useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mockear fetch
global.fetch = vi.fn();

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('JoinGame Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('debería renderizar el modal para unirse a un juego', () => {
    renderWithRouter(<JoinGame onClose={() => {}} />);
    expect(screen.getByText('Enter the game name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Game name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('debería llamar a onClose al hacer clic en Cancelar', () => {
    const handleClose = vi.fn();
    renderWithRouter(<JoinGame onClose={handleClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debería unirse a un juego y navegar si el juego existe', async () => {
    fetch.mockResolvedValue({ ok: true });
    renderWithRouter(<JoinGame onClose={() => {}} />);

    const input = screen.getByPlaceholderText('Game name');
    const joinButton = screen.getByRole('button', { name: 'Join' });

    fireEvent.change(input, { target: { value: 'TestGame' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/games/TestGame');
    });

    await waitFor(() => {
      expect(localStorage.getItem('currentGameId')).toBe('TestGame');
    });

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/select-dino', {
        state: { gameName: 'TestGame' },
      });
    });
  });

  it('debería mostrar un error si el juego no existe', async () => {
    const errorMessage = 'Game not found';
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: errorMessage }),
    });

    renderWithRouter(<JoinGame onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Game name'), { target: { value: 'NotFoundGame' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join' }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
});

