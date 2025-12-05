import React from 'react';
import { render, screen} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter} from 'react-router-dom';
import EndGame from './EndGame';

// Mockear dependencias
vi.mock('../../services/GameService', () => ({
  getWinner: vi.fn(),
}));

// Mockear el componente LogoutButton para evitar problemas de dependencia
vi.mock('../../components/auth/LogoutButton.jsx', () => ({
    __esModule: true,
    default: () => <button>Logout</button>,
}));


const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  return render(ui, { wrapper: BrowserRouter });
};

describe('EndGame Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debería mostrar "Determining winner..." inicialmente', () => {
    renderWithRouter(<EndGame />);
    expect(screen.getByText('Determining winner...')).toBeInTheDocument();
  });

  it('debería mostrar el nombre del ganador desde localStorage si existe', () => {
    localStorage.setItem('winnerName', 'DinoPlayer');
    renderWithRouter(<EndGame />);
    expect(screen.getByText('DinoPlayer')).toBeInTheDocument();
  });
});

