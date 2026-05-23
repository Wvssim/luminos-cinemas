// Page /dashboard/salles — Liste des salles de cinéma pour l'administrateur.
// Server Component : charge toutes les salles depuis Supabase avec leurs équipements.
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import { createClient } from '@/lib/supabase/server';
import { deleteRoom } from './actions';

// force-dynamic : la liste des salles évolue après création/suppression
export const dynamic = 'force-dynamic';

export default async function SallesList() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from('rooms').select('*').order('name');

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1"><em>Salles</em></h1>
        <Link href="/dashboard/salles/new" className="btn btn--primary">+ Nouvelle salle</Link>
      </div>

      <table className="tbl">
        <thead><tr>
          <th>Nom</th><th>Technologie</th><th>Capacité</th><th>Description</th><th></th>
        </tr></thead>
        <tbody>
          {(rooms || []).map((r) => (
            <tr key={r.id}>
              <td>
                {/* Nom de la salle avec un indicateur coloré selon la couleur d'accent de la salle */}
                <Link href={`/dashboard/salles/${r.id}`}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {r.accent_color && (
                      // Pastille colorée avec glow — couleur unique par salle (ex: bleu IMAX)
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: r.accent_color, flexShrink: 0,
                        boxShadow: `0 0 6px ${r.accent_color}`,
                      }} />
                    )}
                    {r.name}
                  </span>
                </Link>
              </td>
              <td style={{ color: 'var(--ink-2)' }}>{r.tech || '—'}</td>
              <td className="is-num">{r.capacity}</td>
              {/* Description tronquée avec ellipsis si trop longue */}
              <td style={{ color: 'var(--ink-3)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.description || '—'}
              </td>
              <td style={{ textAlign: 'right' }}>
                {/* deleteRoom : supprime la salle et revalide la page */}
                <DeleteButton action={async () => { 'use server'; await deleteRoom(r.id); }} />
              </td>
            </tr>
          ))}
          {(rooms || []).length === 0 && (
            <tr><td colSpan={5} style={{ color: 'var(--ink-3)', textAlign: 'center' }}>
              Aucune salle. <Link href="/dashboard/salles/new" style={{ color: 'var(--accent)' }}>En créer une →</Link>
            </td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
