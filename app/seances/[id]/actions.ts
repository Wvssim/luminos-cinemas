// Server Action : pickSeats — étape 3 du tunnel de réservation.
// 'use server' : s'exécute exclusivement côté serveur, appelée depuis le Client Component SeatPicker.
// Reçoit la sélection de sièges, la sauvegarde dans le draft cookie, puis redirige vers /snacks.
'use server';
import { redirect } from 'next/navigation';
import { setDraft } from '@/lib/booking';
import type { SeatCategory } from '@/lib/types';

export async function pickSeats(formData: FormData) {
  // Lecture des champs du FormData envoyé par SeatPicker.submit()
  const screeningId = String(formData.get('screeningId'));
  const payload = String(formData.get('payload') || '[]');

  // Désérialisation du JSON contenant les sièges sélectionnés avec leurs catégories et prix
  const seats = JSON.parse(payload) as { id: string; category: SeatCategory; price: number }[];

  // Validation : au moins un siège requis pour continuer
  if (!seats.length) return;

  // Sauvegarde du draft dans le cookie HTTP (screeningId + seats, snacks vide à cette étape)
  await setDraft({ screeningId, seats, snacks: {} });

  // Redirection vers l'étape suivante du tunnel : sélection des snacks
  redirect('/snacks');
}
