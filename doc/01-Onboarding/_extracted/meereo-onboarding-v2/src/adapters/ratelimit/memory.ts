/**
 * LIMITATION DE DÉBIT — anti-énumération d'adresses (Annexe 7).
 *
 * ⚠️ Compteur EN MÉMOIRE : valable pour un seul processus. Avec plusieurs
 * instances, chacune compte de son côté et la limite réelle est multipliée
 * par le nombre d'instances. À remplacer par un compteur partagé (Redis) dès
 * la mise à l'échelle — le port RateLimitPort est là pour ça.
 */
import type { RateLimitPort } from '../../core/ports.ts';

export function createMemoryRateLimit(): RateLimitPort {
  const hits = new Map<string, number[]>();
  return {
    async hit(key, limit, windowMs) {
      const now = Date.now();
      const arr = (hits.get(key) ?? []).filter(t => now - t < windowMs);
      if (arr.length >= limit) { hits.set(key, arr); return false }
      arr.push(now); hits.set(key, arr);
      if (hits.size > 10_000) for (const [k, v] of hits) if (!v.length) hits.delete(k);
      return true;
    },
  };
}
