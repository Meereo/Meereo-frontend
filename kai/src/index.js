import { Ollama } from "ollama";
import { PORT, KAI_MODEL, KAI_HOST, QUOREX_API_KEY, MEEREO_API_URL } from "./config.js";
import { setProvider } from "./data/index.js";
import { meereoProvider } from "./data/providers/meereo.js";
import { mockProvider } from "./data/providers/mock.js";
import app from "./app.js";

/* Initialiser le data provider — MEEREO réel si disponible, mock sinon */
const provider = MEEREO_API_URL ? meereoProvider : mockProvider;
setProvider(provider);

/* Pré-charger le modèle Ollama pour éviter le cold start */
async function warmup() {
  try {
    const ai = new Ollama({ host: KAI_HOST });
    console.log(`  [warmup] Chargement du modele ${KAI_MODEL}...`);
    await ai.chat({ model: KAI_MODEL, messages: [{ role: "user", content: "ok" }], stream: false, options: { num_predict: 1 } });
    console.log(`  [warmup] Modele ${KAI_MODEL} pret.`);
  } catch (e) {
    console.warn(`  [warmup] Ollama indisponible: ${e.message}. Le modele sera charge au premier appel.`);
  }
}

/* Demarrage */
app.listen(PORT, async () => {
  console.log();
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  KAi — backend API · MEEREO ecosystem        ║");
  console.log("╚═══════════════════════════════════════════════╝");
  console.log(`  Port     : ${PORT}`);
  console.log(`  Modele   : ${KAI_MODEL}`);
  console.log(`  Ollama   : ${KAI_HOST}`);
  console.log(`  Quorex   : ${QUOREX_API_KEY ? "connecte" : "desactive (QUOREX_API_KEY absent)"}`);
  console.log(`  Data     : ${MEEREO_API_URL ? "MEEREO provider (" + MEEREO_API_URL + ")" : "mock provider"}`);
  console.log();
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/chat`);
  console.log(`  GET  /api/facts`);
  console.log(`  *    /api/automations`);
  console.log(`  GET  /api/proactive/alerts`);
  console.log(`  GET  /api/proactive/stream  (SSE)`);
  console.log();
  await warmup();
});
