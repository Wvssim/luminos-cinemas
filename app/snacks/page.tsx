// Page /snacks — Sélection optionnelle de snacks avant le paiement.
// Server Component : lit le draft cookie pour vérifier que la réservation est en cours,
// charge le catalogue de snacks depuis Supabase et délègue l'interactivité à SnacksForm.
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import SnacksForm from '@/components/SnacksForm';
import { createClient } from '@/lib/supabase/server';
import { getDraft } from '@/lib/booking';

// force-dynamic : le draft cookie change à chaque étape du tunnel, pas de cache
export const dynamic = 'force-dynamic';

export default async function SnacksPage() {
  // getDraft : lit le cookie 'lumiere_draft' — redirect('/') si absent (accès direct sans réservation)
  const draft = await getDraft();
  if (!draft) redirect('/');

  const supabase = await createClient();

  // Charge les snacks triés par prix croissant pour l'affichage dans la grille
  const { data: snacks } = await supabase.from('snacks').select('*').order('price');

  return (
    <>
      <Header />
      {/* Étape 4 du tunnel : sélection des snacks */}
      <Stepper current="snacks" />
      <main>
        <div className="snk">
          <div className="snk__inner">
            <div className="snk__head">
              <h1 className="snk__h1">Un petit <em>extra</em> ?</h1>
              {/* Rappel : snacks à retirer au comptoir, non livrés en salle */}
              <div className="snk__sub">À récupérer au comptoir avant la séance · facultatif</div>
            </div>
            {/* SnacksForm : composant client gérant les quantités + soumission vers /pay */}
            <SnacksForm snacks={snacks || []} />
          </div>
        </div>
      </main>
    </>
  );
}
