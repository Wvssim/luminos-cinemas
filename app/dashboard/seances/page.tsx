// Page /dashboard/seances — Liste de toutes les séances programmées pour l'administrateur.
// Server Component : charge les séances avec jointure film depuis Supabase.
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import { createClient } from '@/lib/supabase/server';
import { deleteScreening } from './actions';

// force-dynamic : la liste des séances évolue après création/suppression
export const dynamic = 'force-dynamic';

export default async function SeancesList() {
  const supabase = await createClient();

  // Jointure Supabase : screenings + films(title) en une seule requête
  // Triées chronologiquement pour faciliter la lecture du planning
  const { data: rows } = await supabase
    .from('screenings')
    .select('id,starts_at,room,format,total_seats,film:films(title)')
    .order('starts_at');

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1"><em>Séances</em></h1>
        <Link href="/dashboard/seances/new" className="btn btn--primary">+ Nouvelle séance</Link>
      </div>

      <table className="tbl">
        <thead><tr>
          <th>Film</th><th>Date & heure</th><th>Salle</th><th>Format</th><th>Places</th><th></th>
        </tr></thead>
        <tbody>
          {(rows || []).map((r: any) => (
            <tr key={r.id}>
              {/* Titre du film — lien vers la page d'édition de la séance */}
              <td><Link href={`/dashboard/seances/${r.id}`}>{r.film?.title}</Link></td>
              {/* Date formatée en français avec heure */}
              <td>{new Date(r.starts_at).toLocaleString('fr-FR')}</td>
              <td>{r.room}</td>
              <td>{r.format}</td>
              <td className="is-num">{r.total_seats}</td>
              <td style={{ textAlign: 'right' }}>
                {/* deleteScreening : supprime la séance et invalide le cache */}
                <DeleteButton action={async () => { 'use server'; await deleteScreening(r.id); }} />
              </td>
            </tr>
          ))}
          {(rows || []).length === 0 && (
            <tr><td colSpan={6} style={{ color: 'var(--ink-3)', textAlign: 'center' }}>Aucune séance.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
