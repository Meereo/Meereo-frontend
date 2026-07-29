// kai.js — KAI, copilote autopilote de MEEREO Cockpit
// Modèle local (Ollama) + mémoire Quorex (faits structurés) + moteur d'automatisations.
//
//   node kai.js                          (modèle par défaut)
//   $env:KAI_MODEL="qwen2.5:7b"; node kai.js   (recommandé pour la démo)
//
// Commandes : /list /run <id> /validate <id> /reject <id> /start /mem /facts /test /user <id> /help /quit

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Ollama } from "ollama";
import cron from "node-cron";
import { Quorex } from "@quorex/sdk";

try { process.loadEnvFile(); } catch { /* noop */ }

/* ════════════ MODÈLE LOCAL ════════════ */
const MODEL = process.env.KAI_MODEL || "qwen2.5:3b";
const ai = new Ollama({ host: process.env.KAI_HOST || "http://localhost:11434" });

/* ════════════ MÉMOIRE (Quorex) ════════════ */
class QuorexMemory {
  constructor() {
    this.qx = new Quorex({ apiKey: process.env.QUOREX_API_KEY });
  }
  async remember(userId, text, opts) {
    try { return await this.qx.remember(userId, text, opts); }
    catch (e) { console.warn("⚠️  remember:", e.message); return null; }
  }
  async forget(userId, vecId) {
    try { return await this.qx.forget(userId, vecId); }
    catch (e) { console.warn("⚠️  forget:", e.message); return null; }
  }
  async recall(userId, query) {
    try { return await this.qx.recall(userId, query); }
    catch (e) { console.warn("⚠️  recall:", e.message); return []; }
  }
  async export(userId) {
    try { return await this.qx.export(userId); }
    catch (e) { return null; }
  }
  async stats() {
    try { return await this.qx.stats(); }
    catch (e) { console.warn("⚠️  stats:", e.message); return null; }
  }
}
const memory = new QuorexMemory();

/* ════════════ FAITS STRUCTURÉS (le cœur de la démo) ════════════ */
// userId -> Map(key -> { value, vecId })
const userFacts = new Map();
const factsFor = (uid) => {
  if (!userFacts.has(uid)) userFacts.set(uid, new Map());
  return userFacts.get(uid);
};

