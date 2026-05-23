// Server Actions pour la gestion des films dans le dashboard.
// 'use server' : toutes les fonctions s'exécutent côté serveur.
// Opérations CRUD : createFilm, updateFilm, deleteFilm.
'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// normalizeYouTubeUrl : convertit une URL YouTube vers le format /embed/
function normalizeYouTubeUrl(url: string): string {
  if (!url) return url;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

// parsePayload : transforme les champs FormData bruts en objet structuré pour Supabase.
// Gère les conversions de types (string → number, string → string[], null si vide).
function parsePayload(fd: FormData) {
  const trailerUrl = String(fd.get('trailer_url') || '').trim();
  return {
    title: String(fd.get('title') || '').trim(),
    director: String(fd.get('director') || '').trim() || null,
    year: fd.get('year') ? Number(fd.get('year')) : null,
    duration: fd.get('duration') ? Number(fd.get('duration')) : null,
    // Champs séparés par virgules → tableau (genres: "Action, Drame" → ["Action", "Drame"])
    genres: String(fd.get('genres') || '').split(',').map((s) => s.trim()).filter(Boolean),
    rating: String(fd.get('rating') || '').trim() || null,
    synopsis: String(fd.get('synopsis') || '').trim() || null,
    tagline: String(fd.get('tagline') || '').trim() || null,
    cast_members: String(fd.get('cast') || '').split(',').map((s) => s.trim()).filter(Boolean),
    poster_gradient: String(fd.get('poster_gradient') || '').trim() || null,
    poster_text: String(fd.get('poster_text') || '').trim() || null,
    backdrop_gradient: String(fd.get('backdrop_gradient') || '').trim() || null,
    backdrop_image_url: String(fd.get('backdrop_image_url') || '').trim() || null,
    accent_tone: String(fd.get('accent_tone') || '').trim() || null,
    // Normalise l'URL YouTube vers le format /embed/ avant sauvegarde
    trailer_url: trailerUrl ? normalizeYouTubeUrl(trailerUrl) : null,
  };
}

// maybeUploadPoster : upload l'affiche vers Supabase Storage si un fichier est fourni.
// Retourne l'URL publique du fichier ou null si pas d'upload.
async function maybeUploadPoster(fd: FormData, supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const file = fd.get('poster') as File | null;
  if (!file || typeof file === 'string' || !file.size) return null;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'posters';
  // Nom de fichier sanitisé avec timestamp pour unicité
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) { console.error('upload', error); return null; }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// createFilm : insère un nouveau film en base.
// Fallback sans trailer_url si la colonne n'existe pas (compatibilité schéma).
export async function createFilm(fd: FormData) {
  const supabase = await createClient();
  const payload = parsePayload(fd);
  const posterUrl = await maybeUploadPoster(fd, supabase);
  let { error } = await supabase.from('films').insert({ ...payload, poster_url: posterUrl });
  if (error) {
    // Retry sans trailer_url : la colonne peut ne pas exister si le schéma n'a pas été migré
    const { trailer_url, ...payloadWithoutTrailer } = payload;
    const retry = await supabase.from('films').insert({ ...payloadWithoutTrailer, poster_url: posterUrl });
    error = retry.error;
  }
  if (error) return redirect(`/dashboard/films/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/dashboard/films'); revalidatePath('/');
  redirect('/dashboard/films');
}

// updateFilm : met à jour un film existant (hors upload — géré par la route API /api/films/[id]).
export async function updateFilm(id: string, fd: FormData) {
  const supabase = await createClient();
  const payload = parsePayload(fd);
  const posterUrl = await maybeUploadPoster(fd, supabase);
  const update: Record<string, unknown> = { ...payload };
  if (posterUrl) update.poster_url = posterUrl; // Écrase l'affiche uniquement si une nouvelle est uploadée

  let { error } = await supabase.from('films').update(update).eq('id', id);
  if (error) {
    // Retry sans trailer_url (fallback de compatibilité schéma)
    const { trailer_url, ...payloadWithoutTrailer } = payload;
    const updateWithoutTrailer: Record<string, unknown> = { ...payloadWithoutTrailer };
    if (posterUrl) updateWithoutTrailer.poster_url = posterUrl;
    const retry = await supabase.from('films').update(updateWithoutTrailer).eq('id', id);
    error = retry.error;
  }
  if (error) return redirect(`/dashboard/films/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/dashboard/films'); revalidatePath('/');
  redirect('/dashboard/films');
}

// deleteFilm : supprime un film de la base (et ses séances en cascade si la FK est configurée).
export async function deleteFilm(id: string) {
  const supabase = await createClient();
  await supabase.from('films').delete().eq('id', id);
  revalidatePath('/dashboard/films'); revalidatePath('/');
}
