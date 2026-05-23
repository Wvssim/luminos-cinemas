// Page /dashboard/salles/new — Formulaire de création d'une nouvelle salle.
// Server Component : affiche RoomForm en mode création avec la Server Action createRoom.
import RoomForm from '@/components/RoomForm';
import { createRoom } from '../actions';

export default async function NewRoom({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // error : message d'erreur passé en query param si la création a échoué
  const sp = await searchParams;
  return (
    <>
      <div className="dash__head"><h1 className="dash__h1">Nouvelle <em>salle</em></h1></div>
      {/* RoomForm sans prop `room` → mode création */}
      <RoomForm action={createRoom} error={sp.error} />
    </>
  );
}
