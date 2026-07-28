/**
 * FORMULAIRE D'ÉTAPE — l'état du bouton est DÉRIVÉ du schéma.
 * C'est la correction de fond de INS-06 : on ne pose jamais `disabled` à la main.
 */
import { useCallback, useMemo, useState } from 'react';
import type { z } from 'zod';
import { collectErrors, type FieldErrors } from '../core/schemas.ts';

export function useStepForm<S extends z.ZodTypeAny>(schema: S, initial: Record<string, unknown> = {}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});

  const parsed = useMemo(() => schema.safeParse(values), [schema, values]);
  const errors = useMemo<FieldErrors>(
    () => (parsed.success ? {} : collectErrors(parsed.error)),
    [parsed],
  );

  const set = useCallback((field: string, v: unknown) => {
    setValues(p => ({ ...p, [field]: v }));
    setServerErrors(p => { if (!(field in p)) return p; const n = { ...p }; delete n[field]; return n });
  }, []);
  const blur = useCallback((field: string) => setTouched(p => ({ ...p, [field]: true })), []);

  /** On n'affiche une erreur qu'après interaction : sinon un formulaire vierge
   *  s'ouvre déjà en rouge, ce qui est décourageant et illisible. */
  const errorOf = useCallback(
    (field: string) => serverErrors[field] ?? (touched[field] ? errors[field] : undefined),
    [errors, touched, serverErrors],
  );

  const showAll = useCallback(() => setTouched(Object.fromEntries(Object.keys(values).map(k => [k, true]))), [values]);

  return {
    values, set, blur, errorOf, showAll, setServerErrors,
    isValid: parsed.success,                 // ← le bouton lit CECI, rien d'autre
    parsedValue: parsed.success ? (parsed.data as z.infer<S>) : null,
  };
}
