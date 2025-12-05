import { describe, it, expect } from 'vitest';
import { parseBoard } from './parseBoard';

describe('parseBoard', () => {
  it('debería parsear un mapa de tablero vacío correctamente', () => {
    const board = { map: {}, width: 10, height: 6 };
    const parsed = parseBoard(board);
    expect(parsed.cells).toEqual([]);
    expect(parsed.width).toBe(10);
  });

  it('debería parsear un mapa con items', () => {
    const board = {
      map: {
        'x=1,y=2': { type: 'PLAYER', id: 'p1' },
        'x=3,y=4': { type: 'FOOD', id: 'f1' },
      },
    };
    const parsed = parseBoard(board);
    expect(parsed.cells).toHaveLength(2);
    expect(parsed.cells).toContainEqual({ x: 1, y: 2, item: { type: 'PLAYER', id: 'p1' } });
    expect(parsed.cells).toContainEqual({ x: 3, y: 4, item: { type: 'FOOD', id: 'f1' } });
  });

  it('debería ignorar claves de mapa con formato incorrecto', () => {
    const board = {
      map: {
        'x=1,y=2': { type: 'PLAYER' },
        'invalid-key': { type: 'WALL' },
      },
    };
    const parsed = parseBoard(board);
    expect(parsed.cells).toHaveLength(1);
    expect(parsed.cells[0]).toEqual({ x: 1, y: 2, item: { type: 'PLAYER' } });
  });

  it('debería manejar un mapa vacío', () => {
    const board = { map: {} };
    const parsed = parseBoard(board);
    expect(parsed.cells).toEqual([]);
  });
});

