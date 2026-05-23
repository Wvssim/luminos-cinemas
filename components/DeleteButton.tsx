// Composant DeleteButton — Bouton de suppression avec confirmation native du navigateur.
// 'use client' : intercepte le clic pour afficher window.confirm avant la soumission.
// Utilisé dans les pages dashboard pour supprimer films, séances, salles, etc.
'use client';
export default function DeleteButton({
  action,                                     // Server Action appelée après confirmation
  label = 'Supprimer',                        // Texte du bouton (personnalisable)
  confirm = 'Confirmez la suppression ?',     // Message de la boîte de confirmation native
}: {
  action: (fd: FormData) => void | Promise<void>;
  label?: string;
  confirm?: string;
}) {
  // handleClick : intercepte le clic pour afficher la boîte de confirmation.
  // Si l'utilisateur annule, e.preventDefault() empêche la soumission du formulaire.
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(confirm)) e.preventDefault();
  };

  return (
    // Formulaire inline : permet à la Server Action de recevoir le FormData
    // display:inline pour s'intégrer dans des layouts flex sans casser la mise en page
    <form action={action} style={{ display: 'inline' }}>
      <button
        type="submit"
        className="btn btn--danger"
        style={{ padding: '6px 10px', fontSize: 11 }}
        onClick={handleClick}
      >
        {label}
      </button>
    </form>
  );
}
