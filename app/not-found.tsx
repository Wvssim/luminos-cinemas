import Link from 'next/link';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <>
      <Header />
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 40, gap: 24,
      }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--accent)',
        }}>
          Erreur · 404
        </div>
        <h1 style={{
          fontFamily: 'var(--serif)', fontWeight: 400,
          fontSize: 'clamp(48px, 8vw, 96px)',
          letterSpacing: '-0.02em', margin: 0, textAlign: 'center',
        }}>
          Salle <em style={{ color: 'var(--accent)' }}>introuvable</em>.
        </h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 16, maxWidth: 480, textAlign: 'center' }}>
          La page que vous cherchez n'est pas à l'affiche.
        </p>
        <Link href="/" className="btn btn--primary">← Retour à l'accueil</Link>
      </div>
    </>
  );
}
