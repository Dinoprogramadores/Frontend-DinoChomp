export function parseBoard(board) {
    const cells = [];

    for (const [key, value] of Object.entries(board.map)) {
        const match = key.match(/x=(\d+),y=(\d+)/);
        if (match) {
            const x = parseInt(match[1], 10);
            const y = parseInt(match[2], 10);
            cells.push({ x, y, item: value });
        }
    }

    return { ...board, cells };
}