import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Player from './Player';

describe('Player Component', () => {
  it('debería renderizar el jugador por defecto (TRex) si no se proporciona nombre', () => {
    render(<Player />);
    const playerImage = screen.getByRole('img');
    expect(playerImage).toHaveAttribute('src', '/resources/DinoTRex.png');
    expect(playerImage).toHaveAttribute('alt', 'TRex');
    expect(playerImage).toHaveClass('Player');
  });

  it('debería renderizar el jugador con el nombre y clase proporcionados', () => {
    render(<Player name="Ptero" className="CustomPlayer" />);
    const playerImage = screen.getByRole('img');
    expect(playerImage).toHaveAttribute('src', '/resources/DinoPtero.png');
    expect(playerImage).toHaveAttribute('alt', 'Ptero');
    expect(playerImage).toHaveClass('CustomPlayer');
  });

  it('debería usar la imagen de fallback (TRex) si la imagen del jugador no se encuentra', () => {
    render(<Player name="NonExistentDino" />);
    const playerImage = screen.getByRole('img');

    // Simular el evento onError
    fireEvent.error(playerImage);

    expect(playerImage).toHaveAttribute('src', '/resources/DinoTRex.png');
  });

  it('debería tener el atributo draggable como false', () => {
    render(<Player />);
    const playerImage = screen.getByRole('img');
    expect(playerImage).toHaveAttribute('draggable', 'false');
  });
});

