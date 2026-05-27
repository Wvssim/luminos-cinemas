// Page /signup — Formulaire de création de compte utilisateur.
// Server Component : affiche le formulaire d'inscription avec gestion des erreurs.
// La soumission est gérée par la Server Action `signup` (app/auth/actions.ts).
// À la création, un trigger Supabase handle_new_user() crée automatiquement un profil.
import Link from 'next/link';
import Header from '@/components/Header';
import { signup } from '@/app/auth/actions';

export default async function SignupPage({
  searchParams,
}: {
  // error : message d'erreur Supabase Auth (ex: "User already registered")
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <Header />
      <div className="auth">
        <div className="auth__box">
          <h1 className="auth__h">Rejoindre <em>Lumière</em></h1>
          <p className="auth__sub">Créer un compte</p>

          {/* Bannière d'erreur Supabase Auth */}
          {sp.error && <div className="auth__err">{sp.error}</div>}

          {/* Info : explication du processus de vérification email */}
          <div className="auth__info">
            <span className="auth__info-icon">✉️</span>
            <div>
              <strong>Vérification par email requise</strong>
              <p>Après inscription, un lien de confirmation vous sera envoyé. Vous devrez cliquer dessus avant de pouvoir vous connecter.</p>
            </div>
          </div>

          <form action={signup} className="form">
            <div className="form__field">
              <label>Nom complet</label>
              <input name="fullName" required placeholder="Prénom Nom" autoComplete="name" />
            </div>
            <div className="form__field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="exemple@domaine.com"
                autoComplete="email"
              />
              <span className="form__hint">Format valide requis — ex : wassim@gmail.com</span>
            </div>
            <div className="form__field">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <span className="form__hint">6 caractères minimum</span>
            </div>
            <button type="submit" className="btn btn--primary" style={{ marginTop: 8 }}>Créer mon compte →</button>
          </form>

          <p className="auth__alt">
            Déjà inscrit ? <Link href="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </>
  );
}
