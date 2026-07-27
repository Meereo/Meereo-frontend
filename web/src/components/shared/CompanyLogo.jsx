/**
 * QAL-02 — Composant UNIQUE d'affichage du logo d'entreprise.
 *
 * Source unique : résout le logo via useLogo.resolveLogo() depuis le profil
 * professionnel. Affiche un placeholder unifié (initiales sur fond coloré) si
 * le logo est absent — jamais d'image cassée.
 *
 * Utiliser ce composant PARTOUT où un logo d'entreprise doit apparaître :
 * annuaire, messagerie, AO, sidebar, page publique, notifications, fiches pro.
 *
 * @example
 *   <CompanyLogo pro={professional} size={40} />
 *   <CompanyLogo pro={professional} size={28} rounded />
 */

import { resolveLogo, logoPlaceholderStyle } from '../../hooks/useLogo'

// QAL-07 — couleur déterministe à partir du nom : une même entité a TOUJOURS la
// même couleur de monogramme, sur tous les écrans. (La fiche documente 10 rendus
// différents pour une même entreprise — forme, couleur et contenu doivent être figés.)
const PALETTE = ['#1D1D1F', '#0F766E', '#7C3AED', '#B45309', '#0369A1', '#BE185D', '#4D7C0F', '#6D28D9']
function colorFromName(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
function initialsFromName(name) {
  return String(name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

export default function CompanyLogo({ pro, name, size = 40, rounded = false, style: extraStyle }) {
  // Matrice d'affichage (QAL-07) : par défaut carré arrondi ; `rounded` réservé
  // aux avatars de personnes. Une entreprise = même forme, même couleur, mêmes
  // initiales partout.
  const resolved = pro ? resolveLogo(pro) : null
  const url = resolved?.url || null
  const displayName = name || (pro && (pro.entreprise || pro.company || pro.name)) || ''
  const initials = resolved && resolved.initials !== '?' ? resolved.initials : initialsFromName(displayName)
  const color = (resolved && pro && (pro.logoColor || pro.proProfile?.logoColor || pro.fournisseurProfile?.logoColor || pro.onboardingData?.logoColor))
    ? resolved.color
    : colorFromName(displayName || '?')

  const borderRadius = rounded ? '50%' : Math.max(4, size * 0.2)
  const fontSize = Math.max(8, Math.round(size * 0.32))

  const baseStyle = {
    width: size,
    height: size,
    borderRadius,
    flexShrink: 0,
    overflow: 'hidden',
    ...extraStyle,
  }

  if (url) {
    return (
      <img
        src={url}
        alt={initials}
        style={{ ...baseStyle, objectFit: 'cover', display: 'block' }}
        onError={(e) => {
          // QAL-02: jamais d'image cassée — basculer sur le placeholder
          e.target.style.display = 'none'
          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex')
        }}
      />
    )
  }

  // Placeholder unifié (QAL-02: « même placeholder unique partout »)
  return (
    <div
      style={{
        ...baseStyle,
        ...logoPlaceholderStyle(color),
        fontSize,
      }}
      title={initials}
    >
      {initials}
    </div>
  )
}
