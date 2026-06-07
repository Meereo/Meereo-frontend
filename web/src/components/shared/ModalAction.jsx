// ═══════════════════════════════════════════════════════
//  MEEREO — ModalAction
//  Wrapper métier unifié par-dessus Modal de base
//  Harmonise : props, états, permissions, loading, CTA
//  AUCUN changement visuel — même design que Modal
// ═══════════════════════════════════════════════════════

import { useState } from 'react'
import { Eye, Lock, Check } from 'lucide-react'
import Modal from './Modal'

/**
 * ModalAction — cadre commun pour tous les modals métier
 *
 * Props unifiées :
 * @param {boolean}  isOpen           - contrôle visibilité
 * @param {function} onClose          - fermeture
 * @param {string}   title            - titre du modal
 * @param {string}   subtitle         - sous-titre optionnel (contexte)
 * @param {string}   projectContext   - nom du projet lié (affiché en gris)
 * @param {React.Node} children       - contenu du body
 * @param {string}   confirmLabel     - texte du bouton principal (défaut: 'Confirmer')
 * @param {string}   cancelLabel      - texte du bouton secondaire (défaut: 'Annuler')
 * @param {string}   dangerLabel      - texte du bouton danger (optionnel)
 * @param {function} onConfirm        - action principale
 * @param {function} onDanger         - action danger (optionnel)
 * @param {boolean}  disabled         - désactive le bouton principal
 * @param {boolean}  isLoading        - affiche état loading
 * @param {boolean}  wide             - modal large
 * @param {string}   visibilityScope  - 'internal' | 'client_visible' (indicateur)
 */
export default function ModalAction({
  isOpen, onClose, title, subtitle, projectContext,
  children,
  confirmLabel = 'Confirmer', cancelLabel = 'Annuler', dangerLabel,
  onConfirm, onDanger,
  disabled = false, isLoading = false, wide = false,
  visibilityScope,
}) {
  const [success, setSuccess] = useState(false)

  const handleConfirm = async () => {
    if (disabled || isLoading) return
    try {
      await onConfirm?.()
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 600)
    } catch (e) {
      console.error('ModalAction error:', e)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    onClose()
  }

  const footer = (
    <>
      {visibilityScope && (
        <span style={{ fontSize: 9, color: 'var(--t4)', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {visibilityScope === 'client_visible' ? <><Eye size={9}/> Visible client</> : <><Lock size={9}/> Interne</>}
        </span>
      )}
      {dangerLabel && onDanger && (
        <button className="btn btn-sm" style={{ color: 'var(--err)', borderColor: 'rgba(186,26,26,.15)' }} onClick={onDanger}>{dangerLabel}</button>
      )}
      <button className="btn btn-sm" onClick={handleClose}>{cancelLabel}</button>
      <button className="btn btn-primary btn-sm" onClick={handleConfirm} disabled={disabled || isLoading} style={{ opacity: disabled ? .5 : 1 }}>
        {isLoading ? '...' : success ? <Check size={11}/> : confirmLabel}
      </button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} footer={footer} wide={wide}>
      {(subtitle || projectContext) && (
        <div style={{ marginBottom: 14 }}>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 2 }}>{subtitle}</div>}
          {projectContext && <div style={{ fontSize: 10, color: 'var(--t4)', fontWeight: 500 }}>Projet : {projectContext}</div>}
        </div>
      )}
      {children}
    </Modal>
  )
}
