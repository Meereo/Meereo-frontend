import { Router } from "express";
import { looksLikeRoutine, parseAutomation } from "../automations/parser.js";
import {
  activate, executeAutomation, getRawAutomation, getAutomationById,
  listAutomations, removeAutomation,
  validateDraft, rejectDraft, listPendingDrafts,
  startScheduler, stopScheduler,
} from "../automations/engine.js";

const router = Router();

/* GET /api/automations — lister */
router.get("/", (_req, res) => {
  res.json({ automations: listAutomations(), drafts: listPendingDrafts() });
});

/* POST /api/automations — creer depuis instruction NL */
router.post("/", async (req, res, next) => {
  try {
    const { instruction } = req.body;
    if (!instruction) {
      return res.status(400).json({ error: "Le champ 'instruction' est requis." });
    }

    if (!looksLikeRoutine(instruction)) {
      return res.status(422).json({
        error: "L'instruction ne ressemble pas a une routine recurrente.",
        hint: "Utilisez des formulations comme 'chaque lundi...', 'des que...', 'quand...'",
      });
    }

    const parsed = await parseAutomation(instruction);
    if (!parsed || !parsed.is_automation) {
      return res.status(422).json({ error: "Impossible de convertir l'instruction en automatisation." });
    }

    const automation = activate(parsed);
    res.status(201).json({ automation, activated: true });
  } catch (err) {
    next(err);
  }
});

/* POST /api/automations/:id/run — executer maintenant */
router.post("/:id/run", async (req, res, next) => {
  try {
    const a = getRawAutomation(+req.params.id);
    if (!a) return res.status(404).json({ error: "Automatisation introuvable." });

    const result = await executeAutomation(a);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/* POST /api/automations/:id/validate — approuver un brouillon */
router.post("/:id/validate", (req, res) => {
  const result = validateDraft(+req.params.id);
  if (!result) return res.status(404).json({ error: "Brouillon introuvable." });
  res.json(result);
});

/* POST /api/automations/:id/reject — rejeter un brouillon */
router.post("/:id/reject", (req, res) => {
  const ok = rejectDraft(+req.params.id);
  if (!ok) return res.status(404).json({ error: "Brouillon introuvable." });
  res.json({ rejected: true });
});

/* DELETE /api/automations/:id — supprimer */
router.delete("/:id", (req, res) => {
  const ok = removeAutomation(+req.params.id);
  if (!ok) return res.status(404).json({ error: "Automatisation introuvable." });
  res.json({ deleted: true });
});

/* POST /api/automations/scheduler — demarrer/arreter le scheduler */
router.post("/scheduler", (req, res) => {
  const { action } = req.body;
  if (action === "start") {
    const count = startScheduler();
    res.json({ started: true, jobs: count });
  } else if (action === "stop") {
    stopScheduler();
    res.json({ stopped: true });
  } else {
    res.status(400).json({ error: "Action invalide. Utilisez 'start' ou 'stop'." });
  }
});

export default router;
