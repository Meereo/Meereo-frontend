import { Ollama } from "ollama";
import { KAI_MODEL, KAI_HOST } from "../config.js";
import { PARSE_SYSTEM } from "../core/prompts.js";

const ai = new Ollama({ host: KAI_HOST });

export function looksLikeRoutine(nl) {
  const t = nl.toLowerCase().trim();
  return /(chaque|tous les|toutes les|chaque fois|à\s*\d{1,2}\s*h|dès que|des que|lorsque|automatiquement|planifie|programme|rappelle-moi|préviens-moi|previens-moi|en cas de|à réception|quand .*(reçoit|recoit|dépasse|depasse|atteint|détect|detect))/.test(t);
}

export async function parseAutomation(nl) {
  try {
    const resp = await ai.chat({
      model: KAI_MODEL, stream: false, format: "json", options: { temperature: 0 },
      messages: [{ role: "system", content: PARSE_SYSTEM }, { role: "user", content: nl }],
    });
    const obj = JSON.parse((resp.message?.content || "").trim());
    if (obj && obj.is_automation) return obj;
    if (obj && obj.is_automation === false) return heuristicParse(nl);
  } catch { /* fallback */ }
  return heuristicParse(nl);
}

function heuristicParse(nl) {
  const t = nl.toLowerCase();
  const looksAuto = /(chaque|tous les|toutes les|quand|lorsque|dès que|des que|si )/.test(t)
    && /(résume|resume|rapport|alerte|prévien|previen|envoie|prépare|prepare|contrôle|controle|signale|vérifie|verifie)/.test(t);
  if (!looksAuto) return null;

  const heure = t.match(/(\d{1,2})\s*h(\d{2})?/);
  const jours = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 0 };
  const jour = Object.keys(jours).find(d => t.includes(d));
  const h = heure ? +heure[1] : 7, m = heure && heure[2] ? +heure[2] : 0;

  let trigger, name;
  if (/budget/.test(t) && /(dépasse|depasse|supérieur|superieur|>|atteint)/.test(t)) {
    const pc = t.match(/(\d{1,3})\s*%/);
    trigger = { type: "threshold", metric: "budget", op: ">=", value: pc ? +pc[1] : 80 };
    name = `Seuil budget ${trigger.value}%`;
  } else if (/facture/.test(t)) {
    trigger = { type: "event", event: "facture_recue" };
    name = "A reception de facture";
  } else if (/incident/.test(t)) {
    trigger = { type: "event", event: "incident" };
    name = "A chaque incident";
  } else {
    const dow = jour ? jours[jour] : "*";
    trigger = { type: "schedule", cron: `${m} ${h} * * ${dow}` };
    name = jour ? `Chaque ${jour} ${h}h` : `Chaque jour ${h}h`;
  }

  let capability = "resume";
  if (/rapport/.test(t)) capability = "rapport";
  else if (/facture/.test(t) && /(contrôle|controle|vérifie|verifie)/.test(t)) capability = "controle_facture";
  else if (/alerte|prévien|previen|signale/.test(t)) capability = "alerte";

  const recipient = /\bmoi\b|envoie-moi|résume-moi|resume-moi/.test(t) ? "vous"
    : /direction|patron/.test(t) ? "direction"
    : /compta|finance/.test(t) ? "compta"
    : /client/.test(t) ? "client"
    : /chef de projet/.test(t) ? "chef de projet"
    : "vous";

  const autonomy = (recipient === "client" || /devis|paiement|bon de commande|contrat|publie/.test(t))
    ? "validation" : "auto";

  return {
    is_automation: true, name, trigger,
    condition: /en retard/.test(t) ? "Chantiers en retard" : null,
    action: { capability, recipient, instruction: nl },
    autonomy,
  };
}
