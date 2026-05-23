// lib/booking.ts — Gestion du Draft cookie de réservation.
// 'use server' : toutes les fonctions sont des Server Actions,
// elles s'exécutent exclusivement côté serveur (jamais dans le bundle client).
'use server';
import { cookies } from 'next/headers';

// Type Draft : représente l'état intermédiaire d'une réservation en cours.
// Persiste entre les pages du tunnel (séance → sièges → snacks → paiement)
// sans recourir à un store global (Redux, Zustand, etc.).
export type Draft = {
  screeningId: string; // ID de la séance sélectionnée
  seats: { id: string; category: 'standard' | 'premium' | 'duo'; price: number }[]; // Sièges choisis
  snacks: Record<string, number>; // snackId → quantité commandée
};

// Nom du cookie HTTP utilisé pour persister le draft
const KEY = 'lumiere_draft';

// getDraft : lit et désérialise le draft depuis le cookie.
// Retourne null si le cookie est absent ou corrompu (JSON invalide).
export async function getDraft(): Promise<Draft | null> {
  const c = await cookies();
  const raw = c.get(KEY)?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// setDraft : sérialise et écrit le draft dans le cookie HTTP.
// httpOnly: false — le cookie est lisible côté client (nécessaire pour certains composants).
// maxAge: 3600 — expire après 1 heure pour éviter des drafts orphelins.
export async function setDraft(d: Draft) {
  const c = await cookies();
  c.set(KEY, JSON.stringify(d), { httpOnly: false, path: '/', maxAge: 60 * 60 });
}

// clearDraft : supprime le cookie draft après finalisation ou annulation de la réservation.
export async function clearDraft() {
  const c = await cookies();
  c.delete(KEY);
}
