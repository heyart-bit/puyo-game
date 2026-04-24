import { FallingPair, Board, COLS, ROWS, Rotation, PUYO_COLORS, SPAWN_COL, SPAWN_ROW } from './types';

function randomColor() {
  return PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)]!;
}

export function generatePair(): FallingPair {
  return {
    axisCol: SPAWN_COL,
    axisRow: SPAWN_ROW,
    rotation: 0,
    axisColor: randomColor(),
    freeColor: randomColor(),
  };
}

export function getFreePos(pair: FallingPair): { row: number; col: number } {
  const { axisCol, axisRow, rotation } = pair;
  switch (rotation) {
    case 0: return { row: axisRow - 1, col: axisCol };
    case 1: return { row: axisRow,     col: axisCol + 1 };
    case 2: return { row: axisRow + 1, col: axisCol };
    case 3: return { row: axisRow,     col: axisCol - 1 };
  }
}

function canOccupy(board: Board, row: number, col: number): boolean {
  if (col < 0 || col >= COLS || row >= ROWS) return false;
  if (row < 0) return true; // above visible board
  return board[row]![col] === null;
}

export function canPlace(board: Board, pair: FallingPair): boolean {
  const free = getFreePos(pair);
  return canOccupy(board, pair.axisRow, pair.axisCol)
      && canOccupy(board, free.row, free.col);
}

export function tryMove(
  board: Board,
  pair: FallingPair,
  dRow: number,
  dCol: number
): FallingPair | null {
  const moved = { ...pair, axisRow: pair.axisRow + dRow, axisCol: pair.axisCol + dCol };
  return canPlace(board, moved) ? moved : null;
}

export function tryRotate(
  board: Board,
  pair: FallingPair,
  clockwise: boolean
): FallingPair {
  const newRot = ((pair.rotation + (clockwise ? 1 : 3)) % 4) as Rotation;
  const rotated = { ...pair, rotation: newRot };

  if (canPlace(board, rotated)) return rotated;

  for (const kick of [1, -1, 2, -2]) {
    const kicked = { ...rotated, axisCol: rotated.axisCol + kick };
    if (canPlace(board, kicked)) return kicked;
  }
  return pair;
}

export function hasLanded(board: Board, pair: FallingPair): boolean {
  return tryMove(board, pair, 1, 0) === null;
}

export function getGhostRow(board: Board, pair: FallingPair): number {
  let p = pair;
  let next = tryMove(board, p, 1, 0);
  while (next) {
    p = next;
    next = tryMove(board, p, 1, 0);
  }
  return p.axisRow;
}

export function placePair(board: Board, pair: FallingPair): Board {
  const free = getFreePos(pair);
  let b = board.map(r => [...r]);
  if (pair.axisRow >= 0 && pair.axisRow < ROWS) {
    b[pair.axisRow]![pair.axisCol] = pair.axisColor;
  }
  if (free.row >= 0 && free.row < ROWS) {
    b[free.row]![free.col] = pair.freeColor;
  }
  return b;
}

export function isGameOver(board: Board): boolean {
  // Game over if top visible rows are blocked
  return board[0]![SPAWN_COL] !== null || board[1]![SPAWN_COL] !== null;
}
