// Page /salles — Présentation des salles de cinéma avec leurs équipements et capacités.
// Server Component : charge toutes les salles depuis Supabase et calcule le total des fauteuils.
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';

// force-dynamic : données des salles modifiables depuis le dashboard admin
export const dynamic = 'force-dynamic';

export default async function SallesPage() {
  const supabase = await createClient();

  // Charge toutes les salles triées alphabétiquement par nom
  const { data: rooms } = await supabase.from('rooms').select('*').order('name');
  const list = rooms || [];

  // Calcule la capacité totale du cinéma (somme des fauteuils de toutes les salles)
  const totalSeats = list.reduce((s, r) => s + (r.capacity || 0), 0);

  return (
    <>
      {/* active="salles" : met en surbrillance le lien correspondant dans la navigation */}
      <Header active="salles" />
      <main>
        <section className="films">
          <div className="films__head">
            <h2 className="films__title">Nos <em>salles</em></h2>
            <div className="films__filters">
              {/* Résumé : adresse · nombre de salles · capacité totale */}
              <span>Paris · Bastille · {list.length} salle{list.length !== 1 ? 's' : ''} · {totalSeats} fauteuils</span>
            </div>
          </div>

          {/* Cas vide : aucune salle configurée en base */}
          {list.length === 0 && (
            <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Aucune salle configurée.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {list.map((r) => {
              const color = r.accent_color || '#f4efe6';
              // Fond radial unique par salle : couleur d'accent de la salle avec très faible opacité
              const bg = `radial-gradient(ellipse at 50% 30%, ${color}18 0%, #08080a 65%)`;

              return (
                <div key={r.id} style={{
                  position: 'relative',
                  padding: '32px 36px',
                  border: '1px solid var(--line-2)',
                  borderRadius: 3,
                  background: bg,
                  overflow: 'hidden',
                  transition: 'border-color .2s',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-end' }}>
                    <div>
                      {/* Technologie de projection en couleur d'accent de la salle */}
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em',
                        textTransform: 'uppercase', color: color, marginBottom: 8,
                      }}>
                        {r.tech || 'Projection numérique'}
                      </div>
                      {/* Nom de la salle en grande typographie serif */}
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 48, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                        {r.name}
                      </h3>
                      {r.description && (
                        <p style={{ color: 'var(--ink-2)', maxWidth: 640, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                          {r.description}
                        </p>
                      )}
                    </div>

                    {/* Capacité de la salle en grand chiffre (partie droite de la carte) */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                        Capacité
                      </div>
                      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 56, color: 'var(--ink)', lineHeight: 1 }}>
                        {r.capacity}
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                        fauteuils
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
