// Page /prochainement — Films dont l'année de sortie est dans le futur.
// Server Component : filtre les films avec year > année courante, pas de séances requises.
import Link from 'next/link';
import Header from '@/components/Header';
import { posterStyle } from '@/components/PosterBg';
import { createClient } from '@/lib/supabase/server';

// force-dynamic : la liste des films à venir évolue régulièrement
export const dynamic = 'force-dynamic';

export default async function ProchainementPage() {
  const supabase = await createClient();

  // Récupère les films dont l'année de sortie est strictement supérieure à l'année courante
  // Triés par année croissante pour afficher les sorties les plus proches en premier
  const { data: films } = await supabase
    .from('films')
    .select('*')
    .gt('year', new Date().getFullYear())
    .order('year');

  const list = films || [];

  return (
    <>
      {/* active="prochainement" : met en surbrillance le lien nav correspondant dans Header */}
      <Header active="prochainement" />
      <main>
        <section className="films">
          <div className="films__head">
            <h2 className="films__title"><em>Prochainement</em> à Lumière</h2>
            <div className="films__filters">
              <span>Aperçu des sorties à venir</span>
            </div>
          </div>

          {/* Cas vide : aucun film à venir */}
          {list.length === 0 ? (
            <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Aucune sortie programmée pour le moment.
            </p>
          ) : (
            <div className="filmsGrid">
              {list.map((f) => (
                // Lien vers la fiche film — même si pas encore de séances, les infos sont disponibles
                <Link key={f.id} href={`/films/${f.id}`} className="filmCard" style={{ textDecoration: 'none' }}>
                  <div className="filmCard__poster" style={posterStyle(f)}>
                    {!f.poster_url && f.poster_text}
                  </div>
                  <h3 className="filmCard__title">{f.title}</h3>
                  {/* Métadonnées : année de sortie à la place de la durée (différenciateur clé) */}
                  <div className="filmCard__meta">
                    <span>{f.year}</span><span className="sep">·</span>
                    <span>{(f.genres || [])[0]}</span><span className="sep">·</span>
                    <span>{f.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
