const KEY = ({ k, label }: { k: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(180,200,255,0.55)' }}>
    <kbd style={{
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 4,
      padding: '2px 6px',
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'rgba(200,220,255,0.8)',
      minWidth: 54,
      textAlign: 'center',
    }}>{k}</kbd>
    <span>{label}</span>
  </div>
);

export function Controls() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(100,120,255,0.15)',
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ fontSize: 10, color: 'rgba(180,200,255,0.4)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 4 }}>
        CONTROLS
      </div>
      <KEY k="← / →" label="移動" />
      <KEY k="↑ / X" label="右回転" />
      <KEY k="Z" label="左回転" />
      <KEY k="↓" label="ソフトドロップ" />
      <KEY k="Space" label="ハードドロップ" />
      <KEY k="P / Esc" label="一時停止" />
    </div>
  );
}
