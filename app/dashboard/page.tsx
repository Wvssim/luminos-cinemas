// Page /dashboard — Vue d'ensemble du back-office administrateur.
// Server Component : charge les KPIs en parallèle via Promise.all pour minimiser la latence.
// Protégée par le layout /dashboard/layout.tsx (vérifie admin avant d'afficher cette page).
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

// force-dynamic : KPIs mis à jour en temps réel (nouvelles réservations, films, etc.)
export const dynamic = 'force-dynamic';

export default async function DashHome() {
  const supabase = await createClient();

  // Charge les 5 métriques en parallèle pour optimiser les performances
  // head: true + count: 'exact' — ne retourne que le COUNT SQL, pas les lignes (plus rapide)
  const [
    { count: films },
    { count: screenings },
    { count: reservations },
    { count: rooms },
    { data: rev },
  ] = await Promise.all([
    supabase.from('films').select('*', { count: 'exact', head: true }),
    supabase.from('screenings').select('*', { count: 'exact', head: true }),
    // Compte uniquement les réservations confirmées (pas pending ni cancelled)
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
    // Charge les totaux pour calculer le CA (chiffre d'affaires) confirmé
    supabase.from('reservations').select('total').eq('status', 'confirmed'),
  ]);

  // Calcul du CA total : somme des montants de toutes les réservations confirmées
  const revenue = (rev || []).reduce((a, r) => a + Number(r.total), 0);

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1"><em>Vue</em> d'ensemble</h1>
      </div>

      {/* Grille des 4 KPIs principaux */}
      <div className="statGrid">
        <div className="stat">
          <div className="stat__k">Films à l'affiche</div>
          <div className="stat__v">{films ?? 0}</div>
        </div>
        <div className="stat">
          <div className="stat__k">Séances programmées</div>
          <div className="stat__v">{screenings ?? 0}</div>
        </div>
        <div className="stat">
          <div className="stat__k">Salles</div>
          <div className="stat__v">{rooms ?? 0}</div>
        </div>
        <div className="stat">
          <div className="stat__k">CA confirmé</div>
          <div className="stat__v">{revenue.toFixed(0)} <span style={{ fontSize: 16, fontStyle: 'normal', fontFamily: 'var(--mono)', color: 'var(--ink-3)', letterSpacing: '0.06em' }}>MAD</span></div>
        </div>
      </div>

      {/* Widgets secondaires : accès rapides + compteur réservations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>

        {/* Widget gauche : raccourcis de création */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 3, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>
            Accès rapides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/dashboard/films/new" className="btn btn--ghost" style={{ justifyContent: 'flex-start' }}>+ Nouveau film</Link>
            <Link href="/dashboard/seances/new" className="btn btn--ghost" style={{ justifyContent: 'flex-start' }}>+ Nouvelle séance</Link>
            <Link href="/dashboard/salles/new" className="btn btn--ghost" style={{ justifyContent: 'flex-start' }}>+ Nouvelle salle</Link>
          </div>
        </div>

        {/* Widget droit : nombre de réservations confirmées avec lien vers la liste */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 3, padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 14 }}>
            Réservations confirmées
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 48, lineHeight: 1, marginBottom: 8 }}>
            {reservations ?? 0}
          </div>
          <Link href="/dashboard/reservations" style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Voir toutes →
          </Link>
        </div>
      </div>
    </>
  );
}
