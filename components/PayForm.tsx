// Composant PayForm — Formulaire de paiement avec choix du mode (Stripe / espèces).
// 'use client' : gère l'état du mode de paiement sélectionné et l'état de chargement.
// Appelle les Server Actions createCheckoutSession (Stripe) ou createCashReservation (espèces).
'use client';
import { useState } from 'react';
import { createCheckoutSession, createCashReservation } from '@/app/pay/actions';

export default function PayForm({ defaultEmail }: { defaultEmail: string }) {
  // method : mode de paiement sélectionné ('stripe' ou 'cash')
  const [method, setMethod] = useState('stripe');

  // isLoading : désactive le bouton pendant l'appel à la Server Action (évite la double soumission)
  const [isLoading, setIsLoading] = useState(false);

  // handleSubmit : intercepte la soumission pour appeler la bonne Server Action selon le mode
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Empêche la navigation native du formulaire
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    if (method === 'stripe') {
      // createCheckoutSession : crée une session Stripe et redirige vers la page de paiement hébergée
      await createCheckoutSession(formData);
    } else {
      // createCashReservation : crée une réservation pending et redirige vers la confirmation
      await createCashReservation(formData);
    }
    // Note : si la Server Action redirige (via redirect()), le code suivant n'est pas atteint
  };

  return (
    // display:contents : le <form> ne génère pas de boîte CSS, s'intègre dans la grille parente
    <form onSubmit={handleSubmit} style={{ display: 'contents' }}>

      {/* Section 01 : informations personnelles */}
      <div className="pay__sect">
        <div className="pay__sectH"><b>01</b> · Vos informations</div>
        <div className="pay__row">
          <div className="pay__field">
            <label>Prénom + Nom</label>
            <input name="fullName" defaultValue="" required placeholder="Léa Moreau" />
          </div>
          <div className="pay__field">
            <label>Email</label>
            {/* defaultEmail : pré-rempli si l'utilisateur est connecté (passé depuis PayPage) */}
            <input name="email" type="email" defaultValue={defaultEmail} required />
          </div>
        </div>
      </div>

      {/* Section 02 : sélection du mode de paiement */}
      <div className="pay__sect">
        <div className="pay__sectH"><b>02</b> · Mode de paiement</div>
        <div className="pay__methods">
          {[
            { k: 'stripe', icon: '💳', label: 'Carte (Stripe)' },
            { k: 'cash',   icon: '💵', label: 'Paiement sur place' },
          ].map((m) => (
            // Chaque bouton de mode est de type="button" pour ne pas soumettre le formulaire
            <button
              key={m.k} type="button"
              className={`payMethod ${method === m.k ? 'is-on' : ''}`}
              onClick={() => setMethod(m.k as any)}
            >
              <span className="payMethod__icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Description contextuelle selon le mode sélectionné */}
        {method === 'stripe' && (
          <p style={{ color: 'var(--ink-3)', fontSize: '13px', margin: '16px 0 0' }}>
            Vous serez redirigé vers Stripe pour payer en toute sécurité.
          </p>
        )}
        {method === 'cash' && (
          <p style={{ color: 'var(--ink-3)', fontSize: '13px', margin: '16px 0 0' }}>
            Vous recevrez un code de réservation. Présentez-vous 20 min avant la séance. Après ce délai, les places seront libérées.
          </p>
        )}
      </div>

      {/* Champ caché pour transmettre le mode choisi à la Server Action */}
      <input type="hidden" name="method" value={method} />

      {/* Bouton de confirmation : désactivé pendant le traitement */}
      <button type="submit" className="btn btn--primary recap__btn" id="confirm-btn" disabled={isLoading}>
        {isLoading ? 'Traitement...' : 'Confirmer la réservation →'}
      </button>
    </form>
  );
}
