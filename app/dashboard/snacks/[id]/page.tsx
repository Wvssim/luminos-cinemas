// Page /dashboard/snacks/[id] — Formulaire d'édition d'un snack existant.
// Server Component : charge le snack depuis Supabase et affiche SnackForm en mode édition.
import { notFound } from 'next/navigation';
import SnackForm from '@/components/SnackForm';
import { createClient } from '@/lib/supabase/server';
import { updateSnack } from '../actions';

// force-dynamic : données de snack modifiables en temps réel
export const dynamic = 'force-dynamic';

export default async function EditSnack({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  // Charge le snack — notFound() si l'ID n'existe pas
  const { data: s } = await supabase.from('snacks').select('*').eq('id', id).single();
  if (!s) notFound();

  // .bind(null, id) : lie l'ID à updateSnack pour identifier le snack à modifier côté serveur
  const bound = updateSnack.bind(null, id);

  return (
    <>
      <div className="dash__head"><h1 className="dash__h1">Modifier · <em>{s.name}</em></h1></div>
      {/* lockId=true : verrouille le champ ID en mode édition (l'ID ne doit pas changer) */}
      <SnackForm snack={s} action={bound} error={sp.error} lockId />
    </>
  );
}
