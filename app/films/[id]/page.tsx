// Page /films/[id] — Fiche détaillée d'un film avec ses séances à venir.
// Server Component : récupère le film, ses séances futures et le nombre de places réservées par séance.
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import ScreeningsList from '@/components/ScreeningsList';
import { posterStyle, backdropStyle } from '@/components/PosterBg';
import { createClient } from '@/lib/supabase/server';

// normalizeYouTubeUrl : convertit toute URL YouTube vers le format /embed/ requis par <iframe>
// Supporte les formats : youtube.com/watch?v=, youtu.be/, youtube.com/embed/
function normalizeYouTubeUrl(url: string): string {
  if (!url) return url;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

// force-dynamic : toujours re-rendre (les places réservées changent en temps réel)
export const dynamic = 'force-dynamic';

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Charge le film — notFound() déclenche la page 404 Next.js si absent
  const { data: film } = await supabase.from('films').select('*').eq('id', id).single();
  if (!film) notFound();

  // Récupère uniquement les séances futures de ce film, triées chronologiquement
  const { data: screenings } = await supabase
    .from('screenings')
    .select('*')
    .eq('film_id', id)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at');

  // Calcule le nombre de places réservées (confirmées) par séance
  // pour afficher "X places libres" dans ScreeningsList
  const ids = (screenings || []).map((s) => s.id);
  let booked: Record<string, number> = {};
  if (ids.length) {
    const { data: res } = await supabase
      .from('reservations')
      .select('screening_id, seats')
      .in('screening_id', ids)
      .eq('status', 'confirmed');
    for (const r of res || []) {
      // Cumule le nombre de sièges (tableau) par séance
      booked[r.screening_id] = (booked[r.screening_id] || 0) + (r.seats?.length || 0);
    }
  }

  // Enrichit chaque séance avec son compteur de places réservées
  const withCount = (screenings || []).map((s) => ({ ...s, booked: booked[s.id] || 0 }));

  return (
    <>
      <Header />
      {/* Étape 2 du tunnel : sélection de la séance */}
      <Stepper current="screenings" />
      <main>
        <div className="scr">
          {/* Bandeau hero : backdrop du film en fond + affiche + infos + bande annonce */}
          <div className="scr__hero">
            <div className="scr__heroBg" style={backdropStyle(film)} />
            <div className="scr__heroInner">
              {/* Affiche portrait du film */}
              <div className="scr__poster" style={posterStyle(film)}>
                {!film.poster_url && film.poster_text}
              </div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flex: 1, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 className="scr__title">{film.title}</h1>
                  <p className="scr__tagline">« {film.tagline} »</p>
                  {/* Métadonnées : réalisateur, durée, genres, classification */}
                  <div className="scr__meta">
                    <span>{film.director}</span><span className="sep">·</span>
                    <span>{film.duration} min</span><span className="sep">·</span>
                    <span>{(film.genres || []).join(' / ')}</span><span className="sep">·</span>
                    <span>{film.rating}</span>
                  </div>
                  <p className="scr__synopsis">{film.synopsis}</p>
                  <div className="scr__cast"><b>Avec</b>{(film.cast_members || []).join(' · ')}</div>
                </div>
                {/* Bande annonce : affichée uniquement si trailer_url existe */}
                {film.trailer_url && (
                  <div style={{ flexShrink: 0, width: 'min(400px, 100%)' }}>
                    <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', opacity: 0.8 }}>Bande annonce</h3>
                    <iframe
                      width="400"
                      height="225"
                      src={normalizeYouTubeUrl(film.trailer_url)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: '6px', display: 'block' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ScreeningsList : composant client pour naviguer entre les dates et choisir une séance */}
          <ScreeningsList screenings={withCount} />
        </div>
      </main>
    </>
  );
}
