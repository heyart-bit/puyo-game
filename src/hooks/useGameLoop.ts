import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameLoop() {
  const tick = useGameStore(s => s.tick);
  const rafRef = useRef<number>(0);
  const prevRef = useRef<number>(0);

  useEffect(() => {
    const loop = (timestamp: number) => {
      const dt = prevRef.current ? Math.min(timestamp - prevRef.current, 100) : 16;
      prevRef.current = timestamp;
      tick(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);
}
