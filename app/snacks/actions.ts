// Server Actions pour la page snacks — étape 4 du tunnel de réservation.
// 'use server' : ces fonctions s'exécutent côté serveur, appelées depuis SnacksForm (Client Component).
'use server';
import { redirect } from 'next/navigation';
import { getDraft, setDraft } from '@/lib/booking';

// saveSnacks : lit les quantités de snacks du formulaire, les enregistre dans le draft cookie,
// puis redirige vers l'étape suivante du tunnel (/pay).
// Le formulaire envoie des champs nommés "q_<snackId>" avec la quantité commandée.
export async function saveSnacks(formData: FormData) {
  const draft = await getDraft();
  if (!draft) redirect('/'); // Draft expiré : retour à l'accueil

  const snacks: Record<string, number> = {};
  for (const [k, v] of formData.entries()) {
    // Filtre les champs qui commencent par "q_" (format : q_<snackId>)
    if (!k.startsWith('q_')) continue;
    const id = k.slice(2); // Extrait l'UUID du snack après le préfixe "q_"
    const n = parseInt(String(v), 10);
    // N'enregistre que les snacks commandés (quantité > 0)
    if (n > 0) snacks[id] = n;
  }

  // Met à jour le draft avec les snacks sélectionnés (conserve screeningId et seats)
  await setDraft({ ...draft, snacks });
  redirect('/pay');
}

// skipSnacks : passe l'étape snacks sans rien commander — enregistre un objet vide dans le draft.
// Appelée par le bouton "Passer" de SnacksForm.
export async function skipSnacks() {
  const draft = await getDraft();
  if (!draft) redirect('/');

  // Réinitialise les snacks à vide et redirige vers le paiement
  await setDraft({ ...draft, snacks: {} });
  redirect('/pay');
}
