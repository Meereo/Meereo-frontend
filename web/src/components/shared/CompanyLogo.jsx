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

export default function CompanyLogo({ pro, size = 40, rounded = false, style: extraStyle }) {
  const { url, color, initials } = resolveLogo(pro)

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
