// Page /programme : affiche les séances du cinéma par jour, avec barre de recherche par titre de film.
// Server Component — rendu côté serveur à chaque requête (force-dynamic).
import Link from 'next/link';
import Header from '@/components/Header';
import { posterStyle } from '@/components/PosterBg';
import { createClient } from '@/lib/supabase/server';
import type { Film, Screening } from '@/lib/types';

// force-dynamic : désactive le cache Next.js pour toujours avoir les données fraîches
export const dynamic = 'force-dynamic';

// Fuseau horaire de référence pour tous les calculs de date
const TZ = 'Africa/Casablanca';

// Convertit un ISO datetime en date locale YYYY-MM-DD dans le fuseau TZ
function toLocalDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
}

// Formate l'heure d'une séance en HH:MM pour l'affichage dans les chips
function chipTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
}

// Calcule les infos d'affichage d'un onglet de date (label top, sous-label, titre complet)
// Utilise une comparaison par chaîne YYYY-MM-DD pour être cohérent avec le fuseau TZ
function tabInfo(isoDate: string) {
  // Obtenir aujourd'hui et demain en chaîne YYYY-MM-DD dans le même fuseau
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toLocaleDateString('en-CA', { timeZone: TZ });

  const isToday = isoDate === todayStr;
  const isTomorrow = isoDate === tomorrowStr;

  // Reconstituer un objet Date local depuis la chaîne YYYY-MM-DD pour les formatages fr-FR
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  const wd = date.toLocaleDateString('fr-FR', { weekday: 'short' });
  const dm = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const full = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return {
    top: isToday ? "Aujourd'hui" : isTomorrow ? 'Demain' : wd.charAt(0).toUpperCase() + wd.slice(1),
    sub: dm,
    full,
    isToday,
  };
}

