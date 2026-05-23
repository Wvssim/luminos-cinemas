// Page /dashboard/seances/[id] — Formulaire d'édition d'une séance existante.
// Server Component : charge la séance + la liste des films en parallèle, affiche ScreeningForm.
import { notFound } from 'next/navigation';
import ScreeningForm from '@/components/ScreeningForm';
import { createClient } from '@/lib/supabase/server';
import { updateScreening } from '../actions';

// force-dynamic : la séance peut être modifiée depuis un autre onglet
export const dynamic = 'force-dynamic';

export default async function EditSeance({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  // error : message d'erreur de validation passé par la Server Action via redirect(?error=...)
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  // Charge la séance et la liste des films en parallèle pour minimiser la latence
  const [{ data: s }, { data: films }] = await Promise.all([
    supabase.from('screenings').select('*').eq('id', id).single(),
    supabase.from('films').select('id,title').order('title'),
  ]);
  if (!s) notFound();

  // .bind(null, id) : crée une version partielle de updateScreening avec l'ID déjà lié
  // nécessaire car les Server Actions ne peuvent pas recevoir d'arguments directement depuis JSX
  const bound = updateScreening.bind(null, id);

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1">Modifier <em>séance</em></h1>
      </div>
      {/* ScreeningForm : formulaire préchargé avec les données de la séance existante */}
      <ScreeningForm screening={s} films={films || []} action={bound} error={sp.error} />
    </>
  );
}