function normalizeKey(k) {
  return String(k).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// Valeurs "vides"/placeholder que le modèle invente parfois sur une question — à ne JAMAIS mémoriser.
const JUNK_VALUES = new Set([
  "", "non précisé", "non precise", "non spécifié", "non specifie", "inconnu", "inconnue",
  "n/a", "na", "?", "aucun", "non renseigné", "non renseigne", "non disponible",
  "unknown", "null", "undefined", "rien", "à préciser", "a preciser",
]);
function isJunkValue(v) {
  const s = String(v).trim().toLowerCase();
  return s.length === 0 || JUNK_VALUES.has(s);
}

const EXTRACT_SYSTEM = `Tu es un extracteur de mémoire. À partir du message de l'utilisateur, tu réponds UNIQUEMENT en JSON valide, sans texte autour :
{"facts":[{"key":"...","value":"..."}],"query_key":"..."|null}

- "facts" : les faits DURABLES que l'utilisateur affirme sur lui-même (préférences, identité, choix, configuration). "key" = identifiant court en snake_case sans accents. "value" = la valeur. Si aucun fait affirmé : [].
- Une CORRECTION ("non", "en fait", "finalement", "je me suis trompé", "plutôt", "désormais") exprime une NOUVELLE valeur : extrais le fait avec la valeur corrigée, en réutilisant la MÊME key que le sujet concerné.
- "query_key" : si l'utilisateur POSE une question sur un de ses faits, mets la key. Sinon null.
- N'extrais JAMAIS de fait depuis une question. Si l'utilisateur DEMANDE une info, mets uniquement "query_key", et "facts":[].
- N'invente JAMAIS de valeur. Si la valeur n'est pas explicitement donnée dans le message, n'extrais pas le fait (jamais "non précisé", "inconnu", etc.).
- Ignore les données métier (chantiers, factures, budgets).

Exemples :
"j'aime le bleu" -> {"facts":[{"key":"couleur_preferee","value":"bleu"}],"query_key":null}
"non je me suis trompé j'aime le rouge" -> {"facts":[{"key":"couleur_preferee","value":"rouge"}],"query_key":null}
"en fait c'est plutôt Dagdapay pour les paiements" -> {"facts":[{"key":"moyen_paiement","value":"Dagdapay"}],"query_key":null}
"finalement je code en Vue" -> {"facts":[{"key":"framework_prefere","value":"Vue"}],"query_key":null}
"je m'appelle Clément" -> {"facts":[{"key":"prenom","value":"Clément"}],"query_key":null}
"c'est quoi ma couleur préférée ?" -> {"facts":[],"query_key":"couleur_preferee"}
"c'est quoi notre moyen de paiement ?" -> {"facts":[],"query_key":"moyen_paiement"}
"Quels chantiers sont en retard ?" -> {"facts":[],"query_key":null}`;

async function extractMemory(text, knownKeys = []) {
  const knownLine = knownKeys.length
    ? `Clés déjà connues (réutilise-les si le message les concerne) : ${knownKeys.join(", ")}.\n`
    : "";
  try {
    const resp = await ai.chat({
      model: MODEL, stream: false, format: "json", options: { temperature: 0 },
      messages: [
        { role: "system", content: EXTRACT_SYSTEM },
        { role: "user", content: knownLine + "Message : " + text },
      ],
    });
    const obj = JSON.parse((resp.message?.content || "{}").trim());
    return { facts: Array.isArray(obj.facts) ? obj.facts : [], query_key: obj.query_key || null };
  } catch { return { facts: [], query_key: null }; }
}

// Met à jour un fait dans Quorex : si la valeur change, on OUBLIE l'ancien et on stocke le nouveau.
async function upsertFact(uid, key, value) {
  const fm = factsFor(uid);
  const existing = fm.get(key);
  if (existing && existing.value === value) return;            // inchangé
  if (existing && existing.vecId != null) {
    await memory.forget(uid, existing.vecId);                  // le fait obsolète disparaît de Quorex
  }
  const res = await memory.remember(uid, `${key}: ${value}`, { action: key, metadata: { key, value } });
  const vecId = res?.vecId ?? null;
  fm.set(key, { value, vecId });
  console.log(`   🧠 [mémoire] ${existing ? `mis à jour (${existing.value} → ${value})` : "appris"} : ${key} = ${value}`);
}

// Au démarrage / changement d'utilisateur : recharge les faits depuis Quorex (persistance).
async function loadFacts(uid) {
  const ex = await memory.export(uid);
  if (!ex || !Array.isArray(ex.memories)) return;
  const fm = factsFor(uid);
  fm.clear();
  for (const m of ex.memories) {
    const meta = m.meta || {};
    const inner = meta.metadata || meta;
    const key = inner.key, value = inner.value;
    if (key && value && !isJunkValue(value)) fm.set(normalizeKey(key), { value, vecId: m.vecId ?? null });
  }
  if (fm.size) console.log(`   🧠 ${fm.size} fait(s) rechargé(s) depuis Quorex pour ${uid}.`);
}

/* ════════════ DONNÉES SIMULÉES (métier) ════════════ */
const DATA = {
  projects: [
    { nom: "Résidence les Palmiers",  ville: "Abidjan",    avance: 62, retard: 4,  budget: 78 },
    { nom: "Résidence Bellevue",      ville: "Lyon",       avance: 45, retard: 10, budget: 60 },
    { nom: "Immeuble Azur",           ville: "Casablanca", avance: 73, retard: 2,  budget: 85 },
    { nom: "Résidence des Jardins",   ville: "Toulouse",   avance: 58, retard: 6,  budget: 70 },
    { nom: "Tour Horizon",            ville: "Montréal",   avance: 80, retard: 1,  budget: 90 },
  ],
  factures: [
    { fournisseur: "BétonPlus",         montant: "4,3 M FCFA", ecart_bdc: "+6%" },
    { fournisseur: "CimentPro",         montant: "5,1 M FCFA", ecart_bdc: "+3%" },
    { fournisseur: "Granulats Express", montant: "3,8 M FCFA", ecart_bdc: "-2%" },
    { fournisseur: "BTP Matériaux",     montant: "6,2 M FCFA", ecart_bdc: "+8%" },
    { fournisseur: "AfricBéton",        montant: "4,0 M FCFA", ecart_bdc: "+1%" },
  ],
  incidents: 2,
};

/* ════════════ OUTILS ════════════ */
const TOOLS = [
  { type: "function", function: { name: "get_delays",
    description: "Liste les chantiers en retard et le nombre de jours de retard.",
    parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "get_budget_status",
    description: "Budget consommé par chantier, avec drapeau si au-dessus d'un seuil.",
    parameters: { type: "object", properties: { threshold: { type: "number" } } } } },
  { type: "function", function: { name: "get_pending_invoices",
    description: "Factures fournisseurs en attente, avec écart vs bon de commande.",
    parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "generate_report",
    description: "Synthèse globale du portefeuille de chantiers.",
    parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "send_notification",
    description: "Envoie une notification/message à un destinataire. Action engageante.",
    parameters: { type: "object", required: ["recipient", "body"], properties: {
      recipient: { type: "string", description: "vous | direction | compta | client | chef de projet" },
      subject: { type: "string" }, body: { type: "string" },
    } } } },
];

async function dispatch(name, args, ctx) {
  switch (name) {
    case "get_delays":
      return DATA.projects.filter((p) => p.retard > 0).map((p) => ({ nom: p.nom, retard_jours: p.retard, avance: p.avance }));
    case "get_budget_status": {
      const t = args.threshold ?? 80;
      return DATA.projects.map((p) => ({ nom: p.nom, budget: p.budget, au_dessus_seuil: p.budget >= t }));
    }
    case "get_pending_invoices":
      return DATA.factures;
    case "generate_report":
      return {
        chantiers: DATA.projects.length,
        avancement_moyen: Math.round(DATA.projects.reduce((s, p) => s + p.avance, 0) / DATA.projects.length),
        en_retard: DATA.projects.filter((p) => p.retard > 0).length,
        factures_en_attente: DATA.factures.length, incidents: DATA.incidents,
      };
    case "send_notification":
      if (!ctx.allowSend) { ctx.pending.push(args); return { staged: true, note: "Validation requise — non envoyé." }; }
      ctx.sent.push(args); return { sent: true, recipient: args.recipient };
    default:
      return { error: `outil inconnu: ${name}` };
  }
}

/* ════════════ BOUCLE AGENT ════════════ */
async function runAgent({ system, userText, allowSend }) {
  const ctx = { allowSend, pending: [], sent: [] };
  const messages = [{ role: "system", content: system }, { role: "user", content: userText }];
  for (let step = 0; step < 6; step++) {
    const resp = await ai.chat({ model: MODEL, messages, tools: TOOLS, stream: false, options: { temperature: 0.3 } });
    if (!resp?.message) throw new Error(`Réponse Ollama inattendue pour "${MODEL}". Vérifie \`ollama list\`.`);
    const msg = resp.message;
    messages.push(msg);
    if (msg.tool_calls?.length) {
      for (const tc of msg.tool_calls) {
        const result = await dispatch(tc.function.name, tc.function.arguments || {}, ctx);
        messages.push({ role: "tool", tool_name: tc.function.name, content: JSON.stringify(result) });
      }
      continue;
    }
    return { text: msg.content || "", ctx };
  }
  return { text: "(trop d'allers-retours d'outils — interrompu)", ctx };
}

const KAI_SYSTEM = `Tu es KAI, le copilote IA de MEEREO Cockpit, un ERP de gestion immobilière et BTP en Afrique.
Réponds en français, ton professionnel, concis. Pour toute donnée chiffrée (retards, budgets, factures),
APPELLE l'outil correspondant — ne devine jamais. N'envoie une notification que si on te le demande explicitement.
Quand des "Faits connus sur l'utilisateur" te sont fournis, ils font autorité : utilise-les pour répondre.`;

/* ════════════ MOTEUR D'AUTOMATISATIONS ════════════ */
let SEQ = 0;
const automations = [];
const pendingValidations = new Map();

const PARSE_SYSTEM = `Tu convertis une instruction utilisateur en automatisation pour un ERP BTP.
Réponds UNIQUEMENT en JSON valide, sans texte autour, selon ce schéma :
{
 "is_automation": true|false,
 "name": "titre court",
 "trigger": { "type": "schedule"|"event"|"threshold",
   "cron": "m h * * j", "event": "facture_recue"|"retard_detecte"|"incident",
   "metric": "budget", "op": ">=", "value": 80 },
 "condition": "texte ou null",
 "action": { "capability": "resume"|"rapport"|"alerte"|"controle_facture",
             "recipient": "vous"|"direction"|"compta"|"client"|"chef de projet",
             "instruction": "phrase d'action complète" },
 "autonomy": "auto"|"validation"
}
Règle d'autonomie : si l'action vise le client, ou implique paiement / bon de commande / contrat / publication
externe -> "validation". Sinon -> "auto".
Si l'instruction n'est PAS une routine récurrente/déclenchée, renvoie {"is_automation": false}.`;

async function parseAutomation(nl) {
  try {
    const resp = await ai.chat({
      model: MODEL, stream: false, format: "json", options: { temperature: 0 },
      messages: [{ role: "system", content: PARSE_SYSTEM }, { role: "user", content: nl }],
    });
    const obj = JSON.parse((resp.message?.content || "").trim());
    if (obj && obj.is_automation) return obj;
    if (obj && obj.is_automation === false) return heuristicParse(nl);
  } catch { /* repli */ }
  return heuristicParse(nl);
}

function looksLikeRoutine(nl) {
  const t = nl.toLowerCase().trim();
  return /(chaque|tous les|toutes les|chaque fois|à\s*\d{1,2}\s*h|dès que|des que|lorsque|automatiquement|planifie|programme|rappelle-moi|préviens-moi|previens-moi|en cas de|à réception|quand .*(reçoit|recoit|dépasse|depasse|atteint|détect|detect))/.test(t);
}

function heuristicParse(nl) {
  const t = nl.toLowerCase();
  const looksAuto = /(chaque|tous les|toutes les|quand|lorsque|dès que|des que|si )/.test(t)
    && /(résume|resume|rapport|alerte|prévien|previen|envoie|prépare|prepare|contrôle|controle|signale|vérifie|verifie)/.test(t);
  if (!looksAuto) return null;
  const heure = t.match(/(\d{1,2})\s*h(\d{2})?/);
  const jours = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 0 };
  const jour = Object.keys(jours).find((d) => t.includes(d));
  const h = heure ? +heure[1] : 7, m = heure && heure[2] ? +heure[2] : 0;
  let trigger, name;
  if (/budget/.test(t) && /(dépasse|depasse|supérieur|superieur|>|atteint)/.test(t)) {
    const pc = t.match(/(\d{1,3})\s*%/);
    trigger = { type: "threshold", metric: "budget", op: ">=", value: pc ? +pc[1] : 80 };
    name = `Seuil budget ${trigger.value}%`;
  } else if (/facture/.test(t)) { trigger = { type: "event", event: "facture_recue" }; name = "À réception de facture"; }
  else if (/incident/.test(t)) { trigger = { type: "event", event: "incident" }; name = "À chaque incident"; }
  else { const dow = jour ? jours[jour] : "*"; trigger = { type: "schedule", cron: `${m} ${h} * * ${dow}` }; name = jour ? `Chaque ${jour} ${h}h` : `Chaque jour ${h}h`; }
  let capability = "resume";
  if (/rapport/.test(t)) capability = "rapport";
  else if (/facture/.test(t) && /(contrôle|controle|vérifie|verifie)/.test(t)) capability = "controle_facture";
  else if (/alerte|prévien|previen|signale/.test(t)) capability = "alerte";
  const recipient = /\bmoi\b|envoie-moi|résume-moi|resume-moi/.test(t) ? "vous"
    : /direction|patron/.test(t) ? "direction" : /compta|finance/.test(t) ? "compta"
    : /client/.test(t) ? "client" : /chef de projet/.test(t) ? "chef de projet" : "vous";
  const autonomy = (recipient === "client" || /devis|paiement|bon de commande|contrat|publie/.test(t)) ? "validation" : "auto";
  return { is_automation: true, name, trigger, condition: /en retard/.test(t) ? "Chantiers en retard" : null,
    action: { capability, recipient, instruction: nl }, autonomy };
}

