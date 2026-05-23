// Page /pay/success — Callback Stripe après paiement réussi.
// Stripe redirige ici avec ?session_id=<id> après un paiement carte validé.
// Server Component : vérifie le paiement via l'API Stripe, crée la réservation en base,
// nettoie le draft cookie, puis redirige vers la page de confirmation.
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import { createClient } from '@/lib/supabase/server';
import { clearDraft } from '@/lib/booking';

// Initialisation du client Stripe avec la clé secrète serveur
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// force-dynamic : chaque appel correspond à un paiement unique, pas de cache possible
export const dynamic = 'force-dynamic';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  // Sécurité : session_id requis (Stripe fournit toujours ce paramètre en cas de succès)
  if (!session_id) redirect('/');

  // Vérifie le statut de paiement directement auprès de l'API Stripe (pas de webhook ici)
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (session.payment_status !== 'paid') redirect('/');

  const supabase = await createClient();
  // Récupère l'utilisateur connecté (peut être null — réservation possible sans compte)
  const { data: { user } } = await supabase.auth.getUser();

  // Récupère les métadonnées de réservation encodées dans la session Stripe lors du checkout
  const metadata = session.metadata || {};
  const seats = JSON.parse(metadata.seats || '[]');
  const snacks = JSON.parse(metadata.snacks || '{}');
  const screeningId = metadata.screeningId || '';
  const fullName = metadata.fullName || '';
  const email = session.customer_email || '';

  // Validation minimale : séance et sièges requis pour créer la réservation
  if (!screeningId || !seats.length) redirect('/');

  // Recharge les prix des snacks depuis Supabase pour recalculer le total côté serveur
  const { data: snackData } = await supabase.from('snacks').select('id,price');
  const priceById = new Map((snackData || []).map((s: any) => [s.id, Number(s.price)]));
  const seatsTotal = seats.reduce((a: number, s: any) => a + s.price, 0);
  const snacksTotal = Object.entries(snacks).reduce((a: number, [id, q]: any) => a + (priceById.get(id) || 0) * q, 0);
  const total = +(seatsTotal + snacksTotal).toFixed(2);

  // Génère une référence lisible unique : LM-ANNÉE-XXXX (ex: LM-2026-3847)
  const reference = `LM-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  // Mappe chaque ID de siège vers sa catégorie pour l'affichage du billet
  const seat_categories = Object.fromEntries(seats.map((s: any) => [s.id, s.category]));

  // Insère la réservation confirmée dans Supabase
  const { data: inserted, error } = await supabase
    .from('reservations')
    .insert({
      user_id: user?.id || null,
      screening_id: screeningId,
      seats: seats.map((s: any) => s.id),
      seat_categories,
      snacks,
      total,
      status: 'confirmed', // Paiement Stripe validé → statut directement confirmé
      email,
      full_name: fullName,
      reference,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('reservation insert', error);
    redirect('/');
  }

  // Supprime le cookie draft — tunnel terminé, plus besoin de l'état intermédiaire
  await clearDraft();

  // Redirige vers la page billet avec le QR code
  redirect(`/confirm/${inserted.id}`);
}
