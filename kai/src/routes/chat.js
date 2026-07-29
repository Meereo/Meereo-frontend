import { Router } from "express";
import { orchestrate } from "../core/quorex-engine.js";

const router = Router();

/**
 * POST /api/chat
 * Headers: X-User-Id (requis), X-User-Type (optionnel)
 * Body: { message: string, confirmationId?: string }
 */
router.post("/", async (req, res, next) => {
  try {
    const { message, confirmationId } = req.body;
    if (!message && !confirmationId) {
      return res.status(400).json({ error: "Le champ 'message' est requis." });
    }

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
