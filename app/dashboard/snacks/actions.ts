// Server Actions pour la gestion des snacks dans le dashboard.
// 'use server' : s'exécutent côté serveur. Opérations CRUD : create, update, delete.
'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// parse : transforme les champs FormData en objet structuré pour la table snacks.
function parse(fd: FormData) {
  return {
    id: String(fd.get('id') || '').trim(),          // ID personnalisé (ex: "popcorn-large")
    name: String(fd.get('name') || '').trim(),
    size: String(fd.get('size') || '').trim() || null,
    price: Number(fd.get('price') || 0),
    emoji: String(fd.get('emoji') || '').trim() || null,
    description: String(fd.get('description') || '').trim() || null,
  };
}

// createSnack : insère un nouveau snack en base avec son ID personnalisé.
export async function createSnack(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('snacks').insert(parse(fd));
  if (error) return redirect(`/dashboard/snacks/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/dashboard/snacks');
  redirect('/dashboard/snacks');
}

// updateSnack : met à jour un snack existant.
// L'ID est exclu de l'update (immuable) — seules les métadonnées sont modifiées.
export async function updateSnack(id: string, fd: FormData) {
  const supabase = await createClient();
  const p = parse(fd);
  const { error } = await supabase.from('snacks').update({
    name: p.name, size: p.size, price: p.price, emoji: p.emoji, description: p.description,
    // Note : p.id n'est pas inclus — l'ID d'un snack ne change jamais après création
  }).eq('id', id);
  if (error) return redirect(`/dashboard/snacks/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/dashboard/snacks');
  redirect('/dashboard/snacks');
}

// deleteSnack : supprime un snack du catalogue.
export async function deleteSnack(id: string) {
  const supabase = await createClient();
  await supabase.from('snacks').delete().eq('id', id);
  revalidatePath('/dashboard/snacks');
}
