/**
 * ORCHESTRATEUR DU PARCOURS.
 * Il ne contient AUCUNE règle métier : il lit la machine (src/core/machine.ts)
 * et affiche l'étape courante. Toute la validation vient des schémas partagés.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  initialState, setRole, setStepData, advance, goBack, stepper, canGoTo,
  type OnboardingState,
} from '../core/machine.ts';
import type { StepId } from '../core/steps.ts';
import type { Role } from '../core/schemas.ts';
import { assessPro, assessSupplier } from '../core/publish-guard.ts';
import { Stepper } from './Stepper.tsx';
import {
  RoleStep, AccountStep, ProStructureStep, SupplierStructureStep,
  LogoStep, SupplierPayoutStep, SupplierProductStep, DoneStep,
} from './steps.parts.tsx';
import { api, issuesToFieldErrors, firstStepWithIssue, type SubmitResult } from './api-client.ts';
import type { OnboardingIssue } from '../core/errors.ts';

export interface OnboardingFlowProps { draftId?: string | null; initial?: OnboardingState | null }

export function OnboardingFlow({ draftId = null, initial = null }: OnboardingFlowProps) {
  const [state, setState] = useState<OnboardingState>(initial ?? initialState());
  const [issues, setIssues] = useState<OnboardingIssue[]>([]);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const draftRef = useRef<string | null>(draftId);

  const items = useMemo(() => stepper(state), [state]);

  /* INS-13 — brouillon serveur, enregistré à chaque changement d'étape.
     Le localStorage ne permet aucune reprise sur un autre appareil. */
  useEffect(() => {
    if (!state.role || state.step === 'role') return;
    const email = (state.data.account as { email?: string } | undefined)?.email ?? null;
    let cancelled = false;
    api.saveDraft({ id: draftRef.current ?? undefined, role: state.role, step: state.step, data: state.data, email })
      .then(r => { if (!cancelled && r.ok) draftRef.current = r.data.id });
    return () => { cancelled = true };
  }, [state.step, state.role, state.data]);

  const commit = useCallback((id: StepId, value: unknown) => {
    setIssues([]);
    setState(s => advance(setStepData(s, id, value)));
  }, []);

  const skip = useCallback(() => { setIssues([]); setState(s => advance(s)) }, []);
  const back = useCallback(() => { setIssues([]); setState(s => goBack(s)) }, []);
  const goTo = useCallback((id: StepId) => setState(s => (canGoTo(s, id) ? { ...s, step: id } : s)), []);

  const submit = useCallback(async () => {
    if (!state.role) return;
    setBusy(true); setIssues([]);
    const payload = {
      role: state.role,
      account: state.data.account,
      structure: state.data['pro-structure'] ?? state.data['supplier-structure'],
      logo: state.data['pro-logo'] ?? state.data['supplier-logo'],
      payout: state.data['supplier-payout'],
      product: state.data['supplier-product'] ?? null,
      draftId: draftRef.current,
    };
    const r = await api.submit(payload);
    setBusy(false);
    if (r.ok) { setResult(r.data); return }
    setIssues(r.issues);
    // Sortie d'impasse (INS-06) : on ramène l'utilisateur À L'ÉTAPE fautive.
    // Une erreur affichée loin de son champ est une impasse.
    const target = firstStepWithIssue(r.issues);
    if (target) setState(s => ({ ...s, step: target }));
  }, [state]);

  /* La soumission part quand la dernière étape de saisie est franchie. */
  useEffect(() => {
    if (state.role && state.step.endsWith('-done') && !result && !busy) void submit();
  }, [state.step, state.role, result, busy, submit]);

  if (result) {
    const email = (state.data.account as { email?: string } | undefined)?.email ?? '';
    const warnings = state.role === 'FOURNISSEUR'
      ? assessSupplier({
          hasPayoutMethod: !!state.data['supplier-payout'],
          productCount: state.data['supplier-product'] ? 1 : 0,
          hasLogo: !!state.data['supplier-logo'],
          hasDeliveryZones: true,
        }).warnings
      : state.role === 'PRO'
        ? assessPro({ sectorCount: ((state.data['pro-structure'] as { sectors?: string[] })?.sectors ?? []).length, hasLogo: !!state.data['pro-logo'], hasPresentation: false }).warnings
        : [];
    return <DoneStep role={state.role!} emailSent={result.emailVerificationSent} email={email} warnings={warnings} />;
  }

  const fieldErrors = issuesToFieldErrors(issues, state.step);
  const globalIssues = issues.filter(i => !i.field);

  return (
    <div className="mo-flow">
      {state.role ? <Stepper items={items} onGo={goTo} /> : null}

      {globalIssues.length ? (
        <div className="mo-error" role="alert">{globalIssues.map(i => <p key={i.message}>{i.message}</p>)}</div>
      ) : null}

      {state.step === 'role' ? (
        <RoleStep value={state.role} onPick={(r: Role) => setState(s => setRole(s, r))} />
      ) : null}

      {state.step === 'account' && state.role ? (
        <AccountStep role={state.role} initial={{ ...(state.data.account as object), ...fieldErrors && {} }}
                     onValid={v => commit('account', v)} onBack={back} />
      ) : null}

      {state.step === 'pro-structure' ? (
        <ProStructureStep initial={state.data['pro-structure'] as Record<string, unknown>}
                          onValid={v => commit('pro-structure', v)} onBack={back} />
      ) : null}

      {state.step === 'supplier-structure' ? (
        <SupplierStructureStep initial={state.data['supplier-structure'] as Record<string, unknown>}
                               onValid={v => commit('supplier-structure', v)} onBack={back} />
      ) : null}

      {state.step === 'pro-logo' || state.step === 'supplier-logo' ? (
        <LogoStep onValid={v => commit(state.step, v)} onSkip={skip} onBack={back} />
      ) : null}

      {state.step === 'supplier-payout' ? (
        <SupplierPayoutStep initial={state.data['supplier-payout'] as Record<string, unknown>}
                            onValid={v => commit('supplier-payout', v)} onBack={back} />
      ) : null}

      {state.step === 'supplier-product' ? (
        <SupplierProductStep onValid={v => commit('supplier-product', v)} onSkip={skip} onBack={back} />
      ) : null}

      {busy ? <p className="mo-note" role="status">Création de votre compte…</p> : null}
    </div>
  );
}
