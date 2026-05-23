// Page /dashboard/snacks/new — Formulaire de création d'un nouveau snack.
// Server Component : affiche SnackForm en mode création avec la Server Action createSnack.
import SnackForm from '@/components/SnackForm';
import { createSnack } from '../actions';

export default async function NewSnack({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <div className="dash__head"><h1 className="dash__h1">Nouveau <em>snack</em></h1></div>
      {/* SnackForm sans prop `snack` → mode création */}
      <SnackForm action={createSnack} error={sp.error} />
    </>
  );
}
