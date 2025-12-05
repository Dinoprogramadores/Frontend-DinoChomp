import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { supabase } from '../../config/supabaseClient';
import * as PlayerService from '../../services/PlayerService';

// Mockear dependencias
vi.mock('../../config/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock('../../services/PlayerService', () => ({
  createPlayer: vi.fn(),
  getPlayerByEmail: vi.fn(),
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('debería redirigir si ya hay una sesión', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: {} } } });
    const { container } = renderWithRouter(<Home />);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/select-game');
    });
  });

  it('debería renderizar el formulario de inicio de sesión por defecto', () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    renderWithRouter(<Home />);
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Tu nombre de jugador')).not.toBeInTheDocument();
  });

  it('debería cambiar al formulario de registro', () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    renderWithRouter(<Home />);
    fireEvent.click(screen.getByText('¿No tienes cuenta? Crea una nueva'));
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre de jugador')).toBeInTheDocument();
  });

  it('debería registrar un nuevo usuario correctamente', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.signUp.mockResolvedValue({ error: null });
    PlayerService.createPlayer.mockResolvedValue({ id: '1', name: 'testuser' });

    renderWithRouter(<Home />);
    fireEvent.click(screen.getByText('¿No tienes cuenta? Crea una nueva'));

    fireEvent.change(screen.getByPlaceholderText('Tu nombre de jugador'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Tu correo electrónico'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(PlayerService.createPlayer).toHaveBeenCalled();
    });

    expect(await screen.findByText(/¡Cuenta creada!/)).toBeInTheDocument();
  });

  it('debería iniciar sesión un usuario existente correctamente', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: {} }, error: null });
    PlayerService.getPlayerByEmail.mockResolvedValue({ id: '1', name: 'testuser', email: 'test@example.com' });

    renderWithRouter(<Home />);

    fireEvent.change(screen.getByPlaceholderText('Tu correo electrónico'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(PlayerService.getPlayerByEmail).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
        expect(window.location.pathname).toBe('/select-game');
    });
  });

    it('debería mostrar un error en el inicio de sesión con credenciales incorrectas', async () => {
    const errorMessage = 'Invalid login credentials';
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: errorMessage } });

    renderWithRouter(<Home />);

    fireEvent.change(screen.getByPlaceholderText('Tu correo electrónico'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});

