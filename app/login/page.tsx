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
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <Header />
      <div className="auth">
        <div className="auth__box">
          <h1 className="auth__h">Mon <em>compte</em></h1>
          <p className="auth__sub">Connectez-vous à Lumière</p>

          {/* Bannière d'erreur : affichée si Supabase Auth retourne une erreur */}
          {sp.error && <div className="auth__err">{sp.error}</div>}

          {/* action={login} : soumet le formulaire via Server Action (pas de fetch client) */}
          <form action={login} className="form">
            {/* Champ caché pour rediriger vers la page d'origine après connexion */}
            <input type="hidden" name="next" value={sp.next || '/'} />
            <div className="form__field">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form__field">
              <label>Mot de passe</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" className="btn btn--primary" style={{ marginTop: 8 }}>Se connecter →</button>
          </form>

          {/* Lien vers la page d'inscription */}
          <p className="auth__alt">
            Pas encore de compte ? <Link href="/signup">Créer un compte</Link>
          </p>
        </div>
      </div>
    </>
  );
}
