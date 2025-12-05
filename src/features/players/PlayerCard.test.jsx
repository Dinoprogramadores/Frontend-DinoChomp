import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerCard from './PlayerCard';

describe('PlayerCard Component', () => {
  const mockPlayer = {
    name: 'Dino',
    health: 85,
    avatar: 'dino.png',
  };

  it('debería renderizar el nombre y el avatar del jugador', () => {
    render(<PlayerCard player={mockPlayer} />);
    expect(screen.getByText('Dino')).toBeInTheDocument();
    const avatar = screen.getByRole('img', { name: 'Dino' });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'dino.png');
  });

  it('debería mostrar la barra de vida con el porcentaje correcto', () => {
    render(<PlayerCard player={mockPlayer} />);
    const healthFill = screen.getByText('Dino').parentElement.querySelector('.player-health-fill');
    expect(healthFill).toHaveStyle(`width: ${mockPlayer.health}%`);
  });

  it('debería usar el color verde para vida alta', () => {
    render(<PlayerCard player={{ ...mockPlayer, health: 90 }} />);
    const healthFill = screen.getByText('Dino').parentElement.querySelector('.player-health-fill');
    expect(healthFill).toHaveStyle('backgroundColor: #2ecc71');
  });

  it('debería usar el color amarillo para vida media', () => {
    render(<PlayerCard player={{ ...mockPlayer, health: 50 }} />);
    const healthFill = screen.getByText('Dino').parentElement.querySelector('.player-health-fill');
    expect(healthFill).toHaveStyle('backgroundColor: #f1c40f');
  });

  it('debería usar el color rojo para vida baja', () => {
    render(<PlayerCard player={{ ...mockPlayer, health: 20 }} />);
    const healthFill = screen.getByText('Dino').parentElement.querySelector('.player-health-fill');
    expect(healthFill).toHaveStyle('backgroundColor: #e74c3c');
  });

  it('debería limitar la vida a un máximo de 100', () => {
    render(<PlayerCard player={{ ...mockPlayer, health: 150 }} />);
    const healthFill = screen.getByText('Dino').parentElement.querySelector('.player-health-fill');
    expect(healthFill).toHaveStyle('width: 100%');
  });

  it('debería limitar la vida a un mínimo de 0', () => {
    render(<PlayerCard player={{ ...mockPlayer, health: -10 }} />);
    const healthFill = screen.getByText('Dino').parentElement.querySelector('.player-health-fill');
    expect(healthFill).toHaveStyle('width: 0%');
  });
});

