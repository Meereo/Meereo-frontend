/**
 * INS-04 — Badge « Vérifié par MEEREO »
 *
 * Badge vert affiché sur TOUTES les interfaces où le professionnel apparaît :
 * page publique, résultats de recherche, annuaire, appels d'offres, messagerie, etc.
 *
 * Le statut `verified` provient d'une SOURCE UNIQUE : le champ `verified` du User,
 * alimenté par le pipeline de vérification IA du RCCM (INS-01 → INS-04).
 *
 * @param {boolean} verified - Statut de vérification (depuis le profil)
 * @param {number} [size=14] - Taille du badge
 * @param {boolean} [showLabel=false] - Afficher le texte « Vérifié »
 * @param {'inline'|'tooltip'} [variant='inline'] - Mode d'affichage
 */
export default function VerifiedBadge({ verified, size = 14, showLabel = false, variant = 'inline' }) {
  if (!verified) return null

  const badge = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        ...(showLabel ? {
          padding: '2px 8px 2px 6px',
          borderRadius: 100,
          background: 'rgba(22, 163, 74, 0.08)',
          border: '1px solid rgba(22, 163, 74, 0.2)',
        } : {}),
      }}
      title="Vérifié par MEEREO"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="#16A34A"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <polyline points="8.5 12.5 11 15 16 10" stroke="#fff" strokeWidth="2.5" fill="none" />
      </svg>
      {showLabel && (
        <span style={{ fontSize: Math.max(9, size * 0.7), fontWeight: 600, color: '#16A34A', whiteSpace: 'nowrap' }}>
          Vérifié
        </span>
      )}
    </span>
  )

  return badge
}
