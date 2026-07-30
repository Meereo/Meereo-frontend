import { runAgent } from "./agent.js";
import { KAI_SYSTEM, QUOREX_ORCHESTRATION, DECISION_MODE } from "./prompts.js";
import { processFactsFromMessage, loadFacts, factsFor } from "../memory/facts.js";
import { getToolsForActor } from "../tools/registry.js";
import { looksLikeRoutine, parseAutomation } from "../automations/parser.js";
import { activate } from "../automations/engine.js";
import { confirmPending, getPending } from "./decision.js";

// Ensemble des userId deja charges
const loadedUsers = new Set();

/**
 * Pipeline QUOREX — 4 etapes :
 * 1. IDENTIFIER (fait par le middleware identify.js)
 * 2. COMPRENDRE (classifier l'intention)
 * 3. CHERCHER (memoire + outils)
 * 4. AGIR (repondre / recommander / demander confirmation)
 */
export async function orchestrate({ userId, userType, actor, message, confirmationId, onToken }) {
  // ── Etape 1 : IDENTIFIER (deja fait par middleware) ──
  // Charger les faits au premier contact
  if (!loadedUsers.has(userId)) {
    await loadFacts(userId);
    loadedUsers.add(userId);
  }

  // ── Gestion des confirmations en attente ──
  if (confirmationId) {
    return confirmPending(confirmationId, message);
  }

  // ── Etape 2 : COMPRENDRE ──
  // Detecter si c'est une demande d'automatisation
  if (looksLikeRoutine(message)) {
    return handleAutomationRequest(message);
  }

  // Detecter si c'est une action engageante (notification, envoi externe)
  const isEngaging = detectEngagingAction(message);

  // ── Etape 3 : CHERCHER ──
  // Extraire les faits du message + construire le contexte memoire
  const { updates, memBlock } = await processFactsFromMessage(userId, message);

  // Construire le system prompt complet
  const tools = getToolsForActor(userType);
  const systemPrompt = buildSystemPrompt(actor, memBlock, isEngaging);

  // ── Etape 4 : AGIR ──
  const { text, ctx } = await runAgent({
    system: systemPrompt,
    userText: message,
    allowSend: !isEngaging, // Si action engageante, on retient l'envoi
    tools,
    onToken,
  });

  const result = {
    reply: text,
    facts_updated: updates,
    actor: { type: userType, label: actor.label },
  };

  // Si des notifications ont ete retenues (action engageante)
  if (ctx.pending.length > 0) {
    const { confirmationId: cid, proposal } = storePending(userId, ctx.pending, text);
    result.needs_confirmation = true;
    result.confirmation_id = cid;
    result.proposal = proposal;
  }

  return result;
}

/* ── Helpers ── */

function buildSystemPrompt(actor, memBlock, isEngaging) {
  let prompt = KAI_SYSTEM;
  prompt += "\n" + QUOREX_ORCHESTRATION;
  prompt += "\n" + actor.systemPromptAdditions;
  if (isEngaging) prompt += "\n" + DECISION_MODE;
  if (memBlock) prompt += memBlock;
  return prompt;
}

function detectEngagingAction(message) {
  const t = message.toLowerCase();
  return /(envoie|envoi|notifie|previens|préviens|contacte|informe|écris|ecris|transmets)/.test(t)
    && /(client|direction|compta|fournisseur|chef de projet|partenaire)/.test(t);
}

async function handleAutomationRequest(instruction) {
  const parsed = await parseAutomation(instruction);
  if (!parsed || !parsed.is_automation) {
    return {
      reply: "Je n'ai pas reussi a interpreter cette instruction comme une routine. Pouvez-vous reformuler ?",
      facts_updated: [],
    };
  }

  const automation = activate(parsed);
  return {
    reply: `J'ai cree l'automatisation "${automation.name}" (${automation.trigger_description}). Elle est active et prete a fonctionner.`,
    facts_updated: [],
    automation,
  };
}

// Stockage des confirmations en attente
let confirmSeq = 0;
const pendingConfirmations = new Map();

function storePending(userId, pending, proposalText) {
  const cid = `confirm_${++confirmSeq}`;
  pendingConfirmations.set(cid, { userId, pending, proposal: proposalText, createdAt: Date.now() });
  // Exposer pour decision.js
  setPendingStore(pendingConfirmations);
  return { confirmationId: cid, proposal: proposalText };
}

// Permettre a decision.js d'acceder au store
let _pendingStore = pendingConfirmations;
function setPendingStore(store) { _pendingStore = store; }
export function getPendingStore() { return _pendingStore; }
