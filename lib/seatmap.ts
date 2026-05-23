// lib/seatmap.ts — Génération du plan de salle et utilitaires de formatage de dates.
import type { Seat, SeatCategory } from './types';

// buildSeatMap : génère dynamiquement la carte des sièges d'une salle.
// Calcule le nombre de rangées et colonnes à partir de totalSeats,
// assigne les catégories (standard / premium) selon la position,
// et marque les sièges déjà réservés comme occupés.
export function buildSeatMap(
  occupied: Set<string> = new Set(), // IDs des sièges déjà réservés pour cette séance
  totalSeats: number = 112            // Capacité totale de la salle
): { row: string; seats: Seat[] }[] {
  // Labels de rangées de A à P (max 16 rangées)
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

  // Calcul du nombre de colonnes : racine carrée de totalSeats, min 6
  const cols = Math.max(6, Math.ceil(Math.sqrt(totalSeats)));
  const rows = Math.ceil(totalSeats / cols);
  const actualRowLabels = rowLabels.slice(0, rows);

  let seatCount = 0;

  return actualRowLabels.map((r, ri) => {
    const seats: Seat[] = [];

    for (let c = 1; c <= cols && seatCount < totalSeats; c++, seatCount++) {
      // Catégorie par défaut : standard
      let category: SeatCategory = 'standard';

      const midCols = Math.floor(cols / 2);

      // Zone Premium : rangées centrales (milieu vertical) et colonnes centrales (milieu horizontal)
      // Correspond aux meilleures places de la salle
      if (
        ri >= Math.floor(rows / 2 - 1) &&
        ri <= Math.floor(rows / 2 + 1) &&
        c >= midCols - 3 &&
        c <= midCols + 3
      ) {
        category = 'premium';
      }

      const id = `${r}${c}`; // Format : "A1", "B5", etc.

      seats.push({
        id,
        row: r,
        col: c,
        category,
        isDuo: false,
        duoPartner: null,
        occupied: occupied.has(id), // true si ce siège est dans la liste des réservés
        aisleAfter: c === Math.ceil(cols / 2), // true pour le siège juste avant le couloir central
      });
    }

    return { row: r, seats };
  });
}

// formatDate : retourne un label lisible pour une date de séance.
// Retourne "Aujourd'hui" ou "Demain" si applicable, sinon le nom du jour long.
// Utilisé dans les listes de séances sur la fiche film.
export function formatDate(iso: string): { day: string; date: string } {
  const d = new Date(iso);
  const now = new Date();

  // Minuit local pour les comparaisons de jour (sans heure)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  let prefix = '';
  if (dd.getTime() === today.getTime()) prefix = "Aujourd'hui";
  else if (dd.getTime() === tomorrow.getTime()) prefix = 'Demain';

  const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
  return { day: prefix || dayName, date: prefix ? dayName : '' };
}

// formatTime : retourne l'heure d'une séance au format HH:MM en français
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// dateKey : extrait la portion YYYY-MM-DD d'un ISO datetime pour grouper les séances par jour
export function dateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