function describeTrigger(tr) {
  if (tr.type === "schedule") return `Planifié (cron: ${tr.cron})`;
  if (tr.type === "event") return `Événement: ${tr.event}`;
  if (tr.type === "threshold") return `Seuil: ${tr.metric} ${tr.op} ${tr.value}`;
  return JSON.stringify(tr);
}
function printAutomation(a) {
  const badge = a.autonomy === "auto" ? "[AUTO]" : "[VALIDATION REQUISE]";
  console.log(`\n  #${a.id}  ${a.name}  ${badge}`);
  console.log(`     QUAND  ▸ ${describeTrigger(a.trigger)}`);
  console.log(`     SI     ▸ ${a.condition || "—"}`);
  console.log(`     ALORS  ▸ [${a.action.capability}] → ${a.action.recipient} : ${a.action.instruction}`);
  console.log(`     état   ▸ ${a.active ? "actif" : "inactif"}${a.lastRun ? ` · dernière exéc. ${a.lastRun}` : ""}`);
}
function activate(parsed) {
  const a = { id: ++SEQ, ...parsed, active: true, cronJob: null, lastRun: null };
  automations.push(a);
  if (a.trigger.type === "schedule" && cron.validate(a.trigger.cron))
    a.cronJob = cron.schedule(a.trigger.cron, () => executeAutomation(a), { scheduled: false });
  return a;
}
async function executeAutomation(a) {
  a.lastRun = new Date().toLocaleString("fr-FR");
  const allowSend = a.autonomy === "auto";
  const instruction = `Exécute la routine "${a.name}". Action demandée : ${a.action.instruction}. Destinataire : ${a.action.recipient}. Récupère les données réelles via tes outils, ` +
    (allowSend ? `puis envoie le résultat avec send_notification.` : `puis prépare le message avec send_notification (retenu pour validation humaine, ne pars pas en direct).`);
  console.log(`\n⚙️  [AUTOPILOTE] exécution de #${a.id} "${a.name}"…`);
  const { text, ctx } = await runAgent({ system: KAI_SYSTEM, userText: instruction, allowSend });
  if (allowSend) {
    console.log(`✓ exécuté. ${ctx.sent.length ? `Envoyé à : ${ctx.sent.map((s) => s.recipient).join(", ")}.` : ""}`);
    if (text) console.log(`   ${text}`);
  } else if (ctx.pending.length) {
    for (const payload of ctx.pending) {
      const vid = ++SEQ;
      pendingValidations.set(vid, { auto: a, payload });
      console.log(`⏸️  brouillon #${vid} prêt — validation requise.`);
      console.log(`     → ${payload.recipient} | ${payload.subject || "(sans objet)"}`);
      console.log(`     ${payload.body}`);
      console.log(`     Tape  /validate ${vid}  pour envoyer, ou  /reject ${vid}.`);
    }
  } else console.log(`✓ terminé.${text ? ` ${text}` : ""}`);
}

