import { clientActor } from "./client.js";
import { architectActor, enterpriseActor, betActor } from "./professional.js";
import { supplierActor } from "./supplier.js";

const ACTORS = {
  client: clientActor,
  architect: architectActor,
  enterprise: enterpriseActor,
  bet: betActor,
  supplier: supplierActor,
};

/**
 * Resout la configuration d'acteur a partir du type utilisateur.
 * Retourne le client par defaut si le type est inconnu.
 */
export function resolveActor(userType) {
  return ACTORS[userType] || ACTORS.client;
}
