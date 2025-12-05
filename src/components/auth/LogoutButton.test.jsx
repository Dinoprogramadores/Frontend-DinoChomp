import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogoutButton from './LogoutButton';
import { supabase } from '../../config/supabaseClient';

// Mockear supabase
vi.mock('../../config/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
  });

  it('debería cerrar la sesión y redirigir si hay una sesión activa', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: {} } } });
    supabase.auth.signOut.mockResolvedValue({ error: null });

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    });
    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });
  });

  it('debería redirigir si no hay una sesión activa', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });
  });

  it('debería mostrar un error en la consola si el cierre de sesión falla', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorMessage = 'Logout failed';
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: {} } } });
    supabase.auth.signOut.mockResolvedValue({ error: { message: errorMessage } });

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error logging out:', errorMessage);
    });

    // La redirección sigue ocurriendo
    await waitFor(() => {
        expect(window.location.href).toBe('/');
    });

    consoleErrorSpy.mockRestore();
  });
});