/* ════════════ CHAT (avec faits Quorex) ════════════ */
let USER = "user_demo";

async function chat(userText) {
  const fm = factsFor(USER);

  // 1) Extraire faits + éventuelle question sur un fait (en réutilisant les clés connues)
  const mem = await extractMemory(userText, [...fm.keys()]);

  // 2) Mémoriser/mettre à jour les faits — en ignorant les questions et les valeurs vides
  const qk = mem.query_key ? normalizeKey(mem.query_key) : null;
  for (const f of mem.facts || []) {
    if (!f || !f.key || !f.value) continue;
    const k = normalizeKey(f.key);
    if (k === qk) continue;              // c'est une question sur ce fait, pas une affirmation
    if (isJunkValue(f.value)) continue;  // valeur placeholder → ne jamais écraser un vrai fait
    await upsertFact(USER, k, String(f.value).trim());
  }

  // 3) Injecter les faits connus (source de vérité)
  const known = [...fm.entries()].map(([k, v]) => `${k} = ${v.value}`);
  let memBlock = known.length
    ? `\n\nFaits connus sur cet utilisateur (font autorité) :\n- ${known.join("\n- ")}`
    : "";
  if (mem.query_key) {
    const k = normalizeKey(mem.query_key);
    if (fm.has(k)) memBlock += `\n\nL'utilisateur demande "${k}". Réponds directement avec : ${fm.get(k).value}.`;
    else memBlock += `\n\nL'utilisateur demande "${k}" mais ce fait est inconnu. Dis-le franchement.`;
  }

  const { text } = await runAgent({ system: KAI_SYSTEM + memBlock, userText, allowSend: true });
  return text;
}

