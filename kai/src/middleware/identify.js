import { resolveActor } from "../actors/index.js";

/**
 * Middleware QUOREX Etape 1 : Identification.
 * Lit X-User-Id et X-User-Type depuis les headers.
 * Attache req.kai avec le contexte utilisateur.
 */
export function identify(req, res, next) {
  const userId = req.headers["x-user-id"] || req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Header X-User-Id ou query param userId requis." });
  }

  const userType = req.headers["x-user-type"] || req.query.userType || "client";
  const actor = resolveActor(userType);

  req.kai = { userId, userType, actor };
  next();
}
