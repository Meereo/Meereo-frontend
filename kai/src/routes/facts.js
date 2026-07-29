import { Router } from "express";
import { factsFor, normalizeKey } from "../memory/facts.js";
import { memory } from "../memory/quorex-memory.js";

const router = Router();

/* GET /api/facts — lister les faits de l'utilisateur courant */
router.get("/", (req, res) => {
  const fm = factsFor(req.kai.userId);
  const facts = {};
  for (const [k, v] of fm) facts[k] = v.value;
  res.json({ userId: req.kai.userId, facts });
});

/* GET /api/facts/:key — un fait specifique */
router.get("/:key", (req, res) => {
  const fm = factsFor(req.kai.userId);
  const k = normalizeKey(req.params.key);
  const entry = fm.get(k);
  if (!entry) return res.status(404).json({ error: `Fait "${k}" inconnu.` });
  res.json({ key: k, value: entry.value });
});

/* DELETE /api/facts/:key — oublier un fait */
router.delete("/:key", async (req, res) => {
  const fm = factsFor(req.kai.userId);
  const k = normalizeKey(req.params.key);
  const entry = fm.get(k);
  if (!entry) return res.status(404).json({ error: `Fait "${k}" inconnu.` });

  if (entry.vecId != null) {
    await memory.forget(req.kai.userId, entry.vecId);
  }
  fm.delete(k);

  res.json({ deleted: true, key: k });
});

export default router;
