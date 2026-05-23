export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid', placeItems: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11,
        letterSpacing: '0.3em', textTransform: 'uppercase',
        color: 'var(--ink-3)',
      }}>
        Projection en cours…
      </div>
    </div>
  );
}
