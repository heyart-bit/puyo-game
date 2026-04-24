import { Cell, COLOR_STYLES } from '../game/types';

interface Props {
  color: Cell;
  size?: number;
  neighbors?: { up: boolean; down: boolean; left: boolean; right: boolean };
  flashing?: boolean;
  ghost?: boolean;
}

export function PuyoCell({ color, size = 48, neighbors, flashing = false, ghost = false }: Props) {
  if (!color) return <div style={{ width: size, height: size }} />;

  const styles = COLOR_STYLES[color as keyof typeof COLOR_STYLES] ?? COLOR_STYLES.garbage;
  const nb = neighbors ?? { up: false, down: false, left: false, right: false };

  const borderRadius = [
    nb.up    ? '10%' : '50%',
    nb.right ? '10%' : '50%',
    nb.down  ? '10%' : '50%',
    nb.left  ? '10%' : '50%',
  ].join(' ');

  const opacity = ghost ? 0.3 : flashing ? undefined : 1;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0,
        animation: flashing ? 'flash 0.12s ease-in-out infinite alternate' : undefined,
        opacity,
      }}
    >
      {/* Main body */}
      <div
        style={{
          position: 'absolute',
          inset: '4%',
          borderRadius,
          background: ghost
            ? `radial-gradient(circle at 35% 35%, ${styles.bg}88, ${styles.dark}44)`
            : `radial-gradient(circle at 35% 35%, ${styles.bg}, ${styles.dark})`,
          boxShadow: ghost ? 'none' : `0 0 ${size * 0.25}px ${styles.glow}, inset 0 -3px 6px rgba(0,0,0,0.3)`,
          transition: 'border-radius 0.06s ease',
        }}
      />
      {/* Highlight shine */}
      {!ghost && color !== 'garbage' && (
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '20%',
            width: '28%',
            height: '22%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.55)',
            filter: 'blur(2px)',
          }}
        />
      )}
      {/* Eyes for non-garbage puyos */}
      {!ghost && color !== 'garbage' && (
        <>
          <div style={{
            position: 'absolute',
            top: '30%', left: '28%',
            width: '16%', height: '20%',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              position: 'absolute',
              top: '30%', left: '30%',
              width: '50%', height: '50%',
              borderRadius: '50%',
              background: '#222',
            }} />
          </div>
          <div style={{
            position: 'absolute',
            top: '30%', right: '28%',
            width: '16%', height: '20%',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              position: 'absolute',
              top: '30%', left: '30%',
              width: '50%', height: '50%',
              borderRadius: '50%',
              background: '#222',
            }} />
          </div>
        </>
      )}
      {/* Connectors */}
      {nb.right && !ghost && (
        <div style={{
          position: 'absolute',
          top: '30%', right: '-18%',
          width: '22%', height: '40%',
          background: styles.bg,
          boxShadow: `0 0 ${size * 0.15}px ${styles.glow}`,
          zIndex: 1,
        }} />
      )}
      {nb.down && !ghost && (
        <div style={{
          position: 'absolute',
          bottom: '-18%', left: '30%',
          width: '40%', height: '22%',
          background: styles.bg,
          boxShadow: `0 0 ${size * 0.15}px ${styles.glow}`,
          zIndex: 1,
        }} />
      )}
    </div>
  );
}
