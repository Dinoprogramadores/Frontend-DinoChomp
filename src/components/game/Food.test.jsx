import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Food from './Food';

describe('Food Component', () => {
  it('debería renderizar la imagen de la comida correctamente', () => {
    render(<Food />);
    const foodImage = screen.getByRole('img', { name: 'Food' });
    expect(foodImage).toBeInTheDocument();
    expect(foodImage).toHaveAttribute('src', '/resources/DinoFood.png');
    expect(foodImage).toHaveClass('food');
    expect(foodImage).toHaveAttribute('draggable', 'false');
  });
});

