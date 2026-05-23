// Page /dashboard/seances/new — Formulaire de création d'une nouvelle séance.
// Server Component : charge les films disponibles pour le select, affiche ScreeningForm.
import ScreeningForm from '@/components/ScreeningForm';
import { createClient } from '@/lib/supabase/server';
import { createScreening } from '../actions';

// force-dynamic : la liste des films doit être fraîche (un film peut avoir été ajouté)
export const dynamic = 'force-dynamic';

export default async function NewSeance({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();

  // Charge les films pour le menu déroulant du formulaire (id + titre uniquement)
  const { data: films } = await supabase.from('films').select('id,title').order('title');

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1">Nouvelle <em>séance</em></h1>
      </div>
      {/* ScreeningForm : formulaire de création avec liste de films et Server Action */}
      <ScreeningForm films={films || []} action={createScreening} error={sp.error} />
    </>
  );
}
