import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Timer from './Timer';

describe('Timer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debería inicializar y mostrar el tiempo correctamente', () => {
    render(<Timer durationMinutes={1} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('debería decrementar el tiempo cuando isRunning es true', () => {
    render(<Timer durationMinutes={1} isRunning={true} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('0:59')).toBeInTheDocument();
  });

  it('no debería decrementar el tiempo cuando isRunning es false', () => {
    render(<Timer durationMinutes={1} isRunning={false} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('debería detenerse en 0:00 cuando el tiempo se acaba', () => {
    render(<Timer durationMinutes={0.02} isRunning={true} />); // 1.2 segundos

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('debería formatear el tiempo correctamente para segundos menores a 10', () => {
    render(<Timer durationMinutes={1.15} isRunning={true} />); // 1 minuto y 9 segundos

    act(() => {
      vi.advanceTimersByTime(60 * 1000); // Avanzar 1 minuto
    });

    expect(screen.getByText('0:09')).toBeInTheDocument();
  });

  it('debería limpiar el intervalo al desmontar', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = render(<Timer durationMinutes={1} isRunning={true} />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

