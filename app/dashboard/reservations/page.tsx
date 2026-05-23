// Page /dashboard/reservations — Liste complète des réservations pour l'administrateur.
// Server Component : charge les 200 dernières réservations avec jointures séance + film.
import { createClient } from '@/lib/supabase/server';

// force-dynamic : nouvelles réservations arrivent en temps réel
export const dynamic = 'force-dynamic';

export default async function ReservationsList() {
  const supabase = await createClient();

  // Jointure imbriquée : reservations → screenings → films (une seule requête Supabase)
  // Limitée à 200 lignes pour les performances — une pagination serait nécessaire à plus grande échelle
  const { data: rows } = await supabase
    .from('reservations')
    .select('id,reference,full_name,email,seats,total,status,created_at, screening:screenings(starts_at, room, film:films(title))')
    .order('created_at', { ascending: false }) // Plus récente en premier
    .limit(200);

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1"><em>Réservations</em></h1>
      </div>

      <table className="tbl">
        <thead><tr>
          <th>Référence</th><th>Client</th><th>Film · Séance</th><th>Places</th><th>Total</th><th>Statut</th><th>Date</th>
        </tr></thead>
        <tbody>
          {(rows || []).map((r: any) => {
            // Convertit le statut en code CSS court : ok / cnl / pend
            const status = r.status === 'confirmed' ? 'ok' : r.status === 'cancelled' ? 'cnl' : 'pend';
            return (
              <tr key={r.id}>
                <td><b>{r.reference}</b></td>
                {/* Nom + email du client sur deux lignes */}
                <td>{r.full_name}<br /><small style={{ color: 'var(--ink-3)' }}>{r.email}</small></td>
                {/* Titre du film + date/salle de la séance sur deux lignes */}
                <td>
                  {r.screening?.film?.title}<br />
                  <small style={{ color: 'var(--ink-3)' }}>
                    {r.screening?.starts_at ? new Date(r.screening.starts_at).toLocaleString('fr-FR') : '—'} · {r.screening?.room}
                  </small>
                </td>
                {/* Liste des sièges réservés (ex: "A3, A4, B7") */}
                <td>{(r.seats || []).join(', ')}</td>
                <td className="is-num">{Number(r.total).toFixed(2)} MAD</td>
                {/* Badge coloré selon le statut : badge--ok / badge--cnl / badge--pend */}
                <td><span className={`badge badge--${status}`}>{r.status}</span></td>
                <td><small style={{ color: 'var(--ink-3)' }}>{new Date(r.created_at).toLocaleString('fr-FR')}</small></td>
              </tr>
            );
          })}
          {(rows || []).length === 0 && (
            <tr><td colSpan={7} style={{ color: 'var(--ink-3)', textAlign: 'center' }}>Aucune réservation.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
