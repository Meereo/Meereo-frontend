import { resolveActor } from "../actors/index.js";

/**
 * Middleware QUOREX Etape 1 : Identification.
 * Lit X-User-Id et X-User-Type depuis les headers.
 * Attache req.kai avec le contexte utilisateur.
 */
export function identify(req, res, next) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({ error: "Header X-User-Id requis." });
  }

  const userType = req.headers["x-user-type"] || "client";
  const actor = resolveActor(userType);

  req.kai = { userId, userType, actor };
  next();
}
