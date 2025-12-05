import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { supabase } from '../../config/supabaseClient';

// Mockear supabase
vi.mock('../../config/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

const TestComponent = () => <div>Protected Content</div>;
const HomeComponent = () => <div>Home Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar "Loading..." mientras se verifica la sesión', () => {
    supabase.auth.getSession.mockReturnValue(new Promise(() => {})); // Promesa que nunca se resuelve
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading authentication status...')).toBeInTheDocument();
  });

  it('debería redirigir a la página de inicio si no hay sesión', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/protected" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('debería suscribirse a los cambios de estado de autenticación', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});

