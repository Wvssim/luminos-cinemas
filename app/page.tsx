// Page d'accueil — route /
// Server Component : récupère uniquement les films ayant des séances cette semaine.
// "Cette semaine" = du lundi 00:00 au dimanche 23:59 en heure locale.
import { Metadata } from 'next';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import HeroCarousel from '@/components/HeroCarousel';
import FilmsGrid from '@/components/FilmsGrid';
import { createClient } from '@/lib/supabase/server';
import type { Film } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Accueil · Lumière Cinémas',
  description: 'Réservez vos places de cinéma en ligne. Films à l\'affiche, séances, plan de salle 3D.',
};

// Calcule le début (lundi 00:00) et la fin (dimanche 23:59) de la semaine courante
function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  // Décalage pour remonter au lundi : si dimanche (0) → -6, sinon 1 - day
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.toISOString(), end: sunday.toISOString() };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { start, end } = getWeekRange();

  // Étape 1 : récupère les séances programmées cette semaine
  const { data: weekScreenings } = await supabase
    .from('screenings')
    .select('film_id')
    .gte('starts_at', start)
    .lte('starts_at', end);

  // Étape 2 : extrait les IDs de films uniques ayant au moins une séance cette semaine
  const weekFilmIds = [...new Set((weekScreenings || []).map(s => s.film_id))];

  // Étape 3 : charge les films de la semaine (ou tous les films si aucune séance cette semaine)
  let list: Film[] = [];
  if (weekFilmIds.length > 0) {
    const { data } = await supabase
      .from('films')
      .select('*')
      .in('id', weekFilmIds)
      .order('created_at', { ascending: false });
    list = (data || []) as Film[];
  } else {
    // Fallback : pas de séances cette semaine → affiche tous les films du catalogue
    const { data } = await supabase
      .from('films')
      .select('*')
      .order('created_at', { ascending: false });
    list = (data || []) as Film[];
  }

  return (
    <>
      <Header active="home" />
      <Stepper current="home" />
      <main>
        <div className="home">
          {/* HeroCarousel : affiché uniquement s'il y a des films à l'affiche */}
          {list.length > 0 && <HeroCarousel films={list} />}

          <section className="films">
            <div className="films__head">
              <h2 className="films__title">À <em>l'affiche</em> cette semaine</h2>
              <div className="films__filters">
                <span className="is-on">Tous</span>
                <span>VOSTFR</span>
                <span>IMAX</span>
                <span>Avant-premières</span>
              </div>
            </div>
            {/* FilmsGrid : composant client avec recherche locale, reçoit les films filtrés */}
            <FilmsGrid films={list} />
          </section>
        </div>
      </main>
    </>
  );
}
