import { useState, useMemo, useCallback } from 'react'

/**
 * useStepForm — validation hook pour le wizard d'onboarding.
 *
 * isValid est un booléen DÉRIVÉ du schéma et de values — le bouton Continuer
 * le lit directement. PIÈGE CONNU (Partie VI) : errors est recréé à chaque
 * appel ; ne JAMAIS le mettre dans un useEffect ou un tableau de dépendances,
 * sinon l'effet boucle et le bouton reste désactivé.
 *
 * @param {object} values      - Valeurs courantes du formulaire
 * @param {object} schema      - { fieldName: (value, allValues) => errorMsg | null }
 * @returns {{ isValid: boolean, errors: object, validate: () => object }}
 */
export default function useStepForm(values, schema) {
  // Compute errors directly from values + schema — no state, no effect.
  // This is intentionally recomputed every render (cheap validation functions).
  const result = useMemo(() => {
    if (!schema) return { errors: {}, isValid: true }
    const errs = {}
    let valid = true
    for (const [field, check] of Object.entries(schema)) {
      const msg = check(values[field], values)
      if (msg) {
        errs[field] = msg
        valid = false
      }
    }
    return { errors: errs, isValid: valid }
  }, [values, schema])

  // validate() returns the errors object for imperative use (e.g. showing toasts)
  const validate = useCallback(() => result.errors, [result.errors])

  return {
    isValid: result.isValid,
    errors: result.errors,
    validate,
  }
}
