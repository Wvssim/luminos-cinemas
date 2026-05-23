// Page /dashboard/films/[id] — Formulaire d'édition d'un film existant.
// Server Component : charge le film depuis Supabase et affiche FilmForm en mode édition.
// Utilise une route API (/api/films/[id]) pour gérer l'upload d'image (multipart/form-data).
import { notFound } from 'next/navigation';
import FilmForm from '@/components/FilmForm';
import { createClient } from '@/lib/supabase/server';

// force-dynamic : les données du film peuvent changer depuis un autre onglet admin
export const dynamic = 'force-dynamic';

export default async function EditFilm({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  // error : message d'erreur transmis par la route API après un échec d'update
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  // Charge le film complet — notFound() si l'ID n'existe pas en base
  const { data: film } = await supabase.from('films').select('*').eq('id', id).single();
  if (!film) notFound();

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1">Modifier · <em>{film.title}</em></h1>
      </div>
      {/* apiRoute : FilmForm utilise fetch vers cette route pour gérer l'upload de l'affiche */}
      <FilmForm film={film} apiRoute={`/api/films/${id}`} error={sp.error} />
    </>
  );
}
