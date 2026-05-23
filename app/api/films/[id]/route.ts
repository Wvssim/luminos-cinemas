// Route API /api/films/[id] — Endpoint POST pour la mise à jour d'un film avec upload d'image.
// Utilisée par FilmForm en mode édition (apiRoute prop) quand un fichier est joint.
// Utilise createAdminClient (service_role) pour bypasser RLS sur les opérations de storage.
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// normalizeYouTubeUrl : convertit une URL YouTube vers le format /embed/ pour l'iframe
function normalizeYouTubeUrl(url: string): string {
  if (!url) return url;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

// POST : reçoit un multipart/form-data depuis FilmForm et met à jour le film en base.
// Gère l'upload de l'affiche vers Supabase Storage si un fichier est présent.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const supabase = createAdminClient(); // service_role pour l'accès storage sans RLS

    // Upload de l'affiche vers Supabase Storage si un fichier est fourni
    let posterUrl: string | null = null;
    const file = formData.get('poster') as File | null;
    if (file && file.size > 0) {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'posters';
      // Nom de fichier unique basé sur le timestamp + caractères sûrs pour les URLs
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        posterUrl = data.publicUrl;
      }
    }

    // Parsage et validation du formulaire
    const trailerUrl = String(formData.get('trailer_url') || '').trim();
    const updateData: Record<string, unknown> = {
      title: String(formData.get('title') || '').trim(),
      director: String(formData.get('director') || '').trim() || null,
      year: formData.get('year') ? Number(formData.get('year')) : null,
      duration: formData.get('duration') ? Number(formData.get('duration')) : null,
      // genres et cast_members : champs texte séparés par virgules → tableau
      genres: String(formData.get('genres') || '').split(',').map((s) => s.trim()).filter(Boolean),
      rating: String(formData.get('rating') || '').trim() || null,
      synopsis: String(formData.get('synopsis') || '').trim() || null,
      tagline: String(formData.get('tagline') || '').trim() || null,
      cast_members: String(formData.get('cast') || '').split(',').map((s) => s.trim()).filter(Boolean),
      poster_gradient: String(formData.get('poster_gradient') || '').trim() || null,
      poster_text: String(formData.get('poster_text') || '').trim() || null,
      backdrop_gradient: String(formData.get('backdrop_gradient') || '').trim() || null,
      backdrop_image_url: String(formData.get('backdrop_image_url') || '').trim() || null,
      accent_tone: String(formData.get('accent_tone') || '').trim() || null,
      trailer_url: trailerUrl ? normalizeYouTubeUrl(trailerUrl) : null,
    };

    // Ajoute l'URL de l'affiche uploadée si disponible
    if (posterUrl) updateData.poster_url = posterUrl;

    // Tentative de mise à jour avec trailer_url
    const { error } = await supabase.from('films').update(updateData).eq('id', id);
    if (error) {
      // Fallback : retry sans trailer_url si la colonne n'existe pas en base
      const { trailer_url, ...without } = updateData;
      await supabase.from('films').update(without).eq('id', id);
    }

    // Invalide le cache de la liste des films et de l'accueil
    revalidatePath('/dashboard/films');
    revalidatePath('/');

    // 303 See Other : redirige vers la liste après soumission POST (pattern PRG)
    return NextResponse.redirect(new URL('/dashboard/films', request.url), { status: 303 });
  } catch (error) {
    const id = (await (request as any).nextUrl.searchParams).get('id') || 'unknown';
    const errorMsg = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.redirect(new URL(`/dashboard/films/${id}?error=${encodeURIComponent(errorMsg)}`, request.url), { status: 303 });
  }
}