export default async function ProgrammePage({
  searchParams,
}: {
  // searchParams : paramètres URL passés par Next.js — date=YYYY-MM-DD et q=recherche
  searchParams: Promise<{ date?: string; q?: string }>;
}) {
  const { date: qDate, q: qSearch = '' } = await searchParams;

  // Création du client Supabase côté serveur (utilise les cookies de session)
  const supabase = await createClient();

  // Récupère toutes les séances futures, triées chronologiquement
  const { data: rawScreenings } = await supabase
    .from('screenings')
    .select('*')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at');

  const allScreenings = (rawScreenings || []) as Screening[];

  // Extrait les jours uniques ayant des séances, en chaînes YYYY-MM-DD (fuseau TZ)
  const daysSet = new Set<string>();
  for (const s of allScreenings) daysSet.add(toLocalDate(s.starts_at));

  // Toujours inclure aujourd'hui dans les onglets, même sans séance
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  daysSet.add(todayStr);

  // Trier les jours chronologiquement
  const days = [...daysSet].sort();

  // Jour sélectionné : priorité à l'URL (?date=), sinon aujourd'hui, sinon premier jour dispo
  const selectedDay = (qDate && days.includes(qDate))
    ? qDate
    : days.includes(todayStr)
      ? todayStr
      : (days[0] ?? '');

  const selectedInfo = selectedDay ? tabInfo(selectedDay) : null;

  // Filtre les séances du jour sélectionné
  const dayScreenings = allScreenings.filter(s => toLocalDate(s.starts_at) === selectedDay);

  // Regroupe les séances par film_id pour afficher un bloc par film
  const byFilm = new Map<string, Screening[]>();
  for (const s of dayScreenings) {
    if (!byFilm.has(s.film_id)) byFilm.set(s.film_id, []);
    byFilm.get(s.film_id)!.push(s);
  }

  // Charge les données des films concernés depuis Supabase
  const filmIds = [...byFilm.keys()];
  const { data: filmsRaw } = filmIds.length
    ? await supabase.from('films').select('*').in('id', filmIds)
    : { data: [] };

  // Index films par ID pour accès O(1) dans le rendu
  const filmMap = new Map<string, Film>();
  for (const f of (filmsRaw as Film[] || [])) filmMap.set(f.id, f);

  // Filtre les films par la recherche textuelle (titre, insensible à la casse)
  const filteredFilmIds = filmIds.filter(fid => {
    if (!qSearch.trim()) return true;
    const f = filmMap.get(fid);
    return f?.title.toLowerCase().includes(qSearch.toLowerCase());
  });

  return (
    <>
      <Header active="programme" />

      {/* ── Barre de recherche ─────────────────────────────── */}
      <div style={{
        background: 'rgba(8,8,10,0.95)',
        borderBottom: '1px solid var(--line)',
        padding: '12px 40px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Formulaire GET : soumet date + q dans l'URL sans JavaScript */}
          <form method="GET" action="/programme" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Conserve le jour sélectionné lors de la recherche */}
            <input type="hidden" name="date" value={selectedDay} />
            <input
              type="search"
              name="q"
              defaultValue={qSearch}
              placeholder="Rechercher un film..."
              style={{
                flex: 1,
                maxWidth: 360,
                background: 'var(--bg-2)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                color: 'var(--ink)',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                padding: '8px 14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 6,
                color: '#000',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                fontWeight: 600,
                padding: '8px 16px',
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              Chercher
            </button>
            {/* Lien pour effacer la recherche */}
            {qSearch && (
              <Link
                href={`/programme?date=${selectedDay}`}
                style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', textDecoration: 'none' }}
              >
                ✕ Effacer
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* ── Onglets de jours (sticky sous le header) ──────── */}
      <div style={{
        position: 'sticky', top: 61, zIndex: 40,
        background: 'rgba(8,8,10,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
        padding: '0 40px',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', gap: 2, overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {days.map(day => {
            const { top, sub, isToday } = tabInfo(day);
            const active = day === selectedDay;
            return (
              // Chaque onglet est un lien qui met à jour ?date= dans l'URL (et conserve ?q=)
              <Link
                key={day}
                href={`/programme?date=${day}${qSearch ? `&q=${encodeURIComponent(qSearch)}` : ''}`}
                style={{
                  textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 1, padding: '14px 18px', flexShrink: 0,
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  color: active ? 'var(--ink)' : 'var(--ink-3)',
                  transition: 'color .15s, border-color .15s',
                }}
              >
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 11,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontWeight: active ? 600 : 400,
                  color: active ? (isToday ? 'var(--accent)' : 'var(--ink)') : 'inherit',
                }}>
                  {top}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .55 }}>
                  {sub}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Contenu principal ──────────────────────────────── */}
      <main>
        <section className="films" style={{ paddingTop: 48 }}>

          {/* En-tête du jour sélectionné */}
          {selectedInfo && (
            <div className="films__head" style={{ marginBottom: 24 }}>
              <div>
                <h1 className="films__title">
                  <em>Programme</em> · {selectedInfo.full}
                </h1>
                {filteredFilmIds.length > 0 && (
                  <p style={{
                    fontFamily: 'var(--mono)', fontSize: 10,
                    color: 'var(--ink-3)', letterSpacing: '0.14em',
                    textTransform: 'uppercase', margin: '6px 0 0',
                  }}>
                    {filteredFilmIds.length} film{filteredFilmIds.length > 1 ? 's' : ''} à l'affiche
                    {qSearch && ` · résultats pour "${qSearch}"`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Liste des films du jour filtrés par la recherche */}
          {filteredFilmIds.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 12, padding: '80px 0', color: 'var(--ink-4)',
            }}>
              <span style={{ fontSize: 48 }}>🎬</span>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
                {qSearch ? `Aucun film trouvé pour "${qSearch}"` : 'Aucune séance ce jour'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredFilmIds.map((fid, i) => {
                const f = filmMap.get(fid);
                if (!f) return null;

                // Trie les séances du film par heure croissante
                const sessions = (byFilm.get(fid) || []).sort(
                  (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
                );

                return (
                  <div
                    key={fid}
                    className="prog__row"
                    style={{
                      borderBottom: i < filteredFilmIds.length - 1 ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    {/* Affiche du film (lien vers la fiche film) */}
                    <Link href={`/films/${f.id}`}>
                      <div
                        className="filmCard__poster"
                        style={{
                          ...posterStyle(f),
                          aspectRatio: '2/3',
                          borderRadius: 4,
                          fontSize: 8,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                        }}
                      >
                        {!f.poster_url && (
                          <span style={{ padding: 4, display: 'block', textAlign: 'center', lineHeight: 1.2 }}>
                            {f.poster_text}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Colonne droite : titre, métadonnées, chips de séances */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                      <div>
                        <Link href={`/films/${f.id}`} style={{ textDecoration: 'none' }}>
                          <h2 style={{
                            fontFamily: 'var(--serif)', fontWeight: 400,
                            fontSize: 22, letterSpacing: '-0.01em',
                            margin: '0 0 4px', lineHeight: 1.05,
                          }}>
                            {f.title}
                          </h2>
                        </Link>
                        {/* Métadonnées du film : réalisateur, année, durée, genres, classification */}
                        <div className="filmCard__meta" style={{ margin: 0 }}>
                          {f.director && <span>{f.director}</span>}
                          {f.year && <><span className="sep">·</span><span>{f.year}</span></>}
                          {f.duration && <><span className="sep">·</span><span>{f.duration} min</span></>}
                          {(f.genres || []).length > 0 && (
                            <><span className="sep">·</span><span>{(f.genres || []).join(' / ')}</span></>
                          )}
                          {f.rating && <><span className="sep">·</span><span>{f.rating}</span></>}
                        </div>
                      </div>

                      {/* Chips de séances : chaque chip est un lien vers la page de sélection de sièges */}
                      <div className="scr__dates" style={{ margin: 0 }}>
                        {sessions.map(s => (
                          <Link
                            key={s.id}
                            href={`/seances/${s.id}`}
                            className="scr__date"
                            style={{ minWidth: 'auto', textDecoration: 'none' }}
                          >
                            <small>{s.room.split(' · ')[0]}</small>
                            <span>{chipTime(s.starts_at)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
