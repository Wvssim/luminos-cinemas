// Page /mes-reservations — Historique des réservations de l'utilisateur connecté.
// Server Component : protégée par authentification (redirect vers /login si non connecté).
// Charge toutes les réservations de l'utilisateur avec les données de séance et film associées.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';
import { formatTime } from '@/lib/seatmap';

// force-dynamic : liste des réservations mise à jour en temps réel
export const dynamic = 'force-dynamic';

export default async function MesReservations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Garde d'authentification : redirige vers /login avec le next param pour revenir après connexion
  if (!user) redirect('/login?next=/mes-reservations');

  // Charge les réservations de l'utilisateur avec jointures imbriquées :
  // reservation → screening → film (via Supabase foreign key select)
  const { data: rows } = await supabase
    .from('reservations')
    .select('id, reference, seats, total, status, created_at, screening:screenings(starts_at, room, format, film:films(title, poster_gradient, poster_text, poster_url))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }); // Plus récente en premier

  return (
    <>
      <Header />
      <main>
        <section className="films">
          <div className="films__head">
            <h2 className="films__title">Mes <em>réservations</em></h2>
            {/* Email de l'utilisateur affiché dans les filtres */}
            <div className="films__filters"><span>{user.email}</span></div>
          </div>

          {/* Cas vide : aucune réservation */}
          {(!rows || rows.length === 0) ? (
            <div style={{ padding: '40px 0', color: 'var(--ink-3)' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Aucune réservation pour le moment.
              </p>
              <Link href="/" className="btn btn--primary" style={{ marginTop: 16 }}>Voir les films →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(rows as any[]).map((r) => {
                const f = r.screening?.film;

                // badge : code court du statut pour la classe CSS (ok / cnl / pend)
                const status = r.status === 'confirmed' ? 'ok' : r.status === 'cancelled' ? 'cnl' : 'pend';

                return (
                  // Chaque réservation est cliquable et mène vers le billet (/confirm/[id])
                  <Link key={r.id} href={`/confirm/${r.id}`} style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto',
                    gap: 20, alignItems: 'center',
                    padding: 20,
                    background: 'var(--bg-2)',
                    border: '1px solid var(--line-2)',
                    borderRadius: 2,
                    textDecoration: 'none', color: 'inherit',
                  }}>
                    {/* Miniature d'affiche du film */}
                    <div style={{
                      aspectRatio: '2/3', borderRadius: 2,
                      background: f?.poster_url ? `center/cover url(${f.poster_url})` : (f?.poster_gradient || 'var(--bg-3)'),
                      display: 'grid', placeItems: 'center',
                      fontFamily: 'var(--serif)', fontSize: 10, color: 'rgba(255,255,255,0.95)',
                      textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1,
                    }}>
                      {!f?.poster_url && f?.poster_text}
                    </div>

                    {/* Informations de réservation : titre, date/heure/salle, référence + places */}
                    <div>
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '0 0 4px' }}>{f?.title}</h3>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
                        {r.screening && `${new Date(r.screening.starts_at).toLocaleDateString('fr-FR')} · ${formatTime(r.screening.starts_at)} · ${r.screening.room}`}
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', marginTop: 4 }}>
                        Réf. {r.reference} · Places {(r.seats || []).join(', ')}
                      </div>
                    </div>

                    {/* Colonne droite : badge de statut + montant total */}
                    <div style={{ textAlign: 'right' }}>
                      {/* badge--ok / badge--cnl / badge--pend — styles définis dans globals.css */}
                      <span className={`badge badge--${status}`}>{r.status}</span>
                      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, marginTop: 6 }}>
                        {Number(r.total).toFixed(2)} MAD
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
