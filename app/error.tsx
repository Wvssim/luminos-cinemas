'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, gap: 24, background: 'var(--bg)',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--accent)',
      }}>
        Coupure · technique
      </div>
      <h1 style={{
        fontFamily: 'var(--serif)', fontWeight: 400,
        fontSize: 'clamp(40px, 6vw, 72px)',
        letterSpacing: '-0.02em', margin: 0, textAlign: 'center',
      }}>
        La <em style={{ color: 'var(--accent)' }}>séance</em> est interrompue.
      </h1>
      <p style={{
        color: 'var(--ink-2)', maxWidth: 560, textAlign: 'center',
        fontFamily: 'var(--mono)', fontSize: 12,
      }}>
        {error.message || 'Une erreur inattendue s\'est produite.'}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn--primary" onClick={() => reset()}>Réessayer</button>
        <Link href="/" className="btn btn--ghost">← Accueil</Link>
      </div>
    </div>
  );
}
