// Page /seances/[id] — Sélection interactive des sièges pour une séance donnée.
// Server Component : charge les données de la séance, du film et les sièges occupés,
// puis délègue l'interactivité au Client Component SeatPicker.
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import SeatPicker from '@/components/SeatPicker';
import { createClient } from '@/lib/supabase/server';
import { buildSeatMap, formatTime } from '@/lib/seatmap';

// force-dynamic : les sièges occupés changent en temps réel, pas de cache
export const dynamic = 'force-dynamic';

export default async function SeatsPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  // density : paramètre optionnel pour ajuster la taille visuelle des sièges (compact/normal/large)
  searchParams: Promise<{ density?: string }>;
}) {
  const { id } = await params;
  const { density: dRaw } = await searchParams;

  // Validation de density : ne retient que les valeurs autorisées, par défaut 'normal'
  const density = (['compact', 'normal', 'large'].includes(dRaw || '') ? dRaw : 'normal') as 'compact' | 'normal' | 'large';

  const supabase = await createClient();

  // Charge la séance — notFound() si l'ID est invalide ou supprimé
  const { data: screening } = await supabase
    .from('screenings').select('*').eq('id', id).single();
  if (!screening) notFound();

  // Charge le film associé à la séance
  const { data: film } = await supabase
    .from('films').select('*').eq('id', screening.film_id).single();
  if (!film) notFound();

  // Récupère toutes les réservations confirmées ou en attente pour cette séance
  // pour marquer les sièges occupés dans le plan de salle
  const { data: reservations } = await supabase
    .from('reservations').select('seats').eq('screening_id', id).in('status', ['confirmed', 'pending']);

  // Construit l'ensemble des IDs de sièges déjà pris (format : "A1", "B5", etc.)
  const occupied = new Set<string>();
  for (const r of reservations || []) for (const s of r.seats || []) occupied.add(s);

  // buildSeatMap : génère la grille complète de sièges avec catégories et statut occupé/libre
  const rows = buildSeatMap(occupied, screening.total_seats);

  // Formate l'heure de début pour l'affichage dans SeatPicker (ex: "20:30 · Salle Lumière")
  const startsAtDate = new Date(screening.starts_at);
  const hours = String(startsAtDate.getHours()).padStart(2, '0');
  const minutes = String(startsAtDate.getMinutes()).padStart(2, '0');
  const label = `${hours}:${minutes} · ${screening.room}`;

  return (
    <>
      <Header />
      {/* Étape 3 du tunnel : sélection des sièges */}
      <Stepper current="seats" />
      <main>
        {/* SeatPicker : composant client gérant la sélection interactive et la soumission */}
        <SeatPicker
          screeningId={id}
          density={density}
          rows={rows}
          filmTitle={film.title}
          screeningLabel={label}
          prices={{
            standard: screening.price_standard,
            premium: screening.price_premium,
            duo: screening.price_duo,
          }}
        />
      </main>
    </>
  );
}
