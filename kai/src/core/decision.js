import { getPendingStore } from "./quorex-engine.js";

/**
 * Mode decisionnel — etapes 7-8 :
 * Gere la confirmation et l'execution d'actions engageantes.
 *
 * Le flux complet :
 * 1-6 sont geres dans quorex-engine.orchestrate()
 * 7. La reponse initiale inclut needs_confirmation + confirmation_id
 * 8. L'utilisateur renvoie le confirmationId → on execute ici
 */

/**
 * Confirmer une action en attente.
 * @param {string} confirmationId
 * @param {string} userMessage - message optionnel de l'utilisateur ("oui", "non", etc.)
 */
export function confirmPending(confirmationId, userMessage) {
  const store = getPendingStore();
  const entry = store.get(confirmationId);

  if (!entry) {
    return {
      reply: "Cette confirmation n'existe plus ou a deja ete traitee.",
      facts_updated: [],
    };
  }

  const msg = (userMessage || "").toLowerCase().trim();
  const isRejection = /^(non|no|annule|cancel|refuse|rejete)/.test(msg);

  if (isRejection) {
    store.delete(confirmationId);
    return {
      reply: "Action annulee. Rien n'a ete envoye.",
      facts_updated: [],
    };
  }

  // Executer les actions en attente
  const results = entry.pending.map(p => ({
    sent: true,
    recipient: p.recipient,
    subject: p.subject || null,
  }));

  store.delete(confirmationId);

  return {
    reply: `Action executee. ${results.length} notification(s) envoyee(s) : ${results.map(r => r.recipient).join(", ")}.`,
    facts_updated: [],
    executed: results,
  };
}

/**
 * Recuperer les confirmations en attente pour un utilisateur.
 */
export function getPending(userId) {
  const store = getPendingStore();
  const out = [];
  for (const [cid, entry] of store) {
    if (entry.userId === userId) {
      out.push({
        confirmation_id: cid,
        proposal: entry.proposal,
        pending_count: entry.pending.length,
        created_at: new Date(entry.createdAt).toISOString(),
      });
    }
  }
  return out;
}
