/**
 * MACHINE DE PARCOURS — garde de progression et retour arrière.
 * Réfs : INS-06 (impossible d'atteindre l'étape N+1 sans valider l'étape N),
 *        INS-13 (le brouillon suit l'état), INS-15 (le fil est dérivé).
 *
 * PRINCIPE : la marche avant est GARDÉE, la marche arrière est TOUJOURS libre
 * et NE PERD JAMAIS de données. C'est la « sortie d'impasse » exigée par INS-06.
 */
import { isStepValid } from './schemas.ts';
import type { Role } from './schemas.ts';
import { PATHS, stepsOf, stepIndex, stepDef, type StepId, type StepDef } from './steps.ts';

export interface OnboardingState {
  role: Role | null;
  step: StepId;
  /** Données saisies, par étape. Jamais purgées lors d'un retour arrière. */
  data: Partial<Record<StepId, unknown>>;
}

export const initialState = (): OnboardingState => ({ role: null, step: 'role', data: {} });

/** Une étape est franchie si elle est facultative, ou si ses données valident. */
export function isStepSatisfied(state: OnboardingState, id: StepId): boolean {
  if (!state.role) return id === 'role' ? isStepValid(PATHS.CLIENT[0]!.schema, state.data.role ?? {}) : false;
  const def = stepDef(state.role, id);
  if (!def) return false;
  if (def.terminal) return true;
  if (!def.required) return true;
  return isStepValid(def.schema, state.data[id] ?? {});
}

/** Garde de progression : toutes les étapes obligatoires ANTÉRIEURES doivent être satisfaites. */
export function canGoTo(state: OnboardingState, target: StepId): boolean {
  if (!state.role) return target === 'role';
  const steps = stepsOf(state.role);
  const ti = stepIndex(state.role, target);
  if (ti < 0) return false;
  const ci = stepIndex(state.role, state.step);
  if (ti <= ci) return true;                       // retour arrière : toujours permis
  for (let i = 0; i < ti; i++) {
    const s = steps[i]!;
    if (s.required && !isStepSatisfied(state, s.id)) return false;
  }
  return true;
}

export function setRole(state: OnboardingState, role: Role): OnboardingState {
  if (state.role === role) return state;
  // Le rôle change : on conserve le compte (champs communs), on écarte les
  // étapes propres à l'ancien rôle qui n'existent pas dans le nouveau.
  const keep: Partial<Record<StepId, unknown>> = {};
  const valid = new Set(stepsOf(role).map(s => s.id));
  for (const [k, v] of Object.entries(state.data)) if (valid.has(k as StepId)) keep[k as StepId] = v;
  keep.role = { role };
  return { role, step: 'account', data: keep };
}

export function setStepData(state: OnboardingState, id: StepId, value: unknown): OnboardingState {
  return { ...state, data: { ...state.data, [id]: value } };
}

export function advance(state: OnboardingState): OnboardingState {
  if (!state.role) return state;
  const steps = stepsOf(state.role);
  const i = stepIndex(state.role, state.step);
  const next = steps[i + 1];
  if (!next) return state;
  if (!canGoTo(state, next.id)) return state;
  return { ...state, step: next.id };
}

export function goBack(state: OnboardingState): OnboardingState {
  if (!state.role) return state;
  const steps = stepsOf(state.role);
  const i = stepIndex(state.role, state.step);
  const prev = steps[i - 1];
  return prev ? { ...state, step: prev.id } : state;   // aucune donnée perdue
}

export interface StepperItem { id: StepId; label: string; index: number; total: number; done: boolean; current: boolean; reachable: boolean }

/** INS-15 — le fil affiché est dérivé de PATHS, jamais écrit en dur. */
export function stepper(state: OnboardingState): StepperItem[] {
  const role = state.role ?? 'CLIENT';
  const steps = stepsOf(role).filter(s => !s.terminal);
  const ci = stepIndex(role, state.step);
  return steps.map((s: StepDef, i) => ({
    id: s.id, label: s.label, index: i + 1, total: steps.length,
    done: stepIndex(role, s.id) < ci && isStepSatisfied(state, s.id),
    current: s.id === state.step,
    reachable: canGoTo(state, s.id),
  }));
}

export function isComplete(state: OnboardingState): boolean {
  if (!state.role) return false;
  return stepsOf(state.role).filter(s => !s.terminal).every(s => isStepSatisfied(state, s.id));
}
