import { Ollama } from "ollama";
import { KAI_MODEL, KAI_HOST } from "../config.js";
import { dispatch } from "../tools/dispatcher.js";

const ai = new Ollama({ host: KAI_HOST });

const MAX_TOOL_ROUNDS = 6;

/**
 * Boucle agent : LLM + tool calls iteratives.
 * @param {object} opts
 * @param {string} opts.system       - System prompt complet
 * @param {string} opts.userText     - Message utilisateur
 * @param {boolean} opts.allowSend   - Autoriser l'envoi direct de notifications
 * @param {Array}  [opts.tools]      - Outils disponibles (defaut: tous)
 * @param {function} [opts.onToken]  - Callback streaming (recoit chaque token)
 * @returns {{ text: string, ctx: { allowSend, pending, sent } }}
 */
export async function runAgent({ system, userText, allowSend, tools, onToken }) {
  const ctx = { allowSend, pending: [], sent: [] };
  const messages = [
    { role: "system", content: system },
    { role: "user", content: userText },
  ];

  for (let step = 0; step < MAX_TOOL_ROUNDS; step++) {
    // Tool-call rounds : toujours sans streaming
    const resp = await ai.chat({
      model: KAI_MODEL,
      messages,
      tools: tools || [],
      stream: false,
    });

    if (!resp?.message) {
      throw new Error(`Reponse Ollama inattendue pour "${KAI_MODEL}". Verifiez qu'Ollama tourne et que le modele est disponible.`);
    }

    const msg = resp.message;
    messages.push(msg);

    if (msg.tool_calls?.length) {
      for (const tc of msg.tool_calls) {
        const result = await dispatch(tc.function.name, tc.function.arguments || {}, ctx);
        messages.push({ role: "tool", tool_name: tc.function.name, content: JSON.stringify(result) });
      }
      continue;
    }

    // Reponse finale sans tool calls — streamer si onToken fourni
    if (onToken) {
      // Relancer le dernier round en streaming (sans outils)
      messages.pop(); // retirer la reponse non-streamee
      const stream = await ai.chat({
        model: KAI_MODEL,
        messages,
        tools: [],
        stream: true,
      });
      let text = "";
      for await (const chunk of stream) {
        const token = chunk.message?.content || "";
        if (token) {
          text += token;
          onToken(token);
        }
      }
      return { text, ctx };
    }

    return { text: msg.content || "", ctx };
  }

  return { text: "(trop d'allers-retours d'outils — interrompu)", ctx };
}
