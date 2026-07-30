import { Router } from "express";
import { orchestrate } from "../core/quorex-engine.js";

const router = Router();

/**
 * POST /api/chat
 * Headers: X-User-Id (requis), X-User-Type (optionnel)
 * Body: { message: string, confirmationId?: string }
 */
router.post("/", async (req, res, next) => {
  const { message, confirmationId } = req.body;
  if (!message && !confirmationId) {
    return res.status(400).json({ error: "Le champ 'message' est requis." });
  }

  const wantSSE = (req.headers.accept || "").includes("text/event-stream");

  // ── Mode SSE (streaming token par token) ──
  if (wantSSE) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    });

    let closed = false;
    req.on("close", () => { closed = true; });

    try {
      const result = await orchestrate({
        userId: req.kai.userId,
        userType: req.kai.userType,
        actor: req.kai.actor,
        message: message || "",
        confirmationId,
        onToken: (token) => {
          if (!closed) res.write("data: " + JSON.stringify({ token }) + "\n\n");
        },
      });

      if (!closed) {
        res.write("data: " + JSON.stringify({ done: true, ...result }) + "\n\n");
      }
    } catch (err) {
      if (!closed) {
        res.write("data: " + JSON.stringify({ error: err.message || "Erreur interne" }) + "\n\n");
      }
    }
    res.end();
    return;
  }

  // ── Mode JSON classique (retrocompatibilite) ──
  try {
    const result = await orchestrate({
      userId: req.kai.userId,
      userType: req.kai.userType,
      actor: req.kai.actor,
      message: message || "",
      confirmationId,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
