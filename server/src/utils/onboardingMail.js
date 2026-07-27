// ─── mail/dev-logger — Onboarding v2 ────────────────────────────────────────
//
// TODO: brancher un service d'e-mail réel avant production — INS-09 non
//       fermé, prévoir SPF/DKIM.
//
// En l'état : log en console. Un échec d'envoi n'annule JAMAIS la création
// du compte (appelé en fire-and-forget depuis le routeur).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Envoie (simule) un email de bienvenue après l'onboarding.
 * @param {{ to: string, name: string, role: string }} opts
 * @returns {Promise<{ success: boolean, dev: boolean }>}
 */
async function sendOnboardingWelcome({ to, name, role }) {
  // TODO: brancher un service d'e-mail réel avant production — INS-09 non
  //       fermé, prévoir SPF/DKIM.
  console.log(
    `[ONBOARDING-MAIL] 📧 Bienvenue → ${to} (${name}, rôle: ${role})\n` +
    `  Sujet : Bienvenue sur MEEREO !\n` +
    `  Corps : Votre compte ${role} a été créé avec succès.\n` +
    `  ⚠️  Mode dev — aucun email réellement envoyé.`
  )
  return { success: true, dev: true }
}

module.exports = { sendOnboardingWelcome }
