import { runAgent } from "../core/agent.js";
import { KAI_SYSTEM } from "../core/prompts.js";
import { getToolsForActor } from "../tools/registry.js";
import { scheduler } from "./scheduler.js";

let SEQ = 0;
const automations = [];
const pendingValidations = new Map();

/* ── Helpers ── */
function describeTrigger(tr) {
  if (tr.type === "schedule") return `Planifie (cron: ${tr.cron})`;
  if (tr.type === "event") return `Evenement: ${tr.event}`;
  if (tr.type === "threshold") return `Seuil: ${tr.metric} ${tr.op} ${tr.value}`;
  return JSON.stringify(tr);
}

function formatAutomation(a) {
  return {
    id: a.id,
    name: a.name,
    trigger: a.trigger,
    trigger_description: describeTrigger(a.trigger),
    condition: a.condition || null,
    action: a.action,
    autonomy: a.autonomy,
    active: a.active,
    lastRun: a.lastRun,
  };
}

/* ── Activation ── */
export function activate(parsed) {
  const a = { id: ++SEQ, ...parsed, active: true, cronJob: null, lastRun: null };
  automations.push(a);
  if (a.trigger.type === "schedule") {
    a.cronJob = scheduler.schedule(a.trigger.cron, () => executeAutomation(a));
  }
  return formatAutomation(a);
}

/* ── Execution ── */
export async function executeAutomation(a) {
  a.lastRun = new Date().toISOString();
  const allowSend = a.autonomy === "auto";

  const instruction = `Execute la routine "${a.name}". Action demandee : ${a.action.instruction}. Destinataire : ${a.action.recipient}. Recupere les donnees reelles via tes outils, ` +
    (allowSend
      ? `puis envoie le resultat avec send_notification.`
      : `puis prepare le message avec send_notification (retenu pour validation humaine).`);

  console.log(`[autopilot] executing #${a.id} "${a.name}"...`);
  const tools = getToolsForActor("client"); // automations use full tool set
  const { text, ctx } = await runAgent({ system: KAI_SYSTEM, userText: instruction, allowSend, tools });

  const result = { automationId: a.id, text, sent: ctx.sent, drafts: [] };

  if (!allowSend && ctx.pending.length) {
    for (const payload of ctx.pending) {
      const vid = ++SEQ;
      pendingValidations.set(vid, { auto: a, payload });
      result.drafts.push({ validationId: vid, ...payload });
    }
  }

  return result;
}

/* ── CRUD ── */
export function listAutomations() {
  return automations.map(formatAutomation);
}

export function getAutomationById(id) {
  const a = automations.find(x => x.id === id);
  return a ? formatAutomation(a) : null;
}

export function getRawAutomation(id) {
  return automations.find(x => x.id === id) || null;
}

export function removeAutomation(id) {
  const idx = automations.findIndex(x => x.id === id);
  if (idx === -1) return false;
  const a = automations[idx];
  scheduler.stop(a.cronJob);
  automations.splice(idx, 1);
  return true;
}

/* ── Validations ── */
export function validateDraft(vid) {
  const v = pendingValidations.get(vid);
  if (!v) return null;
  pendingValidations.delete(vid);
  return { sent: true, recipient: v.payload.recipient, payload: v.payload };
}

export function rejectDraft(vid) {
  return pendingValidations.delete(vid);
}

export function listPendingDrafts() {
  const out = [];
  for (const [vid, v] of pendingValidations) {
    out.push({ validationId: vid, automationId: v.auto.id, ...v.payload });
  }
  return out;
}

/* ── Scheduler control ── */
export function startScheduler() {
  let n = 0;
  for (const a of automations) {
    if (a.cronJob) { scheduler.start(a.cronJob); n++; }
  }
  return n;
}

export function stopScheduler() {
  for (const a of automations) scheduler.stop(a.cronJob);
}
