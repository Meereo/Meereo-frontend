import { Router } from "express";
import { EventEmitter } from "node:events";
import { getData } from "../data/index.js";

const router = Router();

/* ── Bus d'evenements proactifs ── */
export const proactiveBus = new EventEmitter();
proactiveBus.setMaxListeners(100);

// Stockage des alertes non lues par userId
const alertStore = new Map(); // userId → alert[]
let alertSeq = 0;

export function pushAlert(userId, alert) {
  const entry = {
    id: ++alertSeq,
    ...alert,
    timestamp: new Date().toISOString(),
    read: false,
  };
  if (!alertStore.has(userId)) alertStore.set(userId, []);
  alertStore.get(userId).push(entry);
  proactiveBus.emit(`alert:${userId}`, entry);
  return entry;
}

/* ── GET /api/proactive/alerts — polling ── */
router.get("/alerts", (req, res) => {
  const alerts = alertStore.get(req.kai.userId) || [];
  const unread = alerts.filter(a => !a.read);
  // Marquer comme lues
  unread.forEach(a => { a.read = true; });
  res.json({ alerts: unread });
});

/* ── GET /api/proactive/stream — SSE ── */
router.get("/stream", (req, res) => {
  const userId = req.kai.userId;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Keepalive
  const keepalive = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 30000);

  // Listener pour les alertes de cet utilisateur
  const onAlert = (alert) => {
    res.write(`data: ${JSON.stringify(alert)}\n\n`);
  };

  proactiveBus.on(`alert:${userId}`, onAlert);

  req.on("close", () => {
    clearInterval(keepalive);
    proactiveBus.off(`alert:${userId}`, onAlert);
  });
});

/* ── Moteur de monitoring (background) ── */
let monitorInterval = null;

export function startMonitor(intervalMs = 60000) {
  if (monitorInterval) return;

  monitorInterval = setInterval(async () => {
    try {
      const data = getData();
      const projects = await data.getProjects();

      // Detecter les projets en retard critique (> 5 jours)
      for (const p of projects) {
        if (p.retard > 5) {
          // Pour chaque utilisateur connu, pousser une alerte
          // En prod, on filtrerait par les utilisateurs concernes par ce projet
          pushAlert("user_demo", {
            type: "budget_alert",
            severity: "warning",
            message: `Le projet "${p.nom}" a ${p.retard} jours de retard.`,
            data: { projectId: p.id, retard: p.retard },
          });
        }
      }

      // Detecter les budgets au-dessus de 85%
      for (const p of projects) {
        if (p.budget >= 85) {
          pushAlert("user_demo", {
            type: "budget_overrun",
            severity: "high",
            message: `Budget du projet "${p.nom}" a ${p.budget}% — risque de depassement.`,
            data: { projectId: p.id, budget: p.budget },
          });
        }
      }
    } catch (e) {
      console.warn("[proactive] monitor error:", e.message);
    }
  }, intervalMs);

  console.log(`[proactive] monitor started (interval: ${intervalMs}ms)`);
}

export function stopMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

export default router;
