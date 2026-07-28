/**
 * STOCKAGE — système de fichiers du serveur (décision 27/07/2026).
 *
 * ⚠️ Limite à connaître, et à ne pas découvrir en production : ce stockage NE
 * SURVIT PAS à un redéploiement sur conteneur, et ne se partage pas entre
 * plusieurs instances. Le port StoragePort existe précisément pour que le
 * passage à un stockage objet ne touche qu'un fichier.
 *
 * SYS-05 — 10 Mo par défaut, 50 Mo pour les plans.
 */
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import type { StoragePort } from '../../core/ports.ts';

export const MAX_BYTES_DEFAULT = 10 * 1024 * 1024;
export const MAX_BYTES_PLAN    = 50 * 1024 * 1024;
export const PLAN_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.rvt', '.ifc'];
const IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export function maxBytesFor(filename: string) {
  return PLAN_EXTENSIONS.includes(extname(filename).toLowerCase()) ? MAX_BYTES_PLAN : MAX_BYTES_DEFAULT;
}

export class FileTooLarge extends Error {
  size: number;
  limit: number;
  constructor(size: number, limit: number) {
    // Le message indique la limite ET le poids refusé : sans les deux,
    // l'utilisateur ne sait pas quoi corriger.
    super(`Fichier trop volumineux : ${(size / 1048576).toFixed(1)} Mo pour une limite de ${(limit / 1048576).toFixed(0)} Mo.`);
    this.size = size; this.limit = limit;
  }
}

export function createLocalStorage(rootDir: string, publicPrefix = '/uploads'): StoragePort {
  return {
    async put({ filename, mime, bytes }) {
      const limit = maxBytesFor(filename);
      if (bytes.byteLength > limit) throw new FileTooLarge(bytes.byteLength, limit);
      if (!IMAGE_MIME.includes(mime) && !PLAN_EXTENSIONS.includes(extname(filename).toLowerCase()))
        throw new Error(`Type de fichier non accepté : ${mime}`);
      await mkdir(rootDir, { recursive: true });
      const assetId = randomUUID();
      const safe = filename.replace(/[^\w.\-]/g, '_');
      await writeFile(join(rootDir, `${assetId}-${safe}`), bytes);
      return { assetId, url: `${publicPrefix}/${assetId}-${safe}` };
    },
    async remove(assetId) {
      try { await unlink(join(rootDir, assetId)) } catch { /* déjà absent */ }
    },
  };
}
