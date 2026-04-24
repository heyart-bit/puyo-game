import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const CHAIN_COLORS = ['', '#FFD700', '#FF6B35', '#FF3355', '#CC33FF', '#2288FF', '#22FF88'];

export function ChainOverlay() {
  const { chainDisplay, chainDisplayKey } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (chainDisplay && chainDisplay >= 2) {
      setCount(chainDisplay);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [chainDisplay, chainDisplayKey]);

  if (!visible || count < 2) return null;

  const color = CHAIN_COLORS[Math.min(count, CHAIN_COLORS.length - 1)] ?? '#FF3355';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div
        style={{
          fontSize: count >= 5 ? 48 : 36,
          fontWeight: 900,
          color,
          textShadow: `0 0 20px ${color}, 0 0 40px ${color}88, 2px 2px 0 rgba(0,0,0,0.8)`,
          letterSpacing: '-0.02em',
          animation: 'chainPop 0.7s ease-out forwards',
          whiteSpace: 'nowrap',
        }}
      >
        {count}連鎖！
      </div>
    </div>
  );
}
