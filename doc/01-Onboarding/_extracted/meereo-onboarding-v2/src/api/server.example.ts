/**
 * EXEMPLE DE MONTAGE — à adapter à votre serveur existant.
 * Ce fichier n'est pas destiné à être exécuté tel quel : il montre les cinq
 * branchements à faire, et rien d'autre.
 */
import express from 'express';
import { createOnboardingRouter } from './router.onboarding.ts';
import { createLocalStorage } from '../adapters/storage/local-fs.ts';
import { createDevMailer } from '../adapters/mail/dev-logger.ts';
import { createMemoryRateLimit } from '../adapters/ratelimit/memory.ts';
import type { OnboardingDeps } from '../core/ports.ts';

export function mountOnboarding(app: express.Express, prismaDeps: Pick<OnboardingDeps, 'accounts' | 'companies' | 'drafts' | 'tx' | 'password' | 'session'>) {
  const deps: OnboardingDeps = {
    ...prismaDeps,
    mail: createDevMailer(),                 // 🔴 à remplacer avant production
    rateLimit: createMemoryRateLimit(),      // ⚠️ mono-processus
    clock: { now: () => new Date() },
    termsVersion: '2026-07-CI-v1',           // INS-10
    draftTtlDays: 30,                        // INS-13
  };
  app.use('/api/onboarding', createOnboardingRouter({
    deps,
    storage: createLocalStorage(process.env.UPLOAD_DIR ?? './uploads'),
    setSessionCookie: (res, token, expiresAt) => {
      // NAV-07 — la session doit être posée ici, sans redirection intermédiaire.
      res.cookie('meereo_session', token, {
        httpOnly: true, secure: true, sameSite: 'lax', expires: expiresAt, path: '/',
      });
    },
  }));
}
