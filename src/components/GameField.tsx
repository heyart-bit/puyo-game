import { useGameStore } from '../store/gameStore';
import { COLS, ROWS, Cell } from '../game/types';
import { getNeighborFlags } from '../game/board';
import { getFreePos, getGhostRow } from '../game/physics';
import { PuyoCell } from './PuyoCell';

const CELL = 52;

export function GameField() {
  const { board, current, flashingMatches, phase } = useGameStore();

  // Build flashing cell set
  const flashingSet = new Set<string>();
  for (const { cells } of flashingMatches) {
    for (const { row, col } of cells) flashingSet.add(`${row},${col}`);
  }

  // Build falling cells list for neighbor detection
  const fallingCells: Array<{ row: number; col: number; color: Cell }> = [];
  if (current) {
    fallingCells.push({ row: current.axisRow, col: current.axisCol, color: current.axisColor });
    const free = getFreePos(current);
    fallingCells.push({ row: free.row, col: free.col, color: current.freeColor });
  }

  // Ghost pair
  let ghostAxisRow = -1;
  if (current && (phase === 'playing' || phase === 'locking')) {
    ghostAxisRow = getGhostRow(board, current);
  }

  return (
    <div
      style={{
        position: 'relative',
        width: COLS * CELL,
        height: ROWS * CELL,
        background: 'linear-gradient(180deg, #0a0a1f 0%, #0d0d28 100%)',
        border: '2px solid rgba(100,120,255,0.3)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(80,100,255,0.2), inset 0 0 60px rgba(0,0,20,0.5)',
      }}
    >
      {/* Grid lines */}
      <svg
        style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }}
        width={COLS * CELL}
        height={ROWS * CELL}
      >
        {Array.from({ length: ROWS + 1 }, (_, r) => (
          <line key={`h${r}`} x1={0} y1={r * CELL} x2={COLS * CELL} y2={r * CELL} stroke="#8899ff" strokeWidth="1" />
        ))}
        {Array.from({ length: COLS + 1 }, (_, c) => (
          <line key={`v${c}`} x1={c * CELL} y1={0} x2={c * CELL} y2={ROWS * CELL} stroke="#8899ff" strokeWidth="1" />
        ))}
      </svg>

      {/* Placed board cells */}
      {board.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null;
          const nb = getNeighborFlags(board, r, c, cell, fallingCells);
          const flashing = flashingSet.has(`${r},${c}`);
          return (
            <div
              key={`${r},${c}`}
              style={{
                position: 'absolute',
                top: r * CELL + 2,
                left: c * CELL + 2,
                width: CELL - 4,
                height: CELL - 4,
              }}
            >
              <PuyoCell color={cell} size={CELL - 4} neighbors={nb} flashing={flashing} />
            </div>
          );
        })
      )}

      {/* Ghost pair */}
      {current && ghostAxisRow !== current.axisRow && ghostAxisRow >= 0 && (
        <>
          <div style={{ position: 'absolute', top: ghostAxisRow * CELL + 2, left: current.axisCol * CELL + 2 }}>
            <PuyoCell color={current.axisColor} size={CELL - 4} ghost />
          </div>
          {(() => {
            const freeGhostRow = ghostAxisRow + (getFreePos(current).row - current.axisRow);
            const freeGhostCol = current.axisCol + (getFreePos(current).col - current.axisCol);
            return freeGhostRow >= 0 && freeGhostRow < ROWS ? (
              <div style={{ position: 'absolute', top: freeGhostRow * CELL + 2, left: freeGhostCol * CELL + 2 }}>
                <PuyoCell color={current.freeColor} size={CELL - 4} ghost />
              </div>
            ) : null;
          })()}
        </>
      )}

      {/* Falling pair */}
      {current && (
        <>
          {current.axisRow >= 0 && current.axisRow < ROWS && (
            <div
              style={{
                position: 'absolute',
                top: current.axisRow * CELL + 2,
                left: current.axisCol * CELL + 2,
                transition: 'top 80ms linear, left 60ms ease',
                zIndex: 10,
              }}
            >
              <PuyoCell
                color={current.axisColor}
                size={CELL - 4}
                neighbors={getNeighborFlags(board, current.axisRow, current.axisCol, current.axisColor, fallingCells)}
              />
            </div>
          )}
          {(() => {
            const fp = getFreePos(current);
            return fp.row >= 0 && fp.row < ROWS ? (
              <div
                style={{
                  position: 'absolute',
                  top: fp.row * CELL + 2,
                  left: fp.col * CELL + 2,
                  transition: 'top 80ms linear, left 60ms ease',
                  zIndex: 10,
                }}
              >
                <PuyoCell
                  color={current.freeColor}
                  size={CELL - 4}
                  neighbors={getNeighborFlags(board, fp.row, fp.col, current.freeColor, fallingCells)}
                />
              </div>
            ) : null;
          })()}
        </>
      )}
    </div>
  );
}
