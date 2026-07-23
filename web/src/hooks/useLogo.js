// ══════════════════════════════════════════════════════════════
//  QAL-02 — Source UNIQUE du logo d'entreprise
//  Utilisé partout où un logo doit être affiché (annuaire, messagerie,
//  AO, sidebar, page publique...). Résout le logo depuis une seule source
//  et fournit un placeholder unifié (initiales) si absent.
// ══════════════════════════════════════════════════════════════

/**
 * Résout le logo à afficher pour un professionnel donné.
 * @param {Object} pro - Objet professionnel (depuis API, store, etc.)
 *   Peut contenir : logoFileUrl, logoColor, logoShape, activeLogoType,
 *   onboardingData.logoFileUrl, proProfile.logoFileUrl, etc.
 * @returns {{ url: string|null, color: string, initials: string, isGenerated: boolean }}
 */
export function resolveLogo(pro) {
  if (!pro) return { url: null, color: '#6B7280', initials: '?', isGenerated: true }

  // Déterminer le type actif
  const activeType = pro.activeLogoType
    || pro.proProfile?.activeLogoType
    || pro.fournisseurProfile?.activeLogoType
    || 'generated'

  // URL du logo uploadé (chercher dans toutes les sources possibles)
  const fileUrl = pro.logoFileUrl
    || pro.proProfile?.logoFileUrl
    || pro.fournisseurProfile?.logoFileUrl
    || pro.onboardingData?.logoFileUrl
    || null

  // Couleur du logo généré
  const color = pro.logoColor
    || pro.proProfile?.logoColor
    || pro.fournisseurProfile?.logoColor
    || pro.onboardingData?.logoColor
    || '#6B7280'

  // Initiales pour le placeholder
  const name = pro.entreprise
    || pro.company
    || pro.name
    || pro.proProfile?.entreprise
    || pro.fournisseurProfile?.entreprise
    || pro.onboardingData?.entreprise
    || ''
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?'

  // Résoudre l'URL finale
  const url = activeType === 'uploaded' && fileUrl ? fileUrl : null

  return { url, color, initials, isGenerated: activeType !== 'uploaded' || !fileUrl }
}

/**
 * Placeholder unifié quand le logo est absent.
 * Retourne le même style partout (QAL-02: "même placeholder unique partout").
 */
export function logoPlaceholderStyle(color = '#6B7280') {
  return {
    background: color,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 12,
  }
}
