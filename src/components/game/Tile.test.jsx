import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Tile from './Tile';

describe('Tile Component', () => {

  it('debería renderizar los hijos dentro del tile', () => {
    render(
      <Tile>
        <span>Child Element</span>
      </Tile>
    );
    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });
});

