import { Board, Cell, COLS, ROWS, MatchGroup, PuyoColor } from './types';

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function getConnected(
  board: Board,
  row: number,
  col: number,
  visited: Set<string>
): Array<{ row: number; col: number }> {
  const key = `${row},${col}`;
  if (visited.has(key)) return [];
  const color = board[row]?.[col];
  if (!color || color === 'garbage') return [];
  visited.add(key);

  const group: Array<{ row: number; col: number }> = [{ row, col }];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = row + dr, nc = col + dc;
    if (isInBounds(nr, nc) && board[nr][nc] === color) {
      group.push(...getConnected(board, nr, nc, visited));
    }
  }
  return group;
}

export function findMatches(board: Board): MatchGroup[] {
  const visited = new Set<string>();
  const matches: MatchGroup[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell || cell === 'garbage' || visited.has(`${r},${c}`)) continue;
      const group = getConnected(board, r, c, new Set());
      group.forEach(({ row, col }) => visited.add(`${row},${col}`));
      if (group.length >= 4) {
        matches.push({ cells: group, color: cell as PuyoColor });
      }
    }
  }
  return matches;
}

export function eliminateCells(board: Board, matches: MatchGroup[]): Board {
  const b = cloneBoard(board);
  const toRemove = new Set<string>();

  for (const { cells } of matches) {
    for (const { row, col } of cells) {
      toRemove.add(`${row},${col}`);
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = row + dr, nc = col + dc;
        if (isInBounds(nr, nc) && b[nr][nc] === 'garbage') {
          toRemove.add(`${nr},${nc}`);
        }
      }
    }
  }

  for (const key of toRemove) {
    const [r, c] = key.split(',').map(Number);
    b[r!]![c!] = null;
  }
  return b;
}

export function applyGravity(board: Board): Board {
  const b = createBoard();
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r]![c] !== null) {
        b[writeRow]![c] = board[r]![c]!;
        writeRow--;
      }
    }
  }
  return b;
}

export function placeCell(board: Board, row: number, col: number, color: Cell): Board {
  if (!isInBounds(row, col)) return board;
  const b = cloneBoard(board);
  b[row]![col] = color;
  return b;
}

// Returns neighbor connection flags for shape rendering
export function getNeighborFlags(
  board: Board,
  row: number,
  col: number,
  color: Cell,
  fallingCells?: Array<{ row: number; col: number; color: Cell }>
): { up: boolean; down: boolean; left: boolean; right: boolean } {
  const check = (r: number, c: number): boolean => {
    if (!isInBounds(r, c)) return false;
    if (board[r]![c] === color) return true;
    if (fallingCells) {
      return fallingCells.some(fc => fc.row === r && fc.col === c && fc.color === color);
    }
    return false;
  };
  return {
    up:    check(row - 1, col),
    down:  check(row + 1, col),
    left:  check(row, col - 1),
    right: check(row, col + 1),
  };
}
