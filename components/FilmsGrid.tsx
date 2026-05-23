// Composant FilmsGrid — Grille de films avec barre de recherche côté client.
// 'use client' : gère l'état de recherche localement avec useState.
// Reçoit tous les films depuis le Server Component parent — pas de rechargement de page.
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { posterStyle } from '@/components/PosterBg';
import type { Film } from '@/lib/types';

export default function FilmsGrid({ films }: { films: Film[] }) {
  // q : valeur de la barre de recherche — mise à jour à chaque frappe sans rechargement
  const [q, setQ] = useState('');

  // Filtrage local en temps réel — insensible à la casse, sur le titre du film
  const filtered = q.trim()
    ? films.filter(f => f.title.toLowerCase().includes(q.toLowerCase()))
    : films;

  return (
    <>
      {/* Barre de recherche — input contrôlé, filtre instantané sans soumission */}
      <div style={{ marginBottom: 32, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
          {/* Icône loupe */}
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 13, pointerEvents: 'none',
          }}>
            ⌕
          </span>
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Rechercher un film..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              color: 'var(--ink)',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              padding: '10px 16px 10px 36px',
              outline: 'none',
            }}
          />
        </div>

        {/* Compteur de résultats + bouton Effacer — visibles uniquement si recherche active */}
        {q && (
          <>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setQ('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--mono)', fontSize: 11,
                color: 'var(--ink-3)', padding: 0, whiteSpace: 'nowrap',
              }}
            >
              ✕ Effacer
            </button>
          </>
        )}
      </div>

      {/* Grille des films filtrés */}
      <div className="filmsGrid">
        {filtered.map((f) => (
          <Link key={f.id} href={`/films/${f.id}`} className="filmCard" style={{ textDecoration: 'none' }}>
            <div className="filmCard__poster" style={posterStyle(f)}>
              {!f.poster_url && f.poster_text}
            </div>
            <h3 className="filmCard__title">{f.title}</h3>
            <div className="filmCard__meta">
              <span>{f.duration} min</span>
              <span className="sep">·</span>
              <span>{f.genres[0]}</span>
              <span className="sep">·</span>
              <span>{f.rating}</span>
            </div>
            <span className="filmCard__cta">Voir les séances →</span>
          </Link>
        ))}

        {/* Aucun résultat */}
        {filtered.length === 0 && q && (
          <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Aucun film trouvé pour « {q} »
          </p>
        )}

        {/* Catalogue vide */}
        {films.length === 0 && (
          <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Aucun film. Connectez Supabase et exécutez supabase/schema.sql.
          </p>
        )}
      </div>
    </>
  );
}
