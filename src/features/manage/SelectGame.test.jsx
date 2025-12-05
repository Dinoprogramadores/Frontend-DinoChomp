import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SelectGame from './SelectGame';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mockear JoinGame para evitar su lógica interna
vi.mock('../../components/manage/JoinGame.jsx', () => ({
  default: ({ onClose }) => (
    <div data-testid="join-game-mock">
      <button onClick={onClose}>Close Mock</button>
    </div>
  ),
}));

describe('SelectGame Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar los logos y botones', () => {
    render(<SelectGame />, { wrapper: BrowserRouter });
    expect(screen.getByAltText('Dinochomp Name Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Dinochomp Logo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'JOIN' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CREATE' })).toBeInTheDocument();
  });

  it('debería navegar a /create-game al hacer clic en CREATE', () => {
    render(<SelectGame />, { wrapper: BrowserRouter });
    fireEvent.click(screen.getByRole('button', { name: 'CREATE' }));
    expect(mockedNavigate).toHaveBeenCalledWith('/create-game');
  });

  it('debería mostrar el modal JoinGame al hacer clic en JOIN', () => {
    render(<SelectGame />, { wrapper: BrowserRouter });
    expect(screen.queryByTestId('join-game-mock')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'JOIN' }));
    expect(screen.getByTestId('join-game-mock')).toBeInTheDocument();
  });

  it('debería cerrar el modal JoinGame al llamar a onClose', async () => {
    render(<SelectGame />, { wrapper: BrowserRouter });
    fireEvent.click(screen.getByRole('button', { name: 'JOIN' }));
    expect(screen.getByTestId('join-game-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Mock'));
    await waitFor(() => {
      expect(screen.queryByTestId('join-game-mock')).not.toBeInTheDocument();
    });
  });
});

