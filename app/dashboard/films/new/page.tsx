// Page /dashboard/films/new — Formulaire de création d'un nouveau film.
// Server Component : affiche FilmForm en mode création avec la Server Action createFilm.
import FilmForm from '@/components/FilmForm';
import { createFilm } from '../actions';

export default async function NewFilm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // error : message d'erreur passé en query param si la création a échoué (ex: titre manquant)
  const sp = await searchParams;
  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1">Nouveau <em>film</em></h1>
      </div>
      {/* FilmForm sans prop `film` → mode création, sans `apiRoute` → Server Action directe */}
      <FilmForm action={createFilm} error={sp.error} />
    </>
  );
}
