// Server Actions de paiement — étape 5 du tunnel de réservation.
// 'use server' : toutes les fonctions s'exécutent côté serveur.
// Contient 3 actions : paiement Stripe, paiement en espèces, et confirmation directe.
'use server';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { getDraft, clearDraft } from '@/lib/booking';
import { createClient } from '@/lib/supabase/server';

// Initialisation du client Stripe avec la clé secrète (jamais exposée au navigateur)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// createCheckoutSession : crée une session de paiement Stripe et redirige vers la page Stripe hébergée.
// Les métadonnées de réservation (sièges, snacks, nom) sont encodées dans la session
// pour être récupérées après paiement via le webhook ou la page /pay/success.
export async function createCheckoutSession(formData: FormData) {
  // Lecture du draft cookie — contient screeningId, seats, snacks
  const draft = await getDraft();
  if (!draft) redirect('/'); // Draft expiré : retour à l'accueil

  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  if (!email || !fullName) return;

  // Récupération des prix des snacks depuis Supabase pour calculer le montant total
  const supabase = await createClient();
  const { data: snacks } = await supabase.from('snacks').select('id,price');
  const priceById = new Map((snacks || []).map((s) => [s.id, Number(s.price)]));

  // Calcul du total : sièges + snacks
  const seatsTotal = draft.seats.reduce((a, s) => a + s.price, 0);
  const snacksTotal = Object.entries(draft.snacks).reduce(
    (a, [id, q]) => a + (priceById.get(id) || 0) * q, 0
  );
  const total = Math.round((seatsTotal + snacksTotal) * 100); // Stripe attend les centimes

  // Création de la session Stripe Checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'mad',
        product_data: { name: 'Réservation cinéma' },
        unit_amount: total,
      },
      quantity: 1,
    }],
    mode: 'payment',
    customer_email: email,
    // success_url : Stripe redirige ici après paiement réussi, avec session_id en param
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    // cancel_url : Stripe redirige ici si l'utilisateur annule
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay`,
    // Métadonnées : persistées dans la session Stripe pour reconstruire la réservation après paiement
    metadata: {
      fullName,
      screeningId: draft.screeningId,
      seats: JSON.stringify(draft.seats),
      snacks: JSON.stringify(draft.snacks),
    },
  });

  if (!session.url) redirect('/');
  // Redirection vers la page de paiement Stripe hébergée (hors du domaine de l'application)
  redirect(session.url);
}

// createCashReservation : crée une réservation en espèces avec statut 'pending'.
// L'utilisateur paiera à la caisse — la réservation est créée immédiatement sans paiement en ligne.
export async function createCashReservation(formData: FormData) {
  const draft = await getDraft();
  if (!draft) redirect('/');

  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  if (!email || !fullName) return;

  const supabase = await createClient();
  // Récupère l'utilisateur connecté (peut être null si non connecté)
  const { data: { user } } = await supabase.auth.getUser();
  const { data: snacks } = await supabase.from('snacks').select('id,price');
  const priceById = new Map((snacks || []).map((s) => [s.id, Number(s.price)]));

  const seatsTotal = draft.seats.reduce((a, s) => a + s.price, 0);
  const snacksTotal = Object.entries(draft.snacks).reduce(
    (a, [id, q]) => a + (priceById.get(id) || 0) * q, 0
  );
  const total = +(seatsTotal + snacksTotal).toFixed(2);

  // Génération d'une référence unique : LM-ANNÉE-XXXX (ex: LM-2026-4782)
  const reference = `LM-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Dictionnaire siège → catégorie (nécessaire pour l'affichage du billet)
  const seat_categories = Object.fromEntries(draft.seats.map((s) => [s.id, s.category]));

  // Insertion de la réservation en base avec statut 'pending' (en attente de paiement en caisse)
  const { data: inserted, error } = await supabase
    .from('reservations')
    .insert({
      user_id: user?.id || null,
      screening_id: draft.screeningId,
      seats: draft.seats.map((s) => s.id),
      seat_categories,
      snacks: draft.snacks,
      total,
      status: 'pending', // Paiement non encore effectué
      email,
      full_name: fullName,
      reference,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('reservation insert', error);
    return;
  }

  // Suppression du draft cookie — la réservation est créée, le tunnel est terminé
  await clearDraft();
  redirect(`/confirm/${inserted.id}`);
}

// confirmBooking : crée une réservation directement confirmée (paiement alternatif).
// Similaire à createCashReservation mais avec statut 'confirmed' immédiat.
export async function confirmBooking(formData: FormData) {
  const draft = await getDraft();
  if (!draft) redirect('/');

  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  if (!email) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: snacks } = await supabase.from('snacks').select('id,price');
  const priceById = new Map((snacks || []).map((s) => [s.id, Number(s.price)]));

  const seatsTotal = draft.seats.reduce((a, s) => a + s.price, 0);
  const snacksTotal = Object.entries(draft.snacks).reduce(
    (a, [id, q]) => a + (priceById.get(id) || 0) * q, 0
  );
  const total = +(seatsTotal + snacksTotal).toFixed(2);
  const reference = `LM-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const seat_categories = Object.fromEntries(draft.seats.map((s) => [s.id, s.category]));

  const { data: inserted, error } = await supabase
    .from('reservations')
    .insert({
      user_id: user?.id || null,
      screening_id: draft.screeningId,
      seats: draft.seats.map((s) => s.id),
      seat_categories,
      snacks: draft.snacks,
      total,
      status: 'confirmed', // Paiement confirmé immédiatement
      email,
      full_name: fullName,
      reference,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('reservation insert', error);
    return;
  }

  await clearDraft();
  redirect(`/confirm/${inserted.id}`);
}
