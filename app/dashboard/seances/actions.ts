// Server Actions pour la gestion des séances dans le dashboard.
// 'use server' : s'exécutent côté serveur. Opérations CRUD : create, update, delete.
'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// parse : transforme les champs FormData en objet structuré pour la table screenings.
// Convertit la date/heure locale du formulaire en ISO 8601 UTC pour Supabase.
function parse(fd: FormData) {
  return {
    film_id: String(fd.get('film_id') || ''),
    starts_at: new Date(String(fd.get('starts_at') || '')).toISOString(),
    room: String(fd.get('room') || '').trim(),
    format: String(fd.get('format') || '').trim() || null,
    total_seats: Number(fd.get('total_seats') || 168),
    price_standard: Number(fd.get('price_standard') || 12.5),
    price_premium: Number(fd.get('price_premium') || 16),
    price_duo: Number(fd.get('price_duo') || 32),
  };
}

// createScreening : insère une nouvelle séance en base.
// En cas d'erreur : redirige vers le formulaire avec le message d'erreur en query param.
export async function createScreening(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('screenings').insert(parse(fd));
  if (error) return redirect(`/dashboard/seances/new?error=${encodeURIComponent(error.message)}`);
  // Invalide le cache de la liste des séances ET de l'accueil (filtre "cette semaine")
  revalidatePath('/dashboard/seances'); revalidatePath('/');
  redirect('/dashboard/seances');
}

// updateScreening : met à jour une séance existante.
// L'ID est lié via .bind(null, id) dans la page d'édition (paramètre implicite).
export async function updateScreening(id: string, fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('screenings').update(parse(fd)).eq('id', id);
  if (error) return redirect(`/dashboard/seances/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/dashboard/seances'); revalidatePath('/');
  redirect('/dashboard/seances');
}

// deleteScreening : supprime une séance. Les réservations orphelines restent en base.
export async function deleteScreening(id: string) {
  const supabase = await createClient();
  await supabase.from('screenings').delete().eq('id', id);
  revalidatePath('/dashboard/seances'); revalidatePath('/');
}