/* ════════════ CLI ════════════ */
const rl = readline.createInterface({ input, output });

function help() {
  console.log(`
Commandes :
  (texte libre)        parler à KAI, ou dicter une routine
  /list                lister les automatisations
  /run <id>            exécuter une automatisation maintenant
  /validate <id>       envoyer un brouillon en attente
  /reject <id>         rejeter un brouillon en attente
  /start               démarrer le scheduler (cron)
  /facts               afficher les faits mémorisés (Quorex)
  /mem                 stats de la mémoire Quorex
  /test                test rapide de la mémoire
  /user <id>           changer d'utilisateur courant
  /help                aide
  /quit                quitter`);
}

async function main() {
  console.log(`\n╔═══════════════════════════════════════════════╗`);
  console.log(`║  KAI — copilote autopilote · MEEREO Cockpit     ║`);
  console.log(`╚═══════════════════════════════════════════════╝`);
  console.log(`Modèle local : ${MODEL}  ·  utilisateur : ${USER}`);
  if (!process.env.QUOREX_API_KEY) console.log(`⚠️  QUOREX_API_KEY absent — mémoire désactivée.`);
  await loadFacts(USER);
  help();

  while (true) {
    const line = (await rl.question("\nkai> ")).trim();
    if (!line) continue;

    if (line.startsWith("/")) {
      const [cmd, arg] = line.slice(1).split(/\s+/);
      if (cmd === "quit") break;
      else if (cmd === "help") help();
      else if (cmd === "list") { automations.length ? automations.forEach(printAutomation) : console.log("Aucune automatisation."); }
      else if (cmd === "run") { const a = automations.find((x) => x.id === +arg); a ? await executeAutomation(a) : console.log("Id inconnu."); }
      else if (cmd === "validate") {
        const v = pendingValidations.get(+arg);
        if (v) { console.log(`✓ envoyé à ${v.payload.recipient}.`); pendingValidations.delete(+arg); } else console.log("Brouillon inconnu.");
      }
      else if (cmd === "reject") { console.log(pendingValidations.delete(+arg) ? "Brouillon rejeté." : "Brouillon inconnu."); }
      else if (cmd === "start") { let n = 0; for (const a of automations) if (a.cronJob) { a.cronJob.start(); n++; } console.log(`Scheduler démarré · ${n} tâche(s) active(s).`); }
      else if (cmd === "facts") {
        const fm = factsFor(USER);
        if (!fm.size) console.log("Aucun fait mémorisé.");
        else for (const [k, v] of fm) console.log(`  ${k} = ${v.value}`);
      }
      else if (cmd === "mem") { console.log("Stats mémoire :", (await memory.stats()) ?? "(indisponible)"); }
      else if (cmd === "test") {
        console.log("remember:", await memory.remember(USER, "test memoire"));
        console.log("recall:  ", await memory.recall(USER, "test"));
        console.log("stats:   ", await memory.stats());
      }
      else if (cmd === "user") { USER = arg || USER; console.log(`Utilisateur courant : ${USER}`); await loadFacts(USER); }
      else console.log("Commande inconnue. /help");
      continue;
    }

    try {
      const parsed = looksLikeRoutine(line) ? await parseAutomation(line) : null;
      if (parsed && parsed.is_automation) {
        console.log("\nJ'ai compris une routine :");
        printAutomation({ id: "?", ...parsed, active: false });
        console.log(`   ${parsed.autonomy === "validation" ? "→ destinataire externe : validation requise avant envoi." : "→ action interne : exécutable en automatique."}`);
        const ok = (await rl.question("Activer ce programme ? [o/N] ")).trim().toLowerCase();
        if (ok === "o" || ok === "oui") { const a = activate(parsed); console.log(`✓ #${a.id} activé. Teste avec /run ${a.id} ou /start.`); }
        else console.log("Annulé.");
      } else {
        console.log(`\nKAI : ${await chat(line)}`);
      }
    } catch (e) {
      console.log(`\n⚠️  Erreur : ${e.message}`);
      console.log(`   Vérifie qu'Ollama tourne (\`ollama list\` / \`ollama pull ${MODEL}\`).`);
    }
  }

  rl.close();
  for (const a of automations) a.cronJob?.stop();
  console.log("À bientôt.");
}

main();