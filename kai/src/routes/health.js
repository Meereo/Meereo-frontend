import { Router } from "express";
import { Ollama } from "ollama";
import { KAI_MODEL, KAI_HOST } from "../config.js";
import { memory } from "../memory/quorex-memory.js";

const router = Router();
const startedAt = Date.now();

router.get("/", async (_req, res) => {
  let ollamaOk = false;
  try {
    const ai = new Ollama({ host: KAI_HOST });
    await ai.list();
    ollamaOk = true;
  } catch { /* offline */ }

  const quorexStats = await memory.stats();

  res.json({
    status: ollamaOk ? "ok" : "degraded",
    model: KAI_MODEL,
    ollama: { host: KAI_HOST, connected: ollamaOk },
    quorex: { connected: memory.enabled, stats: quorexStats },
    uptime: Math.round((Date.now() - startedAt) / 1000),
  });
});

export default router;
