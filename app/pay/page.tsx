// Page /pay — Récapitulatif et paiement de la réservation.
// Server Component : lit le draft cookie, charge les données de séance/film/snacks,
// calcule le total, puis affiche le formulaire de paiement (PayForm) et le récapitulatif.
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import PayForm from '@/components/PayForm';
import { posterStyle } from '@/components/PosterBg';
import { createClient } from '@/lib/supabase/server';
import { getDraft } from '@/lib/booking';
import { formatTime, formatDate } from '@/lib/seatmap';

// force-dynamic : données de session et draft changent entre requêtes
export const dynamic = 'force-dynamic';

export default async function PayPage() {
  // getDraft : vérifie qu'une réservation est bien en cours (cookie présent)
  const draft = await getDraft();
  if (!draft) redirect('/');

  const supabase = await createClient();

  // Récupère l'utilisateur connecté pour pré-remplir l'email dans PayForm
  const { data: { user } } = await supabase.auth.getUser();

  // Charge la séance et le film associés au draft
  const { data: screening } = await supabase
    .from('screenings').select('*').eq('id', draft.screeningId).single();
  if (!screening) redirect('/');

  const { data: film } = await supabase
    .from('films').select('*').eq('id', screening.film_id).single();
  if (!film) redirect('/');

  // Charge les prix des snacks pour calculer le sous-total commande
  const { data: snacks } = await supabase.from('snacks').select('id,name,price');
  const priceById = new Map((snacks || []).map((s) => [s.id, Number(s.price)]));

  // Calcul des totaux depuis le draft (sièges + snacks)
  const seatsTotal = draft.seats.reduce((a, s) => a + s.price, 0);
  const snacksTotal = Object.entries(draft.snacks).reduce(
    (a, [id, q]) => a + (priceById.get(id) || 0) * q, 0);
  const total = seatsTotal + snacksTotal;

  // Formate la date de séance pour le récapitulatif (ex: "Vendredi 23 mai")
  const dd = formatDate(screening.starts_at);

  return (
    <>
      <Header />
      {/* Étape 5 du tunnel : paiement */}
      <Stepper current="pay" />
      <main>
        <div className="pay">
          <div className="pay__inner">
            {/* Colonne gauche : formulaire de paiement */}
            <div>
              <h1 className="pay__h1"><em>Paiement</em> sécurisé</h1>
              {/* PayForm : composant client gérant le choix du mode de paiement (Stripe / espèces) */}
              <PayForm defaultEmail={user?.email || ''} />
            </div>

            {/* Colonne droite : récapitulatif de la commande */}
            <aside>
              <div className="recap">
                <div className="recap__h">Récapitulatif</div>

                {/* Affiche miniature + infos film */}
                <div className="recap__film">
                  <div className="recap__poster" style={posterStyle(film)}>
                    {!film.poster_url && film.poster_text}
                  </div>
                  <div className="recap__filmInfo">
                    <h4>{film.title}</h4>
                    <span>{dd.day} {dd.date}</span>
                    <span>{formatTime(screening.starts_at)} · {screening.room}</span>
                    <span>{screening.format}</span>
                  </div>
                </div>

                {/* Lignes du récapitulatif de prix */}
                <div className="recap__line">
                  <span>{draft.seats.length} place{draft.seats.length > 1 ? 's' : ''}</span>
                  <span>{seatsTotal.toFixed(2)} MAD</span>
                </div>
                {/* Ligne snacks : affichée uniquement si des snacks ont été commandés */}
                {snacksTotal > 0 && (
                  <div className="recap__line"><span>Snacks</span><span>{snacksTotal.toFixed(2)} MAD</span></div>
                )}
                <div className="recap__line"><span>Frais de réservation</span><span>0,00 MAD</span></div>
                <div className="recap__line is-total"><span>Total</span><b>{total.toFixed(2)} MAD</b></div>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 12 }}>
                  Bouton « Confirmer » dans le formulaire ci-contre.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
