import { useGameStore } from './store/gameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { useInput } from './hooks/useInput';
import { GameField } from './components/GameField';
import { NextPanel } from './components/NextPanel';
import { HUD } from './components/HUD';
import { ChainOverlay } from './components/ChainOverlay';
import { Controls } from './components/Controls';

function StartScreen() {
  const start = useGameStore(s => s.start);
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 32, zIndex: 200,
      background: 'rgba(7,7,18,0.85)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 64, fontWeight: 900,
          background: 'linear-gradient(135deg, #cc99ff, #6688ff, #44ffcc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          marginBottom: 12,
        }}>
          ぷよぷよ
        </div>
        <div style={{ fontSize: 14, color: 'rgba(180,200,255,0.5)', letterSpacing: '0.3em' }}>
          PUYO PUYO
        </div>
      </div>
      <button className="btn-neon" onClick={start} style={{ fontSize: 16, padding: '14px 40px' }}>
        START GAME
      </button>
      <div style={{ fontSize: 12, color: 'rgba(180,200,255,0.35)', letterSpacing: '0.1em' }}>
        ← → 移動　↑/X 右回転　Z 左回転　Space ハードドロップ
      </div>
    </div>
  );
}

function PauseScreen() {
  const pause = useGameStore(s => s.pause);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, zIndex: 100,
      background: 'rgba(7,7,18,0.7)',
      backdropFilter: 'blur(6px)',
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#c0b0ff', letterSpacing: '0.1em' }}>
        PAUSED
      </div>
      <button className="btn-neon" onClick={pause}>RESUME</button>
    </div>
  );
}

function GameOverScreen() {
  const { score, maxChain, reset } = useGameStore();
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, zIndex: 100,
      background: 'rgba(7,7,18,0.85)',
      backdropFilter: 'blur(6px)',
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#FF3355', textShadow: '0 0 20px rgba(255,51,85,0.6)', letterSpacing: '0.05em' }}>
        GAME OVER
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#e0e8ff' }}>
        {score.toLocaleString()} <span style={{ fontSize: 13, color: 'rgba(180,200,255,0.5)' }}>pts</span>
      </div>
      {maxChain >= 2 && (
        <div style={{ fontSize: 14, color: '#cc99ff' }}>{maxChain}連鎖達成！</div>
      )}
      <button className="btn-neon" onClick={reset} style={{ marginTop: 8 }}>
        PLAY AGAIN
      </button>
    </div>
  );
}

function Game() {
  useGameLoop();
  useInput();

  const phase = useGameStore(s => s.phase);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 20,
      padding: 20,
    }}>
      {/* Left: HUD */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <HUD />
        <Controls />
      </div>

      {/* Center: Game field */}
      <div style={{ position: 'relative', flexShrink: 0 }} className="scanlines">
        <GameField />
        <ChainOverlay />
        {phase === 'idle' && <PauseScreen />}
        {phase === 'gameover' && <GameOverScreen />}
      </div>

      {/* Right: Next panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '0 8px',
      }}>
        <NextPanel />
      </div>
    </div>
  );
}

export default function App() {
  const phase = useGameStore(s => s.phase);

  return (
    <div style={{ height: '100%' }}>
      {phase === 'idle' && <StartScreen />}
      <Game />
    </div>
  );
}
