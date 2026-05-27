// lib/types.ts — Types TypeScript partagés entre tous les composants de l'application.
// Reflète le schéma Supabase (tables films, screenings, snacks, reservations).

// Film : données d'un film du catalogue
export type Film = {
  id: string;
  title: string;
  director: string | null;
  year: number | null;
  duration: number | null;          // Durée en minutes
  genres: string[];
  rating: string | null;            // Classification (ex: "Tous publics", "12+")
  synopsis: string | null;
  tagline: string | null;
  cast_members: string[];
  poster_url: string | null;        // URL de l'affiche uploadée (prioritaire sur poster_gradient)
  poster_gradient: string | null;   // Gradient CSS de fallback si pas d'image
  poster_text: string | null;       // Texte affiché sur l'affiche de fallback (ex: "DUNE\nMESSIE")
  backdrop_gradient: string | null; // Gradient radial du fond panoramique (hero)
  backdrop_image_url: string | null;// URL de l'image de fond panoramique (prioritaire sur gradient)
  accent_tone: string | null;       // Couleur d'accentuation du film (ex: "#f4a55c")
  trailer_url?: string | null;      // URL YouTube de la bande-annonce (optionnel)
};

// Screening : une séance programmée dans une salle
export type Screening = {
  id: string;
  film_id: string;
  starts_at: string;                // ISO datetime de début de séance
  room: string;                     // Nom de la salle (ex: "Salle Lumière · IMAX")
  format: string | null;            // Format de projection (VOSTFR, VF, IMAX, etc.)
  total_seats: number;              // Capacité totale de la salle pour cette séance
  price_standard: number;           // Prix siège standard en MAD
  price_premium: number;            // Prix siège premium en MAD
  price_duo: number;                // Prix siège duo (2 places) en MAD
};

// Snack : article de la boutique à commander avant la séance
export type Snack = {
  id: string;
  name: string;
  size: string | null;              // Format/taille (ex: "Grand", "M")
  price: number;                    // Prix en MAD
  emoji: string | null;             // Emoji illustrant le snack (ex: 🍿)
  description: string | null;
};

// SeatCategory : catégorie d'un siège dans la salle
export type SeatCategory = 'standard' | 'premium' | 'duo';

// Seat : représentation d'un siège dans le plan de salle (généré par buildSeatMap)
export type Seat = {
  id: string;                       // Format : "A1", "B5", etc.
  row: string;                      // Lettre de rangée (A–P)
  col: number;                      // Numéro de colonne (1–n)
  category: SeatCategory;
  isDuo: boolean;                   // true si le siège fait partie d'un duo (côte à côte)
  duoPartner: string | null;        // ID du siège partenaire dans le duo
  occupied: boolean;                // true si déjà réservé (confirmed ou pending)
  aisleAfter: boolean;              // true si un couloir central suit ce siège
};

// Reservation : une réservation complète enregistrée en base
export type Reservation = {
  id: string;
  user_id: string | null;           // null si réservation sans compte
  screening_id: string;
  seats: string[];                  // IDs des sièges réservés (ex: ["A3", "A4"])
  seat_categories: Record<string, SeatCategory>; // siège → catégorie
  snacks: Record<string, number>;   // snackId → quantité commandée
  total: number;                    // Montant total en MAD
  status: 'pending' | 'confirmed' | 'cancelled';
  email: string | null;
  full_name: string | null;
  reference: string | null;         // Référence lisible (ex: "LM-2026-3847")
  created_at: string;
};

// SEAT_PRICES : prix par défaut des catégories de sièges en MAD.
// Surchargeable par séance via les champs price_* de la table screenings.
export const SEAT_PRICES = {
  standard: { label: 'Standard', price: 35.0 },
  premium:  { label: 'Premium',  price: 55.0 },
  duo:      { label: 'Duo',      price: 75.0 },
} as const;
