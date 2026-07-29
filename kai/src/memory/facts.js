import { Ollama } from "ollama";
import { KAI_MODEL, KAI_HOST } from "../config.js";
import { memory } from "./quorex-memory.js";
import { EXTRACT_SYSTEM } from "../core/prompts.js";

const ai = new Ollama({ host: KAI_HOST });

/* ── Storage local (userId → Map(key → { value, vecId })) ── */
const userFacts = new Map();

export function factsFor(uid) {
  if (!userFacts.has(uid)) userFacts.set(uid, new Map());
  return userFacts.get(uid);
}

export function normalizeKey(k) {
  return String(k).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const JUNK_VALUES = new Set([
  "", "non precise", "non specifie", "inconnu", "inconnue",
  "n/a", "na", "?", "aucun", "non renseigne", "non disponible",
  "unknown", "null", "undefined", "rien", "a preciser",
  "non précisé", "non spécifié", "non renseigné", "à préciser",
]);

export function isJunkValue(v) {
  const s = String(v).trim().toLowerCase();
  return s.length === 0 || JUNK_VALUES.has(s);
}

/* ── Extraction via LLM ── */
export async function extractMemory(text, knownKeys = []) {
  const knownLine = knownKeys.length
    ? `Cles deja connues (reutilise-les si le message les concerne) : ${knownKeys.join(", ")}.\n`
    : "";
  try {
    const resp = await ai.chat({
      model: KAI_MODEL, stream: false, format: "json", options: { temperature: 0 },
      messages: [
        { role: "system", content: EXTRACT_SYSTEM },
        { role: "user", content: knownLine + "Message : " + text },
      ],
    });
    const obj = JSON.parse((resp.message?.content || "{}").trim());
    return { facts: Array.isArray(obj.facts) ? obj.facts : [], query_key: obj.query_key || null };
  } catch { return { facts: [], query_key: null }; }
}

/* ── Upsert : met a jour un fait dans Quorex ── */
export async function upsertFact(uid, key, value) {
  const fm = factsFor(uid);
  const existing = fm.get(key);
  if (existing && existing.value === value) return null;

  if (existing && existing.vecId != null) {
    await memory.forget(uid, existing.vecId);
  }

  const res = await memory.remember(uid, `${key}: ${value}`, { action: key, metadata: { key, value } });
  const vecId = res?.vecId ?? null;
  fm.set(key, { value, vecId });

  const action = existing ? "updated" : "learned";
  console.log(`  [memory] ${action}: ${key} = ${value}`);
  return { key, value, action };
}

/* ── Chargement initial depuis Quorex ── */
export async function loadFacts(uid) {
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
  if (fm.size) console.log(`  [memory] ${fm.size} fact(s) loaded from Quorex for ${uid}`);
}

/* ── Pipeline complet : extraire + upsert + construire le bloc contexte ── */
export async function processFactsFromMessage(uid, text) {
  const fm = factsFor(uid);
  const mem = await extractMemory(text, [...fm.keys()]);
  const updates = [];

  const qk = mem.query_key ? normalizeKey(mem.query_key) : null;
  for (const f of mem.facts || []) {
    if (!f || !f.key || !f.value) continue;
    const k = normalizeKey(f.key);
    if (k === qk) continue;
    if (isJunkValue(f.value)) continue;
    const result = await upsertFact(uid, k, String(f.value).trim());
    if (result) updates.push(result);
  }

  // Construire le bloc a injecter dans le system prompt
  const known = [...fm.entries()].map(([k, v]) => `${k} = ${v.value}`);
  let memBlock = known.length
    ? `\n\nFaits connus sur cet utilisateur (font autorite) :\n- ${known.join("\n- ")}`
    : "";

  if (mem.query_key) {
    const k = normalizeKey(mem.query_key);
    if (fm.has(k)) memBlock += `\n\nL'utilisateur demande "${k}". Reponds directement avec : ${fm.get(k).value}.`;
    else memBlock += `\n\nL'utilisateur demande "${k}" mais ce fait est inconnu. Dis-le franchement.`;
  }

  return { updates, memBlock };
}
