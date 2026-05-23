// Page /account — Gestion du compte utilisateur connecté.
// Server Component : protégée par authentification, charge le profil depuis Supabase.
// Sections : modification du nom, réinitialisation du mot de passe, lien vers les réservations.
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';
import { updateProfile } from './actions';

// force-dynamic : les données de profil peuvent changer après soumission du formulaire
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Garde d'authentification : redirige vers /login si pas de session active
  if (!user) redirect('/login?next=/account');

  // Charge le profil étendu (table profiles, créée par trigger à l'inscription)
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

  return (
    <>
      <Header />
      <main>
        <section className="films" style={{ maxWidth: 720, marginBottom: 80 }}>
          <div className="films__head">
            <h2 className="films__title">Mon <em>compte</em></h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Section Profil : email (lecture seule) + nom modifiable */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', padding: 24, borderRadius: 2 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>
                Profil
              </div>
              {/* action={updateProfile} : Server Action qui met à jour profiles.full_name */}
              <form action={updateProfile} className="form">
                <div className="form__field">
                  <label>Email</label>
                  {/* Email désactivé : Supabase Auth ne permet pas de le changer via ce flux */}
                  <input type="email" value={user.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form__field">
                  <label>Nom complet</label>
                  <input name="fullName" defaultValue={profile?.full_name || ''} />
                </div>
                <div className="form__actions">
                  <button type="submit" className="btn btn--primary">Enregistrer →</button>
                </div>
              </form>
            </div>

            {/* Section Sécurité : lien vers le flow de réinitialisation de mot de passe Supabase */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', padding: 24, borderRadius: 2 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>
                Sécurité
              </div>
              <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '0 0 16px' }}>
                Pour changer votre mot de passe, utilisez le lien « Mot de passe oublié » lors de votre prochaine connexion.
              </p>
              {/* Redirige vers le endpoint Supabase Auth de récupération de mot de passe */}
              <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(process.env.NEXT_PUBLIC_SUPABASE_URL || '')}`} className="btn btn--ghost">
                Réinitialiser mot de passe →
              </a>
            </div>

            {/* Section Données : lien vers l'historique des réservations */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', padding: 24, borderRadius: 2 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>
                Données
              </div>
              <p style={{ color: 'var(--ink-2)', margin: 0 }}>
                Vous pouvez consulter vos réservations dans <a href="/mes-reservations" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Mes réservations</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
