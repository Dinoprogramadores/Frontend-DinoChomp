import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerList from './PlayerList';

// Mock de PlayerCard para aislar el componente PlayerList
vi.mock('./PlayerCard.jsx', () => ({
  default: ({ player }) => <div data-testid="player-card">{player.name}</div>,
}));

describe('PlayerList Component', () => {
  const mockPlayers = [
    { id: '1', name: 'Player One', health: 100, avatar: 'avatar1.png' },
    { id: '2', name: 'Player Two', health: 80, avatar: 'avatar2.png' },
  ];

  it('debería renderizar el título "Players"', () => {
    render(<PlayerList players={[]} />);
    expect(screen.getByText('Players')).toBeInTheDocument();
  });

  it('debería renderizar una lista de componentes PlayerCard', () => {
    render(<PlayerList players={mockPlayers} />);
    const playerCards = screen.getAllByTestId('player-card');
    expect(playerCards).toHaveLength(mockPlayers.length);
    expect(playerCards[0]).toHaveTextContent('Player One');
    expect(playerCards[1]).toHaveTextContent('Player Two');
  });

  it('no debería renderizar ninguna tarjeta si la lista de jugadores está vacía', () => {
    render(<PlayerList players={[]} />);
    expect(screen.queryByTestId('player-card')).not.toBeInTheDocument();
  });
});

