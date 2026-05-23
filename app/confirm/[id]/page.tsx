// Page /confirm/[id] — Billet de confirmation après réservation réussie.
// Server Component : charge la réservation, génère un QR code avec la référence,
// et affiche le billet numérique complet avec les détails de la séance.
import { notFound } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatTime } from '@/lib/seatmap';

// force-dynamic : réservations mises à jour en temps réel (statut, etc.)
export const dynamic = 'force-dynamic';

export default async function ConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Charge la réservation complète — notFound() si l'ID est inconnu
  const { data: r } = await supabase.from('reservations').select('*').eq('id', id).single();
  if (!r) notFound();

  // Charge la séance et le film associés (! : garantis non-null si la réservation existe)
  const { data: screening } = await supabase.from('screenings').select('*').eq('id', r.screening_id).single();
  const { data: film } = await supabase.from('films').select('*').eq('id', screening!.film_id).single();
  const dd = formatDate(screening!.starts_at);

  // Génère un QR code encodant la référence de réservation (ex: "LM-2026-3847")
  // Largeur 200px, marge 1 module — retourne une data URL base64 affichable directement
  const qrDataUrl = await QRCode.toDataURL(r.reference || '', { width: 200, margin: 1 });

  return (
    <>
      <Header />
      {/* Étape 6 (dernière) du tunnel : confirmation */}
      <Stepper current="done" />
      <main>
        <div className="cfm">
          {/* Icône checkmark SVG de confirmation */}
          <div className="cfm__check">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5 11-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="cfm__h">À tout de suite <em>en salle</em>.</h1>
          <p className="cfm__sub">Votre billet a été envoyé à {r.email}</p>

          {/* Billet numérique : section principale + QR code côte à côte */}
          <div className="ticket">
            <div className="ticket__main">
              <div className="ticket__brand">Lumière · Paris Bastille</div>
              <h2 className="ticket__title">{film!.title}</h2>
              <div className="ticket__sub">{dd.day} {dd.date} · {formatTime(screening!.starts_at)} · {screening!.format}</div>

              {/* Grille d'informations du billet (salle, places, montant, référence, nom) */}
              <div className="ticket__grid">
                <div className="ticket__cell"><span className="ticket__cellK">Salle</span><span className="ticket__cellV">{screening!.room.split(' · ')[0]}</span></div>
                <div className="ticket__cell"><span className="ticket__cellK">Places</span><span className="ticket__cellV">{(r.seats || []).join(', ')}</span></div>
                <div className="ticket__cell"><span className="ticket__cellK">Total</span><span className="ticket__cellV">{Number(r.total).toFixed(2)} MAD</span></div>
                <div className="ticket__cell"><span className="ticket__cellK">Référence</span><span className="ticket__cellV">{r.reference}</span></div>
                <div className="ticket__cell"><span className="ticket__cellK">Nom</span><span className="ticket__cellV">{r.full_name}</span></div>
                <div className="ticket__cell"><span className="ticket__cellK">Ouverture</span><span className="ticket__cellV">15 min avant</span></div>
              </div>
            </div>

            {/* QR code généré serveur — encode la référence pour validation en caisse */}
            <div className="ticket__qr">
              <img src={qrDataUrl} alt="QR Code" style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>

          {/* Actions post-réservation */}
          <div className="cfm__cta">
            <Link href="/" className="btn btn--ghost">← Retour à l'accueil</Link>
            <button className="btn btn--primary">Ajouter à mon agenda</button>
          </div>
        </div>
      </main>
    </>
  );
}
