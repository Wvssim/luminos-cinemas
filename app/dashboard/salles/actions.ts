// Server Actions pour la gestion des salles dans le dashboard.
// 'use server' : s'exécutent côté serveur. Opérations CRUD : create, update, delete.
'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// parse : transforme les champs FormData en objet structuré pour la table rooms.
function parse(fd: FormData) {
  return {
    name: String(fd.get('name') || '').trim(),
    tech: String(fd.get('tech') || '').trim() || null,           // Technologie de projection (IMAX, Dolby, etc.)
    capacity: Number(fd.get('capacity') || 0),                   // Nombre de fauteuils
    description: String(fd.get('description') || '').trim() || null,
    accent_color: String(fd.get('accent_color') || '').trim() || null, // Couleur CSS unique (ex: "#1a6ebd")
  };
}

// createRoom : insère une nouvelle salle en base.
// revalidatePath sur /salles pour que la page publique reflète immédiatement la nouvelle salle.
export async function createRoom(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').insert(parse(fd));
  if (error) return redirect(`/dashboard/salles/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/dashboard/salles');
  revalidatePath('/salles'); // Invalide aussi la page publique /salles
  redirect('/dashboard/salles');
}

// updateRoom : met à jour une salle existante.
export async function updateRoom(id: string, fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').update(parse(fd)).eq('id', id);
  if (error) return redirect(`/dashboard/salles/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/dashboard/salles');
  revalidatePath('/salles');
  redirect('/dashboard/salles');
}

// deleteRoom : supprime une salle. Les séances et réservations associées ne sont pas supprimées.
export async function deleteRoom(id: string) {
  const supabase = await createClient();
  await supabase.from('rooms').delete().eq('id', id);
  revalidatePath('/dashboard/salles');
  revalidatePath('/salles');
}
