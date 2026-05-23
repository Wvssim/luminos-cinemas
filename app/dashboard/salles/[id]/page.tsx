// Page /dashboard/salles/[id] — Formulaire d'édition d'une salle existante.
// Server Component : charge la salle depuis Supabase et affiche RoomForm en mode édition.
import { notFound } from 'next/navigation';
import RoomForm from '@/components/RoomForm';
import { createClient } from '@/lib/supabase/server';
import { updateRoom } from '../actions';

// force-dynamic : données de salle modifiables, pas de cache
export const dynamic = 'force-dynamic';

export default async function EditRoom({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  // Charge la salle — notFound() si l'ID est invalide
  const { data: room } = await supabase.from('rooms').select('*').eq('id', id).single();
  if (!room) notFound();

  // .bind(null, id) : lie l'ID à updateRoom pour que la Server Action sache quelle salle modifier
  const bound = updateRoom.bind(null, id);

  return (
    <>
      <div className="dash__head"><h1 className="dash__h1">Modifier · <em>{room.name}</em></h1></div>
      {/* RoomForm préchargé avec les données de la salle existante */}
      <RoomForm room={room} action={bound} error={sp.error} />
    </>
  );
}
