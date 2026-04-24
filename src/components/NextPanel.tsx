import { useGameStore } from '../store/gameStore';
import { getFreePos } from '../game/physics';
import { PuyoCell } from './PuyoCell';

const CELL = 40;

function MiniPair({ pair, label }: { pair: { axisColor: string; freeColor: string; rotation: number; axisCol: number; axisRow: number }; label: string }) {
  const freeOffset = getFreePos(pair as Parameters<typeof getFreePos>[0]);
  const dRow = freeOffset.row - pair.axisRow;
  const dCol = freeOffset.col - pair.axisCol;

  // Normalize to a 2-cell grid
  const cells = [
    { color: pair.axisColor, row: 0, col: 0 },
    { color: pair.freeColor, row: dRow, col: dCol },
  ];
  const minRow = Math.min(...cells.map(c => c.row));
  const minCol = Math.min(...cells.map(c => c.col));
  const normalized = cells.map(c => ({ ...c, row: c.row - minRow, col: c.col - minCol }));
  const maxRow = Math.max(...normalized.map(c => c.row));
  const maxCol = Math.max(...normalized.map(c => c.col));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: 'rgba(180,200,255,0.6)', letterSpacing: '0.1em', fontWeight: 600 }}>
        {label}
      </span>
      <div
        style={{
          position: 'relative',
          width: (maxCol + 1) * CELL + 4,
          height: (maxRow + 1) * CELL + 4,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 6,
          border: '1px solid rgba(100,120,255,0.2)',
        }}
      >
        {normalized.map((c, i) => (
          <div key={i} style={{ position: 'absolute', top: c.row * CELL + 2, left: c.col * CELL + 2 }}>
            <PuyoCell color={c.color as Parameters<typeof PuyoCell>[0]['color']} size={CELL - 4} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NextPanel() {
  const nextQueue = useGameStore(s => s.nextQueue);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 0' }}>
      <MiniPair pair={nextQueue[0]} label="NEXT" />
      <MiniPair pair={nextQueue[1]} label="NEXT 2" />
    </div>
  );
}
