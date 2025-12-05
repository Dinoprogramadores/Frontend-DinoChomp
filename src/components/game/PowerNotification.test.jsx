import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PowerNotification from './PowerNotification';

describe('PowerNotification Component', () => {
  it('debería estar oculto cuando visible es false', () => {
    render(<PowerNotification message="Test" visible={false} />);
    const notification = screen.getByText('Test').parentElement;
    expect(notification).not.toHaveClass('show');
  });

  it('debería mostrar el mensaje proporcionado', () => {
    const message = '¡Poder activado!';
    render(<PowerNotification message={message} visible={true} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});

