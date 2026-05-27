// Page /login — Formulaire de connexion utilisateur.
// Server Component : affiche le formulaire et les erreurs passées en query param (?error=...).
// La soumission est gérée par la Server Action `login` (app/auth/actions.ts).
import Link from 'next/link';
import Header from '@/components/Header';
import { login } from '@/app/auth/actions';

export default async function LoginPage({
  searchParams,
}: {
  // error : message d'erreur Supabase Auth encodé dans l'URL (ex: "Invalid login credentials")
  // next  : URL de redirection après connexion réussie (ex: "/dashboard", "/mes-reservations")
  searchParams: Promise<{ error?: string; next?: string; verify?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <Header />
      <div className="auth">
        <div className="auth__box">
          <h1 className="auth__h">Mon <em>compte</em></h1>
          <p className="auth__sub">Connectez-vous à Lumière</p>

          {/* Bannière de vérification email — affichée après une inscription réussie */}
          {sp.verify === '1' && (
            <div className="auth__info">
              <span className="auth__info-icon">✉️</span>
              <div>
                <strong>Vérifiez votre boîte mail</strong>
                <p>Un lien de confirmation vous a été envoyé. Cliquez dessus pour activer votre compte, puis connectez-vous ici.</p>
              </div>
            </div>
          )}

          {/* Bannière d'erreur Supabase Auth */}
          {sp.error && <div className="auth__err">{sp.error}</div>}

          <form action={login} className="form">
            <input type="hidden" name="next" value={sp.next || '/'} />
            <div className="form__field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="exemple@domaine.com"
                autoComplete="email"
              />
              <span className="form__hint">Format attendu : exemple@domaine.com</span>
            </div>
            <div className="form__field">
              <label>Mot de passe</label>
              <input type="password" name="password" required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn--primary" style={{ marginTop: 8 }}>Se connecter →</button>
          </form>

          <p className="auth__alt">
            Pas encore de compte ? <Link href="/signup">Créer un compte</Link>
          </p>
        </div>
      </div>
    </>
  );
}
