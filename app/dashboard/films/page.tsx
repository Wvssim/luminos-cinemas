// Page /dashboard/films — Liste de tous les films du catalogue pour l'administrateur.
// Server Component : charge les films depuis Supabase et affiche un tableau avec actions CRUD.
import Link from 'next/link';
import Image from 'next/image';
import DeleteButton from '@/components/DeleteButton';
import { createClient } from '@/lib/supabase/server';
import { deleteFilm } from './actions';

// force-dynamic : la liste des films change après chaque création/suppression
export const dynamic = 'force-dynamic';

export default async function FilmsList() {
  const supabase = await createClient();

  // Sélectionne uniquement les colonnes nécessaires pour le tableau (optimise le réseau)
  const { data: films } = await supabase
    .from('films')
    .select('id,title,director,year,duration,rating,poster_url,poster_gradient,poster_text')
    .order('created_at', { ascending: false }); // Plus récent en premier

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1"><em>Films</em></h1>
        <Link href="/dashboard/films/new" className="btn btn--primary">+ Nouveau film</Link>
      </div>

      <table className="tbl">
        <thead><tr>
          <th>Titre</th><th>Réalisateur</th><th>Année</th><th>Durée</th><th>Classif.</th><th></th>
        </tr></thead>
        <tbody>
          {(films || []).map((f) => (
            <tr key={f.id}>
              <td>
                {/* Miniature d'affiche + titre — lien vers la page d'édition du film */}
                <Link href={`/dashboard/films/${f.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {f.poster_url ? (
                    // Image optimisée Next.js si une affiche est uploadée
                    <Image
                      src={f.poster_url}
                      alt=""
                      width={28}
                      height={40}
                      style={{ borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    // Placeholder gradient de fallback si pas d'image
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 40, borderRadius: '3px', flexShrink: 0,
                      background: f.poster_gradient || 'var(--ink-2, #333)',
                      fontSize: '6px', color: '#fff', textAlign: 'center',
                      lineHeight: 1.2, padding: '2px', overflow: 'hidden',
                    }}>
                      {f.poster_text?.split('\\n')[0] || '—'}
                    </span>
                  )}
                  {f.title}
                </Link>
              </td>
              <td>{f.director}</td>
              <td className="is-num">{f.year}</td>
              <td className="is-num">{f.duration} min</td>
              <td>{f.rating}</td>
              <td style={{ textAlign: 'right' }}>
                {/* DeleteButton : affiche window.confirm avant d'appeler deleteFilm */}
                <DeleteButton action={async () => { 'use server'; await deleteFilm(f.id); }} />
              </td>
            </tr>
          ))}
          {(films || []).length === 0 && (
            <tr><td colSpan={6} style={{ color: 'var(--ink-3)', textAlign: 'center' }}>Aucun film.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
