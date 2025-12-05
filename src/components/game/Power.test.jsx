import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Power from './Power';

describe('Power Component', () => {
  it('debería renderizar la imagen del poder correctamente', () => {
    render(<Power />);
    const powerImage = screen.getByRole('img', { name: 'Power' });
    expect(powerImage).toBeInTheDocument();
    expect(powerImage).toHaveAttribute('src', '/resources/DinoPowerButton.png');
    expect(powerImage).toHaveClass('Power');
    expect(powerImage).toHaveAttribute('draggable', 'false');
  });
});

