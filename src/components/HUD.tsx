import { useGameStore } from '../store/gameStore';

function StatBox({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${accent ? 'rgba(180,120,255,0.4)' : 'rgba(100,120,255,0.2)'}`,
      borderRadius: 10,
      padding: '10px 14px',
      minWidth: 100,
    }}>
      <div style={{ fontSize: 10, color: 'rgba(180,200,255,0.5)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontSize: 22,
        fontWeight: 800,
        color: accent ? '#cc99ff' : '#e0e8ff',
        fontVariantNumeric: 'tabular-nums',
        textShadow: accent ? '0 0 12px rgba(180,100,255,0.6)' : undefined,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
    </div>
  );
}

export function HUD() {
  const { score, level, maxChain, pairsDropped } = useGameStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <StatBox label="SCORE" value={score.toLocaleString()} />
      <StatBox label="LEVEL" value={level} />
      <StatBox label="PAIRS" value={pairsDropped} />
      <StatBox label="MAX CHAIN" value={maxChain > 0 ? `${maxChain}連鎖` : '—'} accent={maxChain >= 3} />
    </div>
  );
}
