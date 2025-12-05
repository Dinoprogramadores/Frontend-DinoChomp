import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Lobby from './Lobby';
import * as SocketLobby from '../../services/SocketLobby.js';

// Mocks
vi.mock('../../services/SocketLobby.js');

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => ({
      state: { dino: { image: 'dino.png' } },
    }),
  };
});

describe('Lobby Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('currentGameId', 'game123');
    localStorage.setItem('playerId', 'player1');
    localStorage.setItem('playerName', 'Test Player');
  });

  it('debería renderizar la sala de espera con el nombre del juego', () => {
    render(<Lobby />, { wrapper: MemoryRouter });
    expect(screen.getByText('Waiting Room')).toBeInTheDocument();
    expect(screen.getByText('Game: game123')).toBeInTheDocument();
  });

  it('debería conectar al socket del lobby al montar', () => {
    render(<Lobby />, { wrapper: MemoryRouter });
    expect(SocketLobby.connectLobbySocket).toHaveBeenCalledWith(
      'game123',
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ id: 'player1' })
    );
  });

  it('debería mostrar los jugadores conectados', () => {
    const mockPlayers = [
      { name: 'Player 1', dinoImage: 'dino1.png' },
      { name: 'Player 2', dinoImage: 'dino2.png' },
    ];

    // Simular la actualización de jugadores desde el socket
    SocketLobby.connectLobbySocket.mockImplementation((gameId, onPlayersUpdate) => {
      onPlayersUpdate(mockPlayers);
    });

    render(<Lobby />, { wrapper: MemoryRouter });

    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getAllByText('Waiting...')).toHaveLength(2);
  });

  it('debería llamar a leaveLobby y navegar al hacer clic en Exit', () => {
    render(<Lobby />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('Exit'));
    expect(SocketLobby.leaveLobby).toHaveBeenCalledWith('game123', expect.objectContaining({ id: 'player1' }));
    expect(mockedNavigate).toHaveBeenCalledWith('/select-game');
  });

  it('debería llamar a startLobbyGame al hacer clic en Start!', () => {
    render(<Lobby />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('Start!'));
    expect(SocketLobby.startLobbyGame).toHaveBeenCalledWith('game123');
  });

  it('debería navegar a /game-board cuando se recibe el evento de inicio', () => {
    SocketLobby.connectLobbySocket.mockImplementation((gameId, onPlayersUpdate, onStart) => {
      onStart();
    });
    render(<Lobby />, { wrapper: MemoryRouter });
    expect(mockedNavigate).toHaveBeenCalledWith('/game-board', { state: { gameId: 'game123' } });
  });
});

