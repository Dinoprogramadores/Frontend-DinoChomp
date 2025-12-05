import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CreateGame from './CreateGame';
import * as GameService from '../../services/GameService';

// Mocks
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('../../services/GameService');
vi.mock('../../components/auth/LogoutButton.jsx', () => ({
  default: () => <button>Logout</button>,
}));

describe('CreateGame Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    GameService.createGame.mockResolvedValue({ boardId: 'board123' });
  });

  it('debería renderizar el formulario de creación de juego', () => {
    render(<CreateGame />, { wrapper: BrowserRouter });
    expect(screen.getByLabelText('Game Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Duration (minutes)')).toBeInTheDocument();
    expect(screen.getByLabelText('Food Quantity')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('debería llamar a createGame y navegar al seleccionar dino al enviar', async () => {
    render(<CreateGame />, { wrapper: BrowserRouter });

    fireEvent.change(screen.getByLabelText('Game Name'), { target: { value: 'My Test Game' } });
    fireEvent.change(screen.getByLabelText('Game Duration (minutes)'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Food Quantity'), { target: { value: '3' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(GameService.createGame).toHaveBeenCalledWith(expect.objectContaining({
        nombre: 'My Test Game',
        durationMinutes: 5,
        totalFood: 3,
      }));
    });

    expect(localStorage.getItem('currentGameId')).toBe('My Test Game');
    expect(localStorage.getItem('currentBoardId')).toBe('board123');
    expect(mockedNavigate).toHaveBeenCalledWith('/select-dino');
  });

  it('debería navegar hacia atrás al hacer clic en Cancelar', () => {
    render(<CreateGame />, { wrapper: BrowserRouter });
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  it('debería mostrar una alerta si la creación del juego falla', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    GameService.createGame.mockRejectedValue(new Error('API Error'));
    render(<CreateGame />, { wrapper: BrowserRouter });

    fireEvent.change(screen.getByLabelText('Game Name'), { target: { value: 'Fail Game' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error creating game. Check the console for details.');
    });
    alertSpy.mockRestore();
  });
});

