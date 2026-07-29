import { PORT, KAI_MODEL, KAI_HOST, QUOREX_API_KEY, MEEREO_API_URL } from "./config.js";
import { setProvider } from "./data/index.js";
import { meereoProvider } from "./data/providers/meereo.js";
import { mockProvider } from "./data/providers/mock.js";
import app from "./app.js";

/* Initialiser le data provider — MEEREO réel si disponible, mock sinon */
const provider = MEEREO_API_URL ? meereoProvider : mockProvider;
setProvider(provider);

/* Demarrage */
app.listen(PORT, () => {
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
});
