import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Board from './Board';
import * as GameService from '../../services/GameService';
import * as BoardService from '../../services/BoardService';
import * as Socket from '../../services/Socket';

// Mocks
vi.mock('../../services/GameService');
vi.mock('../../services/BoardService');
vi.mock('../../services/Socket');

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockStompClient = {
  publish: vi.fn(),
};

describe('Board Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('currentGameId', 'game1');
    localStorage.setItem('playerId', 'player1');

    GameService.getBoardIdByGame.mockResolvedValue('board1');
    GameService.getGameData.mockResolvedValue({ durationMinutes: 5 });
    BoardService.getBoard.mockResolvedValue({
      width: 10,
      height: 6,
      map: {
        'x=1,y=1': { type: 'PLAYER', id: 'player1', name: 'P1', health: 100, isAlive: true },
        'x=5,y=5': { type: 'FOOD', id: 'food1' },
      },
    });
    Socket.getStompClient.mockReturnValue(mockStompClient);
  });

  it('debería mostrar "Loading..." inicialmente', () => {
    BoardService.getBoard.mockReturnValue(new Promise(() => {}));
    render(<Board />, { wrapper: MemoryRouter });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

