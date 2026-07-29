import { Quorex } from "@quorex/sdk";
try { process.loadEnvFile(); } catch {}

const qx = new Quorex({ apiKey: process.env.QUOREX_API_KEY });
try {
  console.log("remember:", await qx.remember("user_test", "prefers Vue over React"));
  console.log("recall:", await qx.recall("user_test", "what framework?"));
  console.log("stats:", await qx.stats());
} catch (e) {
  console.error("ERREUR:", e);   // on veut l'erreur COMPLÈTE, pas juste .message
}